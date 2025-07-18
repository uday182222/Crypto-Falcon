from fastapi import FastAPI
from app.routes.auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crypto Backend!"}

# To run: uvicorn app.main:app --reload 