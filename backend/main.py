from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from services.ai_service import analyze_resume_with_ai

app = FastAPI(title="Resume Match AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_resume(resume: UploadFile = File(...), job_description: str = Form(...)):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        pdf_bytes = await resume.read()
        
        # Call the AI service
        result = analyze_resume_with_ai(pdf_bytes, job_description)
        
        # Ensure it's valid JSON
        if isinstance(result, str):
            score_data = json.loads(result)
        else:
            score_data = result
            
        return score_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
