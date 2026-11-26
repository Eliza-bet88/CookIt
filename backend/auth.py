from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User
from pydantic import BaseModel
import hashlib
import os

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def password_is_correct(password: str, saved_password: str) -> bool:
    return hash_password(password) == saved_password


def create_token(user_id: int) -> str:
    secret_key = os.getenv("API_SECRET_KEY", "cookit-local-secret")
    return hashlib.sha256(f"{user_id}:{secret_key}".encode()).hexdigest()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if not user.email.strip() or not user.password.strip():
        raise HTTPException(status_code=400, detail="Enter email and password")
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must contain at least 6 characters")

    email = user.email.lower().strip()
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(email=email, password_hash=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    if not user.email.strip() or not user.password.strip():
        raise HTTPException(status_code=400, detail="Enter email and password")

    email = user.email.lower().strip()
    db_user = db.query(User).filter(User.email == email).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not password_is_correct(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_token(db_user.id)
    return {"access_token": token, "user_id": db_user.id}
