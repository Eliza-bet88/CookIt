from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.auth import router as auth_router
import backend.models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CookIt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")


@app.get("/")
def home():
    return {"message": "CookIt API is working"}
