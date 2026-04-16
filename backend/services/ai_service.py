from google import genai
from google.genai import types
import json
import os
from dotenv import load_dotenv

load_dotenv()

def analyze_resume_with_ai(pdf_bytes: bytes, job_description: str):
    """
    Analyzes a PDF resume against a job description using Google GenAI API (Free Tier).
    Returns structured JSON with analysis points.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing. You can get a free one at https://aistudio.google.com/")

    client = genai.Client(api_key=api_key)
    
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

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(data=pdf_bytes, mime_type='application/pdf'),
            prompt
        ],
        config=types.GenerateContentConfig(
            temperature=0.2,
        )
    )
    
    response_text = response.text
    
    # Clean up standard json markdown wrappers if the model ignores the prompt
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    return json.loads(response_text.strip())
