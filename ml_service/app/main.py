from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.models import ScoreRequest, ScoreResponse
from app.scorer import TokenScorer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scorer instance
scorer_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    global scorer_instance
    
    # Startup
    logger.info("Initializing ML Scorer...")
    scorer_instance = TokenScorer()
    logger.info("ML Scorer ready!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML Scorer...")

# Create FastAPI app
app = FastAPI(
    title="Solana Token ML Scorer",
    description="Machine Learning service for token pump probability analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Solana Token ML Scorer",
        "status": "online",
        "version": "1.0.0"
    }

@app.post("/score", response_model=ScoreResponse)
async def score_token(request: ScoreRequest):
    """
    Analyze token and return pump probability score.
    
    This endpoint accepts token metadata and returns:
    - probability: 0-1 score indicating pump likelihood
    - explain: Human-readable explanation
    - factors: Contributing factors to the score
    """
    try:
        if not scorer_instance:
            raise HTTPException(status_code=503, detail="Scorer not initialized")
        
        # Calculate score
        probability, explain, factors = scorer_instance.score(request)
        
        return ScoreResponse(
            probability=probability,
            explain=explain,
            factors=factors
        )
        
    except Exception as e:
        logger.error(f"Scoring error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "scorer_loaded": scorer_instance is not None,
        "debug_mode": settings.debug
    }

# For debugging in development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)