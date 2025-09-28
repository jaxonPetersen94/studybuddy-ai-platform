from datetime import datetime
from typing import Any, Any as AnyType
from bson import ObjectId
from pydantic import ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic v2"""
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        source_type: AnyType,
        handler: Any,
    ) -> core_schema.CoreSchema:
        """Define the core schema for PyObjectId"""
        return core_schema.with_info_wrap_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        """Define JSON schema for PyObjectId"""
        json_schema = handler(schema)
        json_schema.update(type="string", format="objectid")
        return json_schema

    @classmethod
    def validate(cls, v, info=None):
        """Validate ObjectId input"""
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class MongoBaseConfig:
    """Base configuration for MongoDB Pydantic models"""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        use_enum_values=True,
    )