import re
from typing import Optional, Dict, List


def find_company_name(content: str) -> Optional[str]:
    company_patterns = [
        r"(?:^|\n)([A-Z][A-Za-z0-9\s&\.,']+?)\s*(?:\||is hiring|\(|—)",
        r"(?:company|Company):\s*([A-Za-z0-9\s&\.,']+)",
        r"^([A-Z][A-Za-z0-9\s&\.,']{2,40})\s*[\|\-]",
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, content)
        if match:
            name = match.group(1).strip()
            if 2 < len(name) < 100:
                return name
    return None


def find_location(content: str) -> Optional[str]:
    location_patterns = [
        r"(?:location|Location):\s*([A-Za-z\s,\-]+?)(?:\n|;|\||$)",
        r"(?:based in|in)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)",
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def determine_remote_type(content: str) -> Optional[str]:
    lower_text = content.lower()
    
    if "remote" in lower_text:
        if "no remote" in lower_text or "not remote" in lower_text:
            return "onsite"
        elif "remote ok" in lower_text or "remote friendly" in lower_text:
            return "hybrid"
        return "remote"
    
    if "onsite" in lower_text or "on-site" in lower_text:
        return "onsite"
    
    if "hybrid" in lower_text:
        return "hybrid"
    
    return None


def extract_tech_keywords(content: str) -> List[str]:
    technologies = [
        "python", "javascript", "typescript", "java", "go", "golang", "rust",
        "react", "vue", "angular", "node", "django", "flask", "fastapi",
        "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes",
        "aws", "gcp", "azure", "tensorflow", "pytorch", "graphql", "rest",
        "c\\+\\+", "c#", "ruby", "rails", "php", "laravel", "swift", "kotlin"
    ]
    
    found = []
    lower_content = content.lower()
    
    for tech in technologies:
        if re.search(r'\b' + tech + r'\b', lower_content):
            found.append(tech.replace("\\", ""))
    
    return list(set(found))


def extract_salary_info(content: str) -> Optional[str]:
    salary_patterns = [
        r"\$\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:-|to|–)\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)",
        r"salary:\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:-|to|–)\s*\$?\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)",
    ]
    
    for pattern in salary_patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return f"${match.group(1)} - ${match.group(2)}"
    return None


def extract_application_url(content: str) -> Optional[str]:
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+(?:\.[^\s<>"{}|\\^`\[\]]+)+'
    matches = re.findall(url_pattern, content)
    return matches[0] if matches else None


def parse_with_regex(raw_content: str) -> Dict:
    return {
        "company": find_company_name(raw_content),
        "title": None,
        "location": find_location(raw_content),
        "remote_status": determine_remote_type(raw_content),
        "technologies": extract_tech_keywords(raw_content),
        "salary": extract_salary_info(raw_content),
        "url": extract_application_url(raw_content),
        "description": raw_content[:500] if len(raw_content) > 500 else raw_content
    }
