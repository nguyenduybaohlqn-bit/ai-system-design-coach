from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth")

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str

class SigninRequest(BaseModel):
    username: str
    password: str

@router.post("/signup")
def signup(signup_request: SignupRequest):
    return {"message": f"User {signup_request.username} signed up successfully!"}

@router.post("/signin")
def signin(signin_request: SigninRequest):
    return {"message": f"User {signin_request.username} signed in successfully!"}