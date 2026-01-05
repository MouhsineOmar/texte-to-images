"""
FastAPI server for image generation using Stable Diffusion + LoRA
"""

import os
import io
import base64
import logging
from typing import Optional
from datetime import datetime
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
from peft import LoraConfig, get_peft_model
from PIL import Image
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_ID = "runwayml/stable-diffusion-v1-5"
LORA_ADAPTER_PATH = os.path.join(os.path.dirname(__file__), "models", "adapter_model.safetensors")
LORA_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "models", "adapter_config.json")

logger.info(f"Using device: {DEVICE}")
logger.info(f"LoRA adapter path: {LORA_ADAPTER_PATH}")

# ============================================================================
# Pydantic Models
# ============================================================================

class ImageGenerationRequest(BaseModel):
    """Request model for image generation"""
    prompt: str
    negative_prompt: Optional[str] = None
    num_inference_steps: int = 50
    guidance_scale: float = 7.5
    height: int = 512
    width: int = 512
    seed: Optional[int] = None

class ImageGenerationResponse(BaseModel):
    """Response model for image generation"""
    success: bool
    image_base64: Optional[str] = None
    error: Optional[str] = None
    timestamp: str
    generation_time: float

# ============================================================================
# Global Pipeline Instance
# ============================================================================

pipe = None

def load_model():
    """Load Stable Diffusion model with LoRA adapter"""
    global pipe
    
    try:
        logger.info("Loading Stable Diffusion model...")
        
        # Load base model
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32
        ).to(DEVICE)
        
        # Enable memory optimization
        if DEVICE == "cuda":
            pipe.enable_attention_slicing()
            # Optional: use xformers for faster attention
            try:
                pipe.enable_xformers_memory_efficient_attention()
                logger.info("Enabled xformers memory efficient attention")
            except Exception as e:
                logger.warning(f"Could not enable xformers: {e}")
        
        # Load LoRA adapter if it exists
        if os.path.exists(LORA_ADAPTER_PATH):
            logger.info("Loading LoRA adapter...")
            try:
                # Load the adapter weights directly
                from safetensors.torch import load_file
                
                adapter_state_dict = load_file(LORA_ADAPTER_PATH)
                
                # Apply LoRA to UNet
                lora_cfg = LoraConfig(
                    r=16,
                    lora_alpha=32,
                    target_modules=["to_q", "to_k", "to_v", "to_out.0"],
                    lora_dropout=0.05,
                    bias="none"
                )
                
                pipe.unet = get_peft_model(pipe.unet, lora_cfg)
                
                # Load the adapter weights
                pipe.unet.load_state_dict(adapter_state_dict, strict=False)
                
                logger.info("LoRA adapter loaded successfully")
            except Exception as e:
                logger.error(f"Error loading LoRA adapter: {e}")
                logger.warning("Continuing without LoRA adapter")
        else:
            logger.warning(f"LoRA adapter not found at {LORA_ADAPTER_PATH}")
        
        logger.info("Model loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Image Generation API",
    description="API for generating images using Stable Diffusion + LoRA",
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

# ============================================================================
# Routes
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "device": DEVICE,
        "model_loaded": pipe is not None
    }

@app.post("/api/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    """
    Generate an image from a text prompt
    
    Args:
        request: ImageGenerationRequest with prompt and generation parameters
        
    Returns:
        ImageGenerationResponse with base64 encoded image or error message
    """
    
    if not pipe:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )
    
    if not request.prompt or len(request.prompt.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty"
        )
    
    try:
        start_time = datetime.now()
        logger.info(f"Generating image for prompt: {request.prompt}")
        
        # Set seed for reproducibility
        if request.seed is not None:
            generator = torch.Generator(device=DEVICE).manual_seed(request.seed)
        else:
            generator = None
        
        # Generate image
        with torch.no_grad():
            output = pipe(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt or "",
                num_inference_steps=request.num_inference_steps,
                guidance_scale=request.guidance_scale,
                height=request.height,
                width=request.width,
                generator=generator
            )
        
        image = output.images[0]
        
        # Convert image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        generation_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Image generated successfully in {generation_time:.2f}s")
        
        return ImageGenerationResponse(
            success=True,
            image_base64=img_base64,
            timestamp=start_time.isoformat(),
            generation_time=generation_time
        )
        
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating image: {str(e)}"
        )

@app.get("/api/models")
async def get_models_info():
    """Get information about loaded models"""
    return {
        "base_model": MODEL_ID,
        "lora_adapter": "loaded" if os.path.exists(LORA_ADAPTER_PATH) else "not_found",
        "device": DEVICE,
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "cuda_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    }

# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
