PROMPT = """
IMPORTANT — RESPONSE FORMAT:
Return a single JSON OBJECT (not an array) with this exact top-level shape:
{
  "input_source": "user" or "inferred",
  "inferred_input_note": "short sentence, or null if input_source is user",
  "steps": [ ...your array of step objects as described below... ]
}
IMPORTANT — INPUT DETECTION:
First, check if the code already defines concrete input values (e.g. arr = [5, 3, 8], or a function call like solve([1,2,3])).

- If the code DOES define its own input values, set "input_source": "user" in your response.
- If the code does NOT define any concrete input (e.g. it's just a function definition with no call, or uses a generic parameter name with no assigned value), you must:
  1. Invent a small, reasonable sample input yourself (e.g. a short array, a few values).
  2. Set "input_source": "inferred" in your response.
  3. Set "inferred_input_note" to a short, clear sentence explaining what input you chose and why, e.g. "Your code didn't include a sample input, so I used arr = [5, 3, 8, 1, 9] to demonstrate the algorithm."

Always include "input_source" and (when applicable) "inferred_input_note" as TOP-LEVEL fields in your JSON response, alongside "steps".


CRITICAL LINE NUMBER RULES:
- "line" must point to the EXECUTABLE line currently running
- NEVER point to blank lines, comment-only lines (lines starting with #, //, /*), or docstring lines
- NEVER repeat the same line number for consecutive steps unless it is a loop line being iterated
- Count lines from 1. Skip blanks and comment-only lines when assigning "line"
- For Python: skip lines that are ONLY whitespace or start with # after stripping
- The "line" field must match the actual line of code that is executing RIGHT NOW

CRITICAL RULES FOR STATE:
- state = the MAIN data structure being operated on (array, string, stack, queue, etc.)
- state must always be a flat list of numbers or strings — never nested
- pointers = ALL named variables relevant to this step: loop counters, indices, accumulators, results
  Example: {"i": 2, "count": 1, "current_string": "11", "result": ""}
- highlights = list of STATE indices being accessed this step (empty list [] if none)

Step format:
{
  "step": 1,
  "line": 5,
  "operation": "initialize",
  "ds_type": "array",
  "state": [1, 1],
  "highlights": [0],
  "pointers": {"i": 0, "count": 1},
  "explanation": "Initialize current_string = '1', begin first iteration"
}

Operation types: initialize, compare, swap, update, traverse, append, increment, found, complete, return, loop_start, loop_end

STEP COUNT RULES:
- Trace EVERY meaningful executable statement: assignments, comparisons, loop iterations, appends, returns
- Generate between 20 and 60 steps depending on code complexity
- For string/count algorithms: trace each character comparison AND each append separately
- Do NOT skip iterations — trace all of them
- Final step should be operation "complete" or "return" pointing to the return statement line

Explanations: under 100 chars, plain English, mention variable values.
Return ONLY a raw JSON array, no markdown, no explanation outside JSON.
"""