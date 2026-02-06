import httpx
from typing import Optional, List, Dict
import asyncio
from backend.core.configuration import fetch_environment_config

config = fetch_environment_config()


class HNAPIConnector:
    def __init__(self):
        self.base_url = config.HN_API_BASE_URL
    
    async def fetch_item_data(self, item_id: str) -> Optional[Dict]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(f"{self.base_url}/item/{item_id}.json")
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"Error fetching item {item_id}: {e}")
        return None
    
    async def locate_hiring_thread(self) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(f"{self.base_url}/user/whoishiring.json")
                
                if resp.status_code == 200:
                    user_info = resp.json()
                    submissions = user_info.get("submitted", [])
                    
                    for item_id in submissions[:20]:
                        item_data = await self.fetch_item_data(str(item_id))
                        
                        if item_data and item_data.get("type") == "story":
                            title = item_data.get("title", "").lower()
                            if "who is hiring" in title and "freelancer" not in title:
                                return str(item_id)
                        
                        await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Error locating thread: {e}")
        return None
    
    async def fetch_all_comments(self, thread_id: str) -> List[Dict]:
        thread_data = await self.fetch_item_data(thread_id)
        if not thread_data:
            return []
        
        comment_ids = thread_data.get("kids", [])
        all_comments = []
        
        batch_size = 10
        for idx in range(0, len(comment_ids), batch_size):
            batch = comment_ids[idx:idx + batch_size]
            tasks = [self.fetch_item_data(str(cid)) for cid in batch]
            results = await asyncio.gather(*tasks)
            
            for comment in results:
                if comment and comment.get("text"):
                    all_comments.append(comment)
            
            await asyncio.sleep(0.5)
        
        return all_comments
