# backend/services/ai_service.py
import os
import json
import re
from dotenv import load_dotenv
from groq import Groq
from google import genai as google_genai

load_dotenv()

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])
gemini_client = google_genai.Client(api_key=os.environ["GEMINI_API_KEY"])

GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-2.0-flash"


def clean_json(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'\s*```\s*$', '', raw, flags=re.MULTILINE)
    raw = raw.strip()
    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1 and end > start:
        return raw[start:end + 1]
    # fallback: maybe it's a raw array (old format)
    start = raw.find('[')
    end = raw.rfind(']')
    if start != -1 and end != -1 and end > start:
        return raw[start:end + 1]
    return raw


def _build_user_message(code: str, language: str) -> str:
    return f"""Language: {language}

Code:
{code}

Trace every step. Return ONLY the JSON object described in the system prompt."""


def _call_groq(code: str, language: str, system_prompt: str) -> str:
    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _build_user_message(code, language)},
        ],
        temperature=0.05,
        max_tokens=8000,
    )
    return response.choices[0].message.content


def _call_gemini(code: str, language: str, system_prompt: str) -> str:
    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=f"{system_prompt}\n\n{_build_user_message(code, language)}",
    )
    return response.text


def detect_category(code: str, category: str) -> str:
    if category != 'dsa':
        return category
    code_lower = code.lower()
    if any(k in code_lower for k in ['node', '.next', 'linked', 'head']):
        return 'linked-lists'
    if any(k in code_lower for k in ['root', 'treenode', 'inorder', 'preorder']):
        return 'trees'
    if any(k in code_lower for k in ['graph', 'bfs', 'dfs', 'neighbor']):
        return 'graphs'
    if any(k in code_lower for k in ['deque', 'popleft', 'queue']):
        return 'stacks-queues'
    if any(k in code_lower for k in ['.append', '.pop()', 'stack']):
        if 'popleft' not in code_lower:
            return 'stacks-queues'
    return 'dsa'


async def generate_steps(code: str, language: str, category: str = 'dsa') -> dict:
    from services.prompts import get_prompt

    refined = detect_category(code, category)
    system_prompt = get_prompt(refined)

    raw = None
    last_error = None

    try:
        print(f"[ai] trying Groq for category={refined}")
        raw = _call_groq(code, language, system_prompt)
    except Exception as groq_error:
        err_str = str(groq_error).lower()
        print(f"[ai] Groq failed: {err_str[:200]}")
        if "rate_limit" in err_str or "429" in err_str or "quota" in err_str:
            last_error = groq_error
        else:
            raise

    if raw is None:
        try:
            print(f"[ai] falling back to Gemini for category={refined}")
            raw = _call_gemini(code, language, system_prompt)
        except Exception as gemini_error:
            print(f"[ai] Gemini also failed: {str(gemini_error)[:200]}")
            raise gemini_error from last_error

    cleaned = clean_json(raw)
    parsed = json.loads(cleaned)

    # Support both new format (dict with steps/input_source) and old format (plain list)
    if isinstance(parsed, list):
        return {
            "steps": parsed,
            "input_source": "user",
            "inferred_input_note": None,
        }

    return {
        "steps": parsed.get("steps", []),
        "input_source": parsed.get("input_source", "user"),
        "inferred_input_note": parsed.get("inferred_input_note"),
    }