from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class TokenSocials(BaseModel):
    twitter: Optional[str] = None
    telegram: Optional[str] = None
    website: Optional[str] = None

class TokenMarket(BaseModel):
    price: float = Field(default=0, ge=0)
    liquidity: float = Field(default=0, ge=0)
    volume24h: float = Field(default=0, ge=0)

class RugCheckData(BaseModel):
    status: str = "unknown"
    risk: str = "unknown"
    details: Optional[Dict[str, Any]] = None

class ScoreRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    socials: Optional[TokenSocials] = None
    image: Optional[str] = None
    market: Optional[TokenMarket] = None
    rug: Optional[RugCheckData] = None

class ScoreResponse(BaseModel):
    probability: float = Field(..., ge=0, le=1)
    explain: str
    factors: Optional[Dict[str, float]] = None