"""
Cache service using Redis.
"""

import json
from typing import Optional, Any
import redis.asyncio as redis
from app.core.config import settings


class CacheService:
    """Redis cache service."""

    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
        except:
            pass
        return None

    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Set value in cache with expiration."""
        try:
            await self.redis.setex(key, expire, json.dumps(value))
            return True
        except:
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            await self.redis.delete(key)
            return True
        except:
            return False

    async def close(self):
        """Close Redis connection."""
        await self.redis.close()
