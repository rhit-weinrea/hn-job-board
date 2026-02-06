import httpx
from typing import Optional, Dict
import json
from backend.core.configuration import fetch_environment_config
from backend.utilities.text_parser import parse_with_regex

config = fetch_environment_config()


class AIJobParser:
    def __init__(self):
        self.api_key = config.DEEPSEEK_API_KEY
        self.endpoint = config.DEEPSEEK_API_URL
        self.model_name = config.DEEPSEEK_MODEL
    
    async def parse_using_ai(self, raw_text: str) -> Optional[Dict]:
        system_instruction = """Extract job details from HackerNews posting and return JSON only:
{
  "company": "company name",
  "title": "job title",
  "location": "location",
  "remote_status": "remote/hybrid/onsite or null",
  "technologies": ["tech", "stack"],
  "salary": "salary range or null",
  "url": "application URL or null",
  "description": "brief description (max 500 chars)"
}
Return only JSON, no markdown or extra text."""
        
        user_content = f"Parse this job:\n\n{raw_text[:2000]}"
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    self.endpoint,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": user_content}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1000
                    }
                )
                
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    content = content.strip()
                    if content.startswith("```json"):
                        content = content[7:]
                    if content.startswith("```"):
                        content = content[3:]
                    if content.endswith("```"):
                        content = content[:-3]
                    content = content.strip()
                    
                    return json.loads(content)
        except Exception as e:
            print(f"AI parsing error: {e}")
        
        return None
    
    async def parse_job_content(self, raw_text: str) -> Dict:
        ai_result = await self.parse_using_ai(raw_text)
        if ai_result:
            return ai_result
        
        print("Falling back to regex parser")
        return parse_with_regex(raw_text)
