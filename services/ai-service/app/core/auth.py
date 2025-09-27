from fastapi import Header, HTTPException
from app.models.user import User

async def get_current_user(
    x_user_id: str = Header(None, alias="X-User-ID"),
    x_user_email: str = Header(None, alias="X-User-Email"),
    x_user_first_name: str = Header(None, alias="X-User-First-Name"),
    x_user_last_name: str = Header(None, alias="X-User-Last-Name"),
) -> User:
    """
    Get current user from API Gateway headers.
    All requests should come through the authenticated API Gateway.
    """
    
    if not x_user_id or not x_user_email:
        raise HTTPException(
            status_code=401,
            detail="Missing user authentication headers. Requests must come through API Gateway."
        )
    
    return User(
        id=x_user_id,
        email=x_user_email,
        firstName=x_user_first_name,
        lastName=x_user_last_name,
    )