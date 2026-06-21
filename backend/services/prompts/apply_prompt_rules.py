import os
import re

# List of target prompt service files
prompt_files = [
    "linked_list_prompt",
    "tree_graph_prompt",
    "stack_queue_prompt",
    "dp_prompt"
]

# ✅ FIXED: Dynamically targets the folder where the script itself is executing
base_dir = os.path.dirname(os.path.abspath(__file__)) if __file__ else "."

# Strict execution tracking instruction text block
line_rule = """
CRITICAL LINE NUMBER RULES:
- "line" must point to the EXECUTABLE line currently running
- NEVER use blank lines, comment-only lines (#, //, /*), or docstring lines as the "line" value
- NEVER repeat the same line number for consecutive steps unless it is a loop line being iterated
- Count from line 1; skip blanks and comment-only lines
- "line" must always match the actual statement executing RIGHT NOW
"""

for f in prompt_files:
    file_path = os.path.join(base_dir, f"{f}.py")
    
    if not os.path.exists(file_path):
        print(f"⚠️ Warning: File not found at {file_path}, skipping.")
        continue
        
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()

    # 1. Insert line_rule right after the opening triple quote block definition
    if 'PROMPT = """' in content:
        content = re.sub(
            r'(PROMPT = """\n)',
            r'\1' + line_rule.strip() + '\n',
            content
        )
    elif "PROMPT = '''" in content:
        content = re.sub(
            r"(PROMPT = '''\n)",
            r"\1" + line_rule.strip() + '\n',
            content
        )

    # 2. Upgrade the maximum trace depth generation limit bounds for long arrays
    content = content.replace('Max 30 steps', 'Generate 20–50 steps')
    content = content.replace('max 30 steps', 'generate 20–50 steps')

    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)
        
    print(f"✅ Successfully injected line-number logic into {f}.py")