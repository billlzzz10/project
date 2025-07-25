from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Prompt text for image generation", min_length=1)
    style: Optional[str] = Field(None, description="Image style, e.g., 'photorealistic', 'cinematic', 'anime'")
    aspect_ratio: Optional[str] = Field("1:1", description="Image aspect ratio, e.g., '1:1', '16:9'")


class ImageGenerationResponse(BaseModel):
    status: str = Field(..., description="Status of image generation")
    from_cache: bool = Field(..., description="True if the image was retrieved from cache")
    image_url: str = Field(..., description="URL of the generated image")
    created_at: datetime = Field(..., description="Timestamp when the image was created")


class ErrorResponse(BaseModel):
    status: str = Field("error", description="Error status")
    message: str = Field(..., description="Error details")


class HealthResponse(BaseModel):
    status: str = Field("ok", description="Service status")

