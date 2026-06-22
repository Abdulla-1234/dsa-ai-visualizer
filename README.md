# dsaviz — AI-Powered Algorithm Visualizer

Paste any DSA, SQL, or system design code and watch it execute step by step. An LLM traces the logic, generates a structured execution plan, and the frontend animates every comparison, swap, pointer move, and state change — with plain-English explanations along the way.

<a href="https://dsa-ai-visualizer-fawn.vercel.app/" target="_blank" rel="noopener noreferrer">https://dsa-ai-visualizer-fawn.vercel.app/</a>

---

## 🖥️ Preview
 
> 🔍 Click any image to open fullscreen
 
<table>
  <tr>
    <td width="60%" align="center" valign="top">
      <p><b>Main Interface</b></p>
        <img src="https://github.com/user-attachments/assets/4cb73d4e-2865-47a9-8691-6daa178deda3"
          alt="dsaviz main interface"
          width="100%"
        />
    </td>
    <td width="40%" align="center" valign="top">
      <p><b>DSA Visualizer</b></p>
        <img src="https://github.com/user-attachments/assets/cef19ca5-9903-45d4-a6f6-d0c14afb09e1"
          alt="DSA visualization page"
          width="100%"
        />
      <br/><br/>
      <p><b>SQL Playground</b></p>
        <img src="https://github.com/user-attachments/assets/b9a0c590-a9af-412c-94e5-db0a357aae36"
          alt="SQL playground page"
          width="100%"
        />
    </td>
  </tr>
</table>
 
---
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-F55036?style=for-the-badge)](https://groq.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
 
*Learn Data Structures, Algorithms & SQL visually — powered by AI*
 
</div>

## Why this project exists

Most algorithm visualizers only support a handful of hardcoded examples. This one is different — it accepts **any code you write**, sends it to an LLM (Groq's Llama 3.3, with a Gemini fallback), and the model traces the actual execution logic of *your* code into a structured JSON step sequence. The frontend then renders that sequence as a smooth, interactive animation.

If your code doesn't include sample input, the AI infers reasonable input itself and clearly flags that it did so — so there's never ambiguity about what's being visualized.

---

## Features

- **Multi-domain visualization** — Data Structures & Algorithms, SQL queries, and System Design patterns (LRU Cache, Rate Limiter, Load Balancer, Consistent Hashing) in one unified tool
- **Bring your own code** — write or paste Python, JavaScript, or C++ and get a real step-by-step trace, not a canned demo
- **Smart animations** — arrays, stacks, queues, linked lists, trees, graphs, and SQL JOIN/GROUP BY/WHERE operations each get a purpose-built renderer with glide/slide transitions powered by Framer Motion
- **AI explanations per step** — every step includes a plain-English description of what's happening and why
- **Inferred-input transparency** — if your code has no sample input, the AI invents one and clearly tells you so before animating
- **SQL playground** — live schema browser, example queries, and animated JOIN/filter/aggregation diagrams against a sample relational database
- **System Design simulator** — trace classic patterns like LRU eviction, sliding-window rate limiting, and round-robin load balancing
- **Resizable, zoomable workspace** — drag-to-resize panels, zoom controls, adjustable playback speed, and step-by-step or auto-play controls
- **Dual-LLM reliability** — automatically falls back from Groq to Gemini if the primary provider hits a rate limit, so visualizations keep working
- **Dark/light mode**, full-screen layouts, and a category-grouped example library (Arrays & Sorting, Stacks & Queues, Linked Lists, Trees & Graphs, System Design)

---

## Tech stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion (animations)
- Monaco Editor (code editing with live line highlighting)
- React Router
- Axios

**Backend**
- FastAPI (Python)
- Groq API (`llama-3.3-70b-versatile`) — primary inference
- Google Gemini API (`gemini-2.0-flash`) — automatic fallback on rate limit
- Pydantic for request validation

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project structure

```
dsa-visualizer/
├── frontend/
│   ├── src/
│   │   ├── pages/              # Home, DSAPage, SQLPage, SystemDesignPage, VisualizerPage, SignInPage
│   │   ├── components/         # Visualizer, Navbar, InferredInputBanner, etc.
│   │   ├── hooks/               # useVisualizer (step state, autoplay, API calls)
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── main.py                  # FastAPI app + CORS config
│   ├── routers/
│   │   └── visualize.py         # POST /api/visualize endpoint
│   ├── services/
│   │   ├── ai_service.py        # Groq → Gemini fallback orchestration
│   │   └── prompts/             # Category-specific system prompts
│   │       ├── dsa_prompt.py
│   │       ├── sql_prompt.py
│   │       ├── system_design_prompt.py
│   │       ├── trees_prompt.py
│   │       └── stacks_queues_prompt.py
│   └── requirements.txt
│
└── README.md
```

---

## How it works

1. **You paste code** into the editor and select a category (DSA / SQL / System Design)
2. **The backend detects** the specific data structure or pattern involved (arrays, linked lists, trees, graphs, stacks, queues) and routes to the matching specialized prompt
3. **The LLM traces execution** line by line and returns a structured JSON object:
   ```json
   {
     "input_source": "user" | "inferred",
     "inferred_input_note": "string or null",
     "steps": [
       {
         "step": 1,
         "line": 4,
         "operation": "compare",
         "ds_type": "array",
         "state": [5, 3, 8, 1],
         "highlights": [0, 1],
         "pointers": { "i": 0, "j": 1 },
         "explanation": "Comparing arr[0]=5 and arr[1]=3"
       }
     ]
   }
   ```
4. **The frontend renders** the matching animation for that data structure, with the active source line highlighted in the editor and a synced step-by-step explanation panel
5. **If Groq hits its rate limit**, the backend automatically retries the same request against Gemini — no failed requests, no manual intervention

---

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:
```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Auto-deploys on push to `main`; set `VITE_API_URL` env var to the backend's Render URL |
| Backend | [Render](https://render.com) | Free tier; set `GROQ_API_KEY` and `GEMINI_API_KEY` env vars; CORS configured to allow the Vercel domain |

Get free API keys:
- Groq: [console.groq.com](https://console.groq.com)
- Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Roadmap

- [ ] User accounts and saved visualization history
- [ ] Shareable visualization links
- [ ] More system design patterns (Pub/Sub, Consistent Hashing visualizer, CDN simulation)
- [ ] Export animations as GIF/video
- [ ] Support for additional languages (Java, Go, Rust)

---

## License

MIT

---

## Author

**Abdulla**
B.Tech, Artificial Intelligence & Machine Learning — Amrita Vishwa Vidyapeetham, Bengaluru

Built as a personal project to make algorithm and system design learning more visual and intuitive — combining LLM-powered code tracing with smooth, purpose-built animations for DSA, SQL, and system design concepts.
