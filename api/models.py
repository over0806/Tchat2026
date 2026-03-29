from pydantic import BaseModel
from typing import List, Optional

class JobBase(BaseModel):
    title: str
    category: str
    location: str
    salary: str
    description: List[str]
    requirements: List[str]
    count: int

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    count: Optional[int] = None

class Job(JobBase):
    id: str

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    tab: str  # 'intro' or 'match'

class ChatResponse(BaseModel):
    text: str
    filtered_jobs: Optional[List[Job]] = None
