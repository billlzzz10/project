from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Project Orion API Gateway",
    description="The central gateway for all AI Business OS services.",
    version="0.1.0",
)

@app.get("/", summary="Health Check", tags=["System"])
def read_root():
    """
    Check if the API Gateway is operational.
    """
    return JSONResponse(content={"status": "ok", "message": "API Gateway is operational."})
