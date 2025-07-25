from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.schemas import (
    ImageGenerationRequest, 
    ImageGenerationResponse, 
    ErrorResponse, 
    HealthResponse
)
from app.utils.helpers import validate_aspect_ratio, generate_cache_key
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Image Generation Microservice",
    description="A microservice for generating images using Vertex AI Imagen 2",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Depends

# Dependency injection for services
def get_services():
    try:
        from app.services.image_generator import VertexAIImageGenerator
        from app.services.storage import CloudStorageService
        from app.services.cache import CacheService

        image_generator = VertexAIImageGenerator()
        storage_service = CloudStorageService()
        cache_service = CacheService()
        logger.info("All services initialized successfully")
        return image_generator, storage_service, cache_service
    except Exception as e:
        logger.warning(f"Failed to initialize services: {str(e)}")
        logger.info("Running in demo mode - services will return mock responses")
        return None, None, None


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse()


@app.post("/v1/images/generate", response_model=ImageGenerationResponse)
async def generate_image(
    request: ImageGenerationRequest,
    services=Depends(get_services)
):
    """
    Generate an image from text prompt using Vertex AI Imagen 2
    """
    try:
        # Validate aspect ratio
        if request.aspect_ratio and not validate_aspect_ratio(request.aspect_ratio):
            raise HTTPException(
                status_code=400,
                detail="Invalid aspect ratio format. Use format like '1:1' or '16:9'"
            )

        image_generator, storage_service, cache_service = services

        # Check if services are available
        if not all([image_generator, storage_service, cache_service]):
            # Return mock response when services are not available
            logger.info("Services not available, returning mock response")
            return ImageGenerationResponse(
                status="success",
                from_cache=False,
                image_url="https://via.placeholder.com/512x512.png?text=Demo+Mode",
                created_at=datetime.now()
            )

        # Generate cache key
        cache_key = generate_cache_key(
            request.prompt, 
            request.style, 
            request.aspect_ratio
        )

        # Check cache first
        cached_data = await cache_service.get_cached_image(cache_key)
        if cached_data:
            return ImageGenerationResponse(
                status="success",
                from_cache=True,
                image_url=cached_data["image_url"],
                created_at=datetime.fromisoformat(cached_data["created_at"])
            )

        # Generate new image
        image_bytes, image_format = image_generator.generate_image(
            request.prompt,
            request.style,
            request.aspect_ratio or "1:1"
        )

        # Upload to storage
        image_url = storage_service.upload_image(image_bytes, image_format)

        # Cache the result
        created_at = datetime.now()
        await cache_service.cache_image(cache_key, image_url, created_at)

        return ImageGenerationResponse(
            status="success",
            from_cache=False,
            image_url=image_url,
            created_at=created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

