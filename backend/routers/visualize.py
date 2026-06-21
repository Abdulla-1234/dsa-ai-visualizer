# backend/routers/visualize.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_steps

router = APIRouter()


class VisualizeRequest(BaseModel):
    code: str
    language: str
    category: str = "dsa"


@router.post("/visualize")
async def visualize_code(request: VisualizeRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    try:
        result = await generate_steps(request.code, request.language, request.category)
        return {
            "steps": result["steps"],
            "input_source": result["input_source"],
            "inferred_input_note": result["inferred_input_note"],
        }
    except Exception as e:
        err_msg = str(e)
        if "rate_limit" in err_msg.lower() or "429" in err_msg:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please try again in a moment.")
        raise HTTPException(status_code=500, detail=f"Failed to analyze code: {err_msg}")