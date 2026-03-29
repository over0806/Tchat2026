import os
import logging
from dotenv import load_dotenv

# 載入 .env 環境變數
load_dotenv()

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from .models import Job, JobCreate, JobUpdate, ChatRequest, ChatResponse
from .services import MockChatService

# 設定 Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client
url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_KEY", "your-anon-key")
supabase: Client = None

if url and key and key != "your-anon-key":
    try:
        supabase = create_client(url, key)
        logger.info("Successfully connected to Supabase.")
    except Exception as e:
        logger.error(f"Supabase connection error: {e}")
        supabase = None
else:
    logger.warning("Supabase URL or Key is missing/default.")
    supabase = None

# Admin Secret Key
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "tchat-admin-2026")

async def verify_admin_key(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid Admin Key")
    return x_admin_key

# Mock data for Demo mode
MOCK_JOBS = [
    Job(id="1", title="【總管理處】永續金融專案研究員", category="ESG & Sustainability", location="台北市中山區中山北路二段113號", salary="待遇面議", description=["1. IFRS永續相關財務資訊專案計畫", "2. 年報永續專章撰寫與執行"], requirements=["工作經驗：1年以上"], count=1),
    Job(id="2", title="【MA 儲備幹部】數位轉型組", category="MA", location="台北市中山區中山北路二段113號", salary="待遇面議", description=["1. 參與集團數位轉型核心專案"], requirements=["學歷要求：碩士以上"], count=5),
    Job(id="3", title="【環工背景】環境管理工程師", category="Environmental", location="台北市中山區中山北路二段113號", salary="待遇面議", description=["1. 廠區環境影響評估"], requirements=["學歷要求：大學以上"], count=2),
]

@app.get("/api/jobs")
async def get_jobs():
    if not supabase:
        return MOCK_JOBS
    try:
        response = supabase.table("jobs").select("*").execute()
        return [Job(
            id=str(x["id"]),
            title=x["title"],
            category=x["category"],
            location=x["location"],
            salary=x["salary"],
            description=x["description"],
            requirements=x["requirements"],
            count=int(x["count"])
        ) for x in response.data]
    except Exception:
        return MOCK_JOBS

@app.post("/api/chat")
async def chat(request: ChatRequest):
    all_jobs = []
    if not supabase:
        all_jobs = MOCK_JOBS
    else:
        try:
            response = supabase.table("jobs").select("*").execute()
            all_jobs = [Job(
                id=str(x["id"]),
                title=x["title"],
                category=x["category"],
                location=x["location"],
                salary=x["salary"],
                description=x["description"],
                requirements=x["requirements"],
                count=int(x["count"])
            ) for x in response.data]
        except Exception:
            all_jobs = MOCK_JOBS
    
    reply_text, filtered_jobs = MockChatService.get_response(request.messages, request.tab, all_jobs)
    return ChatResponse(text=reply_text, filtered_jobs=filtered_jobs)

@app.post("/api/admin/jobs", response_model=Job)
async def create_job(job: JobCreate, admin_key: str = Depends(verify_admin_key)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not connected")
    try:
        response = supabase.table("jobs").insert(job.dict()).execute()
        return Job(id=str(response.data[0]["id"]), **response.data[0])
    except Exception as e:
        logger.error(f"Create job error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, job: JobUpdate, admin_key: str = Depends(verify_admin_key)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not connected")
    try:
        update_data = {k: v for k, v in job.dict().items() if v is not None}
        response = supabase.table("jobs").update(update_data).eq("id", job_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Job not found")
        return Job(id=str(response.data[0]["id"]), **response.data[0])
    except Exception as e:
        logger.error(f"Update job error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/jobs/{job_id}")
async def delete_job(job_id: str, admin_key: str = Depends(verify_admin_key)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not connected")
    try:
        response = supabase.table("jobs").delete().eq("id", job_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"status": "success", "deleted": job_id}
    except Exception as e:
        logger.error(f"Delete job error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status": "ok"}
