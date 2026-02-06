from typing import Dict
import re
import html
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.scrapers.hn_api_client import HNAPIConnector
from backend.scrapers.deepseek_parser import AIJobParser
from backend.data_models.models import JobPosting

# Batch commit size for database operations
BATCH_COMMIT_SIZE = 10


class JobScrapeOrchestrator:
    def __init__(self):
        self.hn_connector = HNAPIConnector()
        self.ai_parser = AIJobParser()
    
    def sanitize_html(self, html_content: str) -> str:
        text = html.unescape(html_content)
        text = re.sub(r'<p>', '\n', text)
        text = re.sub(r'<[^>]+>', '', text)
        return text.strip()
    
    async def execute_scraping(self, session: AsyncSession, force: bool = False) -> Dict:
        print("Locating latest hiring thread...")
        thread_id = await self.hn_connector.locate_hiring_thread()
        
        if not thread_id:
            return {
                "status": "error",
                "message": "Unable to locate hiring thread",
                "jobs_scraped": 0
            }
        
        print(f"Found thread: {thread_id}")
        
        if not force:
            check_stmt = select(JobPosting).where(JobPosting.source_thread_id == thread_id).limit(1)
            check_result = await session.execute(check_stmt)
            if check_result.scalar_one_or_none():
                return {
                    "status": "skipped",
                    "message": "Thread already processed. Use force_refresh=true to reprocess.",
                    "jobs_scraped": 0,
                    "thread_id": thread_id
                }
        
        print("Retrieving comments...")
        comments = await self.hn_connector.fetch_all_comments(thread_id)
        print(f"Retrieved {len(comments)} comments")
        
        saved_count = 0
        
        for comment in comments:
            try:
                cleaned_text = self.sanitize_html(comment.get("text", ""))
                
                if len(cleaned_text) < 50:
                    continue
                
                comment_id = str(comment.get("id"))
                
                existing_stmt = select(JobPosting).where(JobPosting.hn_item_id == comment_id)
                existing_result = await session.execute(existing_stmt)
                if existing_result.scalar_one_or_none() and not force:
                    continue
                
                print(f"Processing job {comment_id}...")
                parsed = await self.ai_parser.parse_job_content(cleaned_text)
                
                job_record = JobPosting(
                    hn_item_id=comment_id,
                    posting_title=parsed.get("title"),
                    company_name=parsed.get("company"),
                    job_location=parsed.get("location"),
                    remote_status=parsed.get("remote_status"),
                    tech_stack=parsed.get("technologies", []),
                    job_description=parsed.get("description"),
                    salary_range=parsed.get("salary"),
                    application_url=parsed.get("url"),
                    source_thread_id=thread_id,
                    raw_content=cleaned_text
                )
                
                session.add(job_record)
                saved_count += 1
                
                if saved_count % BATCH_COMMIT_SIZE == 0:
                    await session.commit()
                    print(f"Saved {saved_count} jobs...")
            
            except Exception as e:
                print(f"Error processing comment: {e}")
                continue
        
        await session.commit()
        
        return {
            "status": "success",
            "message": f"Scraped {saved_count} jobs successfully",
            "jobs_scraped": saved_count,
            "thread_id": thread_id
        }
