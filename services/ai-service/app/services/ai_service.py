import asyncio
import json
import litellm
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, List, Optional, Union
from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.exceptions import AIServiceError, ModelNotFoundError, RateLimitError

settings = get_settings()
logger = get_logger(__name__)

# Configure LiteLLM with API keys
if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
    litellm.openai_key = settings.OPENAI_API_KEY

if hasattr(settings, 'ANTHROPIC_API_KEY') and settings.ANTHROPIC_API_KEY:
    litellm.anthropic_key = settings.ANTHROPIC_API_KEY

if hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY:
    litellm.google_key = settings.GOOGLE_API_KEY

# Configure timeout
litellm.request_timeout = settings.AI_REQUEST_TIMEOUT or 60.0


class AIService:
    """Service for handling AI model interactions and streaming responses using LiteLLM"""
    
    def __init__(self):
        self.default_model = settings.DEFAULT_AI_MODEL or "gpt-4"
        self.max_tokens = settings.AI_MAX_TOKENS or 4000
        self.temperature = settings.AI_TEMPERATURE or 0.7
        
        # Supported models mapping
        self.supported_models = {
            # OpenAI
            "gpt-4": "openai",
            "gpt-4-turbo": "openai", 
            "gpt-4-turbo-preview": "openai",
            "gpt-4-vision-preview": "openai",
            "gpt-3.5-turbo": "openai",
            "gpt-3.5-turbo-16k": "openai",
            
            # Anthropic
            "claude-3-opus-20240229": "anthropic",
            "claude-3-sonnet-20240229": "anthropic",
            "claude-3-haiku-20240307": "anthropic",
            "claude-2.1": "anthropic",
            "claude-2": "anthropic",
            "claude-instant-1.2": "anthropic",
            
            # Google
            "gemini-pro": "google",
            "gemini-pro-vision": "google"
        }
        
        logger.info("AI Service initialized with LiteLLM")
    
    async def stream_chat_completion(
        self, 
        request_data: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat completion from AI models using LiteLLM
        
        Args:
            request_data: Dictionary containing:
                - messages: List of conversation messages
                - model_config: Model configuration options
                - attachments: List of file attachments (optional)
                - user_id: User ID for logging/tracking
                - session_id: Session ID for context
        
        Yields:
            Dictionary chunks containing streaming response data
        """
        try:
            messages = request_data.get("messages", [])
            model_config = request_data.get("model_config", {})
            attachments = request_data.get("attachments", [])
            user_id = request_data.get("user_id")
            session_id = request_data.get("session_id")
            
            # Determine which model to use
            model_name = model_config.get("model", self.default_model)
            
            # Validate model is supported
            if model_name not in self.supported_models:
                logger.warning(f"Unknown model {model_name}, attempting to use with LiteLLM")
            
            # Process attachments and add to messages if any
            if attachments:
                messages = await self._process_attachments(messages, attachments)
            
            # Prepare model parameters
            model_params = self._prepare_model_parameters(model_config, model_name)
            
            # Log the request
            logger.info(f"Starting AI stream for user {user_id}, session {session_id}, model {model_name}")
            
            # Stream from LiteLLM
            async for chunk in self._stream_litellm_completion(messages, model_params):
                yield chunk
                
        except Exception as e:
            logger.error(f"Error in stream_chat_completion: {str(e)}")
            yield {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _stream_litellm_completion(
        self, 
        messages: List[Dict[str, Any]], 
        model_params: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream completion from any LLM provider using LiteLLM"""
        try:
            # Create streaming completion using LiteLLM
            response = await litellm.acompletion(
                messages=messages,
                stream=True,
                **model_params
            )
            
            async for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    choice = chunk.choices[0]
                    
                    # Handle content delta
                    if choice.delta and choice.delta.content:
                        yield {
                            "type": "content",
                            "content": choice.delta.content,
                            "timestamp": datetime.now().isoformat()
                        }
                    
                    # Handle function calls (legacy format)
                    if choice.delta and hasattr(choice.delta, 'function_call') and choice.delta.function_call:
                        function_call = choice.delta.function_call
                        if function_call.name:
                            yield {
                                "type": "function_call",
                                "function_name": function_call.name,
                                "arguments": function_call.arguments or "",
                                "timestamp": datetime.now().isoformat()
                            }
                    
                    # Handle tool calls (newer format)
                    if choice.delta and hasattr(choice.delta, 'tool_calls') and choice.delta.tool_calls:
                        for tool_call in choice.delta.tool_calls:
                            if tool_call.function:
                                yield {
                                    "type": "function_call",
                                    "function_name": tool_call.function.name,
                                    "arguments": tool_call.function.arguments or "",
                                    "timestamp": datetime.now().isoformat()
                                }
                    
                    # Handle completion
                    if choice.finish_reason:
                        yield {
                            "type": "completion",
                            "finish_reason": choice.finish_reason,
                            "timestamp": datetime.now().isoformat()
                        }
                        
        except litellm.RateLimitError as e:
            logger.error(f"Rate limit error: {str(e)}")
            raise RateLimitError(f"Rate limit exceeded: {str(e)}")
        except litellm.APIError as e:
            logger.error(f"API error: {str(e)}")
            raise AIServiceError(f"API error: {str(e)}")
        except Exception as e:
            logger.error(f"Error in LiteLLM streaming: {str(e)}")
            raise AIServiceError(f"LiteLLM streaming error: {str(e)}")
    
    def _prepare_model_parameters(
        self, 
        model_config: Dict[str, Any], 
        model_name: str
    ) -> Dict[str, Any]:
        """Prepare model parameters from configuration"""
        params = {
            "model": model_name,
            "max_tokens": model_config.get("max_tokens", self.max_tokens),
            "temperature": model_config.get("temperature", self.temperature),
            "top_p": model_config.get("top_p", 1.0),
        }
        
        # Add OpenAI-specific parameters (LiteLLM handles conversion)
        if model_config.get("frequency_penalty") is not None:
            params["frequency_penalty"] = model_config["frequency_penalty"]
        if model_config.get("presence_penalty") is not None:
            params["presence_penalty"] = model_config["presence_penalty"]
        
        # Add Anthropic-specific parameters (LiteLLM handles conversion)
        if model_config.get("top_k") is not None:
            params["top_k"] = model_config["top_k"]
        
        # Add function calling if configured
        if model_config.get("functions"):
            params["functions"] = model_config["functions"]
        if model_config.get("tools"):
            params["tools"] = model_config["tools"]
        
        return params
    
    async def _process_attachments(
        self, 
        messages: List[Dict[str, Any]], 
        attachments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Process file attachments and add them to messages"""
        try:
            # Find the last user message to attach files
            for i in range(len(messages) - 1, -1, -1):
                if messages[i].get("role") == "user":
                    content = messages[i].get("content", "")
                    
                    # Process each attachment
                    for attachment in attachments:
                        file_type = attachment.get("file_type", "")
                        file_content = attachment.get("content", "")
                        file_name = attachment.get("filename", "")
                        
                        if file_type.startswith("image/"):
                            # Handle image attachments
                            content += f"\n\n[Image attached: {file_name}]"
                            # For vision models, you would add the image data here
                            
                        elif file_type.startswith("text/") or file_type == "application/json":
                            # Handle text-based files
                            content += f"\n\n[File: {file_name}]\n{file_content}\n[End of file]"
                            
                        elif file_type == "application/pdf":
                            # Handle PDF files (would need text extraction)
                            content += f"\n\n[PDF attached: {file_name}]"
                            
                        else:
                            # Handle other file types
                            content += f"\n\n[File attached: {file_name} ({file_type})]"
                    
                    messages[i]["content"] = content
                    break
            
            return messages
            
        except Exception as e:
            logger.error(f"Error processing attachments: {str(e)}")
            return messages
    
    async def generate_suggestions(
        self, 
        conversation_history: List[Dict[str, Any]], 
        context: Optional[str] = None
    ) -> List[str]:
        """Generate conversation suggestions based on history and context"""
        try:
            # Prepare prompt for generating suggestions
            recent_messages = conversation_history[-3:] if conversation_history else []
            
            prompt = "Based on the following conversation, suggest 3-5 helpful follow-up questions or prompts:\n\n"
            
            for msg in recent_messages:
                role = msg.get("role", "").title()
                content = msg.get("content", "")[:200]  # Truncate for brevity
                prompt += f"{role}: {content}\n"
            
            if context:
                prompt += f"\nAdditional context: {context}\n"
            
            prompt += "\nGenerate concise, helpful suggestions (one per line):"
            
            # Use the default model to generate suggestions
            suggestions_response = await self._generate_simple_completion(prompt)
            
            # Parse suggestions from response
            suggestions = []
            if suggestions_response:
                lines = suggestions_response.strip().split('\n')
                for line in lines:
                    cleaned = line.strip().lstrip('1234567890.-• ')
                    if cleaned and len(cleaned) > 10:
                        suggestions.append(cleaned)
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            logger.error(f"Error generating suggestions: {str(e)}")
            return []
    
    async def _generate_simple_completion(self, prompt: str) -> Optional[str]:
        """Generate a simple completion for utility functions using LiteLLM"""
        try:
            response = await litellm.acompletion(
                model=self.default_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )
            
            if response.choices and len(response.choices) > 0:
                return response.choices[0].message.content
            
            return None
            
        except Exception as e:
            logger.error(f"Error in simple completion: {str(e)}")
            return None
    
    async def moderate_content(self, content: str) -> Dict[str, Any]:
        """Moderate content for safety and policy compliance"""
        try:
            # Use OpenAI's moderation endpoint through LiteLLM
            response = await litellm.amoderation(input=content)
            
            if response.results:
                result = response.results[0]
                return {
                    "flagged": result.flagged,
                    "categories": dict(result.categories),
                    "category_scores": dict(result.category_scores) if hasattr(result, 'category_scores') else {}
                }
            
            return {"flagged": False, "categories": {}}
            
        except Exception as e:
            logger.error(f"Error in content moderation: {str(e)}")
            return {"flagged": False, "categories": {}}
    
    async def summarize_conversation(
        self, 
        messages: List[Dict[str, Any]], 
        max_length: int = 200
    ) -> str:
        """Generate a summary of the conversation"""
        try:
            # Prepare conversation text
            conversation_text = ""
            for msg in messages:
                role = msg.get("role", "").title()
                content = msg.get("content", "")
                conversation_text += f"{role}: {content}\n"
            
            # Truncate if too long
            if len(conversation_text) > 3000:
                conversation_text = conversation_text[:3000] + "..."
            
            prompt = f"""Summarize the following conversation in {max_length} characters or less:

{conversation_text}

Summary:"""
            
            summary = await self._generate_simple_completion(prompt)
            
            if summary and len(summary) > max_length:
                summary = summary[:max_length-3] + "..."
            
            return summary or "Conversation summary unavailable"
            
        except Exception as e:
            logger.error(f"Error summarizing conversation: {str(e)}")
            return "Conversation summary unavailable"
    
    async def get_model_info(self, model_name: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        try:
            provider = self.supported_models.get(model_name, "unknown")
            
            model_info = {
                "name": model_name,
                "provider": provider,
                "available": model_name in self.supported_models,
                "context_length": 4096,  # Default
                "supports_functions": False,
                "supports_vision": False
            }
            
            # Model-specific information
            if "gpt-4" in model_name:
                model_info.update({
                    "context_length": 8192 if "turbo" in model_name else 8192,
                    "supports_functions": True,
                    "supports_vision": "vision" in model_name
                })
            elif "gpt-3.5" in model_name:
                model_info.update({
                    "context_length": 16384 if "16k" in model_name else 4096,
                    "supports_functions": True
                })
            elif "claude" in model_name:
                model_info.update({
                    "context_length": 200000,  # Claude has large context
                    "supports_functions": False,
                    "supports_vision": "3" in model_name  # Claude 3 supports vision
                })
            elif "gemini" in model_name:
                model_info.update({
                    "context_length": 32768,
                    "supports_functions": True,
                    "supports_vision": "vision" in model_name
                })
            
            return model_info
            
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return {"name": model_name, "available": False}
    
    async def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available AI models"""
        try:
            models = []
            
            for model_name, provider in self.supported_models.items():
                models.append({
                    "name": model_name,
                    "provider": provider,
                    "type": "chat"
                })
            
            return models
            
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check the health of AI service connections"""
        health_status = {
            "status": "healthy",
            "providers": {},
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            # Test different providers through LiteLLM
            test_models = [
                ("gpt-3.5-turbo", "openai"),
                ("claude-3-haiku-20240307", "anthropic"),
                ("gemini-pro", "google")
            ]
            
            for model, provider in test_models:
                try:
                    # Make a minimal request to test connection
                    response = await litellm.acompletion(
                        model=model,
                        messages=[{"role": "user", "content": "test"}],
                        max_tokens=1
                    )
                    health_status["providers"][provider] = "healthy"
                except Exception as e:
                    health_status["providers"][provider] = f"unhealthy: {str(e)}"
                    if health_status["status"] == "healthy":
                        health_status["status"] = "degraded"
            
            if not health_status["providers"]:
                health_status["status"] = "unhealthy"
                health_status["error"] = "No AI providers available"
                
        except Exception as e:
            logger.error(f"Error in health check: {str(e)}")
            health_status["status"] = "unhealthy"
            health_status["error"] = str(e)
        
        return health_status