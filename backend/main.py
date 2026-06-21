from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import visualize

load_dotenv()

app = FastAPI(title="DSA Visualizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(visualize.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "DSA Visualizer API is running"}