from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import pdf_routes, verify_routes, auth_routes, student_routes, document_routes
from app.db.database import engine, Base
from app.utils.crypto_utils import generate_keys_and_cert
from app.utils.logger import logger
import os


Base.metadata.create_all(bind=engine)


app = FastAPI(title=settings.PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up the PDF Digital Signing & Verification System...")
    
    
    generate_keys_and_cert()
    
    
    os.makedirs(settings.GENERATED_FILES_DIR, exist_ok=True)
    os.makedirs(settings.LOGS_DIR, exist_ok=True)


app.include_router(pdf_routes.router)
app.include_router(verify_routes.router)
app.include_router(auth_routes.router)
app.include_router(student_routes.router)
app.include_router(document_routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the PDF Digital Signing API"}
