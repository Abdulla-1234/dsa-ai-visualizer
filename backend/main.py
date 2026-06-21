import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure routers is imported correctly based on your directory structure
try:
    from routers import visualize
except ImportError:
    from backend.routers import visualize

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="DSA Visualizer API",
    description="FastAPI Backend for tracing code execution with LLMs and rendering animations",
    version="1.0.0"
)

# Explicitly define allowed origins to eliminate any CORS configuration ambiguity
# This covers local development ports and your production/preview Vercel domains
origins = [
    "http://localhost:5173",                     # Local Vite dev server
    "http://127.0.0.1:5173",                   # Local loopback server
    "http://localhost:3000",                     # Alternative local dev port
    "https://dsa-ai-visualizer-fawn.vercel.app"  # Your production Vercel frontend site
]

# Option to read additional allowed origins dynamically from an environment variable if needed
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    additional_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
    origins.extend(additional_origins)

# Dedup origins to keep array clean
origins = list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],                         # Allow all HTTP verbs (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],                         # Allow all headers (Content-Type, Authorization, etc.)
)

# Include the main visualization router under the "/api" prefix
app.include_router(visualize.router, prefix="/api")

@app.get("/")
def root():
    """
    Simple health-check endpoint for cloud providers (like Render)
    to verify that the server is up and responsive.
    """
    return {
        "status": "online",
        "service": "DSA Visualizer API",
        "allowed_origins": origins
    }