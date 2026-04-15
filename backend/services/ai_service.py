import anthropic
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

def analyze_resume_with_claude(pdf_bytes: bytes, job_description: str):
    """
    Analyzes a PDF resume against a job description using Claude API.
    Returns structured JSON with analysis points.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is missing. Keep the server un-interrupted until key is added.")

    client = anthropic.Anthropic(api_key=api_key)
    
    b64_pdf = base64.standard_b64encode(pdf_bytes).decode("utf-8")
    
    prompt = f"""You are an expert ATS (Applicant Tracking System) and HR professional. 
Analyze the provided resume against the provided Job Description.

Job Description:
{job_description}

Return ONLY valid JSON with the following exact structure:
{{
  "ats_score": <integer from 0 to 100>,
  "match_level": "Excellent" | "Good" | "Fair" | "Poor",
  "summary": "<2-3 sentence overview of the candidate's fit>",
  "matched_skills": ["<skill1>", "<skill2>"],
  "missing_skills": ["<skill1>", "<skill2>"],
  "experience_match": "<brief analysis of how their experience aligns>",
  "education_match": "<brief analysis of how their education aligns>",
  "suggestions": [
    {{"priority": "High" | "Medium" | "Low", "action": "<what to do>", "reason": "<why>"}}
  ],
  "keywords_found": ["<keyword1>"],
  "keywords_missing": ["<keyword1>"]
}}

Do NOT wrap the output in markdown code blocks like ```json. JUST return the raw text representing the valid JSON object.
"""

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        temperature=0.2, # Low temp for consistent JSON
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document", 
                    "source": {
                        "type": "base64", 
                        "media_type": "application/pdf", 
                        "data": b64_pdf
                    }
                },
                {
                    "type": "text", 
                    "text": prompt
                }
            ]
        }]
    )
    
    response_text = message.content[0].text
    
    # Simple cleanup in case the model returns markdown codeblocks anyway
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    return json.loads(response_text.strip())
