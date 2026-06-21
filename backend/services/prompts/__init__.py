from .dsa_prompt import PROMPT as DSA_PROMPT
from .stack_queue_prompt import PROMPT as STACK_QUEUE_PROMPT
from .linked_list_prompt import PROMPT as LINKED_LIST_PROMPT
from .system_design_prompt import PROMPT as SYSTEM_DESIGN_PROMPT
from .dp_prompt import PROMPT as DP_PROMPT
from .sql_prompt import PROMPT as SQL_PROMPT
from .tree_graph_prompt import PROMPT as TREE_GRAPH_PROMPT

def get_prompt(category: str) -> str:
    mapping = {
        'dsa':           DSA_PROMPT,
        'algorithms':    DSA_PROMPT,
        'arrays':        DSA_PROMPT,
        'sorting':       DSA_PROMPT,
        'stacks-queues': STACK_QUEUE_PROMPT,
        'linked-lists':  LINKED_LIST_PROMPT,
        'trees':         TREE_GRAPH_PROMPT,
        'graphs':        TREE_GRAPH_PROMPT,
        'system-design': SYSTEM_DESIGN_PROMPT,
        'dp':            DP_PROMPT,
        'sql':           SQL_PROMPT,
    }
    return mapping.get(category, DSA_PROMPT)