import numpy as np
from typing import Dict, List, Tuple
import re
from app.models import ScoreRequest

class TokenScorer:
    """
    ML-ready scorer with feature extraction pipeline.
    Currently uses heuristics but structured for easy ML integration.
    """
    
    def __init__(self):
        # Feature weights (can be replaced with trained model)
        self.weights = {
            'has_twitter': 0.15,
            'has_telegram': 0.10,
            'has_website': 0.10,
            'high_liquidity': 0.20,
            'good_volume': 0.15,
            'low_risk': 0.20,
            'pump_keywords': 0.05,
            'scam_keywords': -0.30,
            'name_length': -0.01,  # Penalize very long names
        }
        
        self.pump_keywords = [
            'moon', 'rocket', 'pump', 'gem', '100x', '1000x',
            'pepe', 'doge', 'shiba', 'elon', 'bonk', 'lambo',
            'diamond', 'hands', 'hodl', 'ape', 'chad'
        ]
        
        self.scam_keywords = [
            'scam', 'rug', 'honeypot', 'fake', 'warning',
            'danger', 'avoid', 'stolen', 'hack'
        ]
    
    def extract_features(self, request: ScoreRequest) -> Dict[str, float]:
        """Extract numerical features from token data"""
        features = {}
        
        # Text features
        text = f"{request.name} {request.description or ''}".lower()
        features['text_length'] = len(text)
        features['name_length'] = len(request.name)
        
        # Keyword features
        features['pump_keyword_count'] = sum(
            1 for keyword in self.pump_keywords if keyword in text
        )
        features['scam_keyword_count'] = sum(
            1 for keyword in self.scam_keywords if keyword in text
        )
        
        # Social features
        features['has_twitter'] = 1.0 if request.socials and request.socials.twitter else 0.0
        features['has_telegram'] = 1.0 if request.socials and request.socials.telegram else 0.0
        features['has_website'] = 1.0 if request.socials and request.socials.website else 0.0
        features['social_count'] = sum([
            features['has_twitter'],
            features['has_telegram'],
            features['has_website']
        ])
        
        # Market features
        if request.market:
            features['liquidity'] = request.market.liquidity
            features['volume24h'] = request.market.volume24h
            features['price'] = request.market.price
            features['liquidity_log'] = np.log1p(request.market.liquidity)
            features['volume_log'] = np.log1p(request.market.volume24h)
        else:
            features.update({
                'liquidity': 0, 'volume24h': 0, 'price': 0,
                'liquidity_log': 0, 'volume_log': 0
            })
        
        # Risk features
        if request.rug:
            risk_map = {'low': 1.0, 'medium': 0.5, 'high': 0.0, 'unknown': 0.3}
            features['risk_score'] = risk_map.get(request.rug.risk.lower(), 0.3)
        else:
            features['risk_score'] = 0.3
        
        return features
    
    def score(self, request: ScoreRequest) -> Tuple[float, str, Dict[str, float]]:
        """
        Calculate pump probability score.
        Returns: (probability, explanation, factor_contributions)
        """
        features = self.extract_features(request)
        
        # Initialize score and factors
        base_score = 0.5
        factors = {}
        
        # Apply heuristic rules (replace with ML model prediction)
        score = base_score
        
        # Social presence
        if features['has_twitter']:
            score += self.weights['has_twitter']
            factors['twitter'] = self.weights['has_twitter']
        
        if features['has_telegram']:
            score += self.weights['has_telegram']
            factors['telegram'] = self.weights['has_telegram']
        
        if features['has_website']:
            score += self.weights['has_website']
            factors['website'] = self.weights['has_website']
        
        # Liquidity scoring
        if features['liquidity'] > 100000:
            score += self.weights['high_liquidity']
            factors['high_liquidity'] = self.weights['high_liquidity']
        elif features['liquidity'] < 10000:
            score -= 0.1
            factors['low_liquidity'] = -0.1
        
        # Volume scoring
        if features['volume24h'] > 50000:
            score += self.weights['good_volume']
            factors['good_volume'] = self.weights['good_volume']
        
        # Risk scoring
        if features['risk_score'] > 0.7:
            score += self.weights['low_risk']
            factors['low_risk'] = self.weights['low_risk']
        elif features['risk_score'] < 0.3:
            score -= 0.2
            factors['high_risk'] = -0.2
        
        # Keyword scoring
        if features['pump_keyword_count'] > 0:
            keyword_bonus = min(features['pump_keyword_count'] * 0.05, 0.15)
            score += keyword_bonus
            factors['pump_keywords'] = keyword_bonus
        
        if features['scam_keyword_count'] > 0:
            keyword_penalty = features['scam_keyword_count'] * 0.15
            score -= keyword_penalty
            factors['scam_keywords'] = -keyword_penalty
        
        # Clamp score
        score = max(0.01, min(0.99, score))
        
        # Generate explanation
        explain = self._generate_explanation(score, factors, features)
        
        return score, explain, factors
    
    def _generate_explanation(self, score: float, factors: Dict[str, float], features: Dict[str, float]) -> str:
        """Generate human-readable explanation"""
        positive_factors = [k for k, v in factors.items() if v > 0]
        negative_factors = [k for k, v in factors.items() if v < 0]
        
        if score > 0.7:
            base = "Strong pump potential detected! "
        elif score > 0.4:
            base = "Moderate potential with mixed signals. "
        else:
            base = "High risk detected, proceed with caution. "
        
        details = []
        if positive_factors:
            details.append(f"Positive: {', '.join(positive_factors)}")
        if negative_factors:
            details.append(f"Concerns: {', '.join(negative_factors)}")
        
        return base + " ".join(details)