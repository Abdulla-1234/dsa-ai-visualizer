export interface Example {
  label: string
  ds: string
  description: string
  code: string
}

export interface Category {
  id: string
  icon: string
  title: string
  subtitle: string
  desc: string
  color: string
  previewLines: string[]
  examples: Example[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'dsa',
    icon: '⬡',
    title: 'Data Structures',
    subtitle: '& Algorithms',
    desc: 'Learn DSA step by step with clear explanations and visual animations. Master arrays, stacks, queues, linked lists and more.',
    color: 'violet',
    previewLines: ['Arrays · Stacks · Queues', 'Linked Lists · Trees · Graphs', 'Sorting · Searching'],
    examples: [
      {
        label: 'Bubble Sort',
        ds: 'array',
        description: 'Watch how Bubble Sort compares adjacent elements and swaps them until the array is fully sorted. Each pass moves the largest unsorted element to its correct position — like bubbles rising to the top.',
        code: `arr = [5, 3, 8, 1, 9, 2]
for i in range(len(arr)):
    for j in range(len(arr) - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
      },
      {
        label: 'Stack Push/Pop',
        ds: 'stack',
        description: 'A Stack follows Last-In-First-Out (LIFO). Watch elements get pushed onto the top and popped off. Used in function call stacks, undo systems, and expression evaluation.',
        code: `stack = []
for val in [10, 20, 30, 40]:
    stack.append(val)
while stack:
    top = stack.pop()
    print(top)`,
      },
      {
        label: 'Queue FIFO',
        ds: 'queue',
        description: 'A Queue follows First-In-First-Out (FIFO). Elements enter from one end and leave from the other — like a line at a store. Used in BFS, task scheduling, and buffers.',
        code: `from collections import deque
queue = deque()
for val in ['A', 'B', 'C', 'D']:
    queue.append(val)
while queue:
    first = queue.popleft()
    print(first)`,
      },
      {
        label: 'Linked List',
        ds: 'linked_list',
        description: 'A Linked List is a chain of nodes, each pointing to the next. Unlike arrays, elements are not stored in contiguous memory. Watch pointer traversal step by step.',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
curr = head
while curr:
    print(curr.val)
    curr = curr.next`,
      },
    ],
  },
  {
    id: 'algorithms',
    icon: '◈',
    title: 'Search & Sort',
    subtitle: 'Algorithms',
    desc: 'Visualize classic algorithms like Binary Search, Merge Sort, and Quick Sort. Understand time complexity through animation.',
    color: 'blue',
    previewLines: ['Binary Search · Merge Sort', 'Quick Sort · Selection Sort', 'Two Pointers · Sliding Window'],
    examples: [
      {
        label: 'Binary Search',
        ds: 'array',
        description: 'Binary Search cuts the search space in half at every step. It only works on sorted arrays. Watch the left, right and mid pointers converge on the target — O(log n) efficiency in action.',
        code: `arr = [1, 3, 5, 7, 9, 11, 13]
target = 7
left, right = 0, len(arr) - 1
while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        break
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1`,
      },
      {
        label: 'Selection Sort',
        ds: 'array',
        description: 'Selection Sort finds the minimum element in the unsorted portion and places it at the beginning. Each pass grows the sorted section by one. Simple but O(n²).',
        code: `arr = [64, 25, 12, 22, 11]
n = len(arr)
for i in range(n):
    min_idx = i
    for j in range(i+1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      },
      {
        label: 'Two Pointers',
        ds: 'array',
        description: 'Two Pointers technique uses a left and right pointer that move toward each other. Commonly used for sorted array problems, pair sum, and palindrome checks — reduces O(n²) to O(n).',
        code: `arr = [1, 2, 3, 4, 5, 6]
target = 7
left, right = 0, len(arr) - 1
pairs = []
while left < right:
    s = arr[left] + arr[right]
    if s == target:
        pairs.append((arr[left], arr[right]))
        left += 1; right -= 1
    elif s < target:
        left += 1
    else:
        right -= 1`,
      },
      {
        label: 'Sliding Window',
        ds: 'array',
        description: 'Sliding Window maintains a window of elements and slides it across the array. Used for max subarray sum, longest substring problems. Avoids recomputing from scratch each step.',
        code: `arr = [2, 1, 5, 1, 3, 2]
k = 3
window_sum = sum(arr[:k])
max_sum = window_sum
for i in range(k, len(arr)):
    window_sum += arr[i] - arr[i - k]
    max_sum = max(max_sum, window_sum)`,
      },
    ],
  },
  {
    id: 'trees',
    icon: '⊛',
    title: 'Trees & Graphs',
    subtitle: 'Traversal & Search',
    desc: 'Explore binary trees, BSTs, heaps and graph traversals. Visualize BFS, DFS and tree operations node by node.',
    color: 'green',
    previewLines: ['Binary Tree · BST · Heap', 'BFS · DFS · Dijkstra', 'Inorder · Preorder · Postorder'],
    examples: [
      {
        label: 'BST Insertion',
        ds: 'binary_tree',
        description: 'In a Binary Search Tree, every left child is smaller and every right child is larger than its parent. Watch nodes get placed in their correct position as we insert values one by one.',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
root = Node(8)
root.left = Node(3)
root.right = Node(11)
root.left.left = Node(1)
root.left.right = Node(6)
root.right.right = Node(13)`,
      },
      {
        label: 'Inorder Traversal',
        ds: 'binary_tree',
        description: 'Inorder traversal visits Left → Root → Right. For a BST this always produces sorted output. Watch the recursive call stack unwind as it visits each node in ascending order.',
        code: `class Node:
    def __init__(self, v):
        self.val=v; self.left=None; self.right=None
root = Node(5)
root.left = Node(3); root.right = Node(7)
root.left.left = Node(1); root.left.right = Node(4)
result = []
def inorder(node):
    if node:
        inorder(node.left)
        result.append(node.val)
        inorder(node.right)
inorder(root)`,
      },
      {
        label: 'BFS Traversal',
        ds: 'array',
        description: 'Breadth-First Search explores all neighbors at the current depth before going deeper. It uses a queue and guarantees the shortest path in unweighted graphs.',
        code: `from collections import deque
graph = {'A':['B','C'],'B':['D','E'],'C':['F'],'D':[],'E':[],'F':[]}
visited = []
queue = deque(['A'])
while queue:
    node = queue.popleft()
    if node not in visited:
        visited.append(node)
        for n in graph[node]:
            queue.append(n)`,
      },
      {
        label: 'Min Heap',
        ds: 'array',
        description: 'A Min Heap always keeps the smallest element at the root. Every push and pop maintains the heap property. Used in priority queues, Dijkstra\'s algorithm, and task scheduling.',
        code: `import heapq
heap = []
for val in [5, 3, 8, 1, 9, 2, 4]:
    heapq.heappush(heap, val)
result = []
while heap:
    result.append(heapq.heappop(heap))`,
      },
    ],
  },
  {
    id: 'sql',
    icon: '⊞',
    title: 'SQL & Databases',
    subtitle: 'Query Visualization',
    desc: 'Visualize how SQL queries execute — JOIN operations, indexing, GROUP BY, and query optimization step by step.',
    color: 'amber',
    previewLines: ['SELECT · WHERE · JOIN', 'GROUP BY · ORDER BY', 'Index Search · Hash Join'],
    examples: [
      {
        label: 'SELECT with Filter',
        ds: 'array',
        description: 'A WHERE clause filters rows one by one against the condition. Watch each row get evaluated and either kept or discarded — this is what a full table scan looks like at the row level.',
        code: `users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob",   "age": 22},
    {"name": "Carol", "age": 28},
    {"name": "Dave",  "age": 20},
]
# SELECT * FROM users WHERE age > 25
result = [u for u in users if u["age"] > 25]`,
      },
      {
        label: 'Hash JOIN',
        ds: 'hashmap',
        description: 'A Hash Join builds a hash map from the smaller table then probes it with each row from the larger table. This gives O(n) join performance — much faster than nested loop O(n²) joins.',
        code: `employees = [("E1","Alice","D1"),("E2","Bob","D2"),("E3","Carol","D1")]
departments = [("D1","Engineering"),("D2","Marketing")]
# Build hash map from departments
dept_map = {d[0]: d[1] for d in departments}
# Probe phase
result = []
for emp in employees:
    dept_name = dept_map.get(emp[2], "Unknown")
    result.append((emp[1], dept_name))`,
      },
      {
        label: 'Index Binary Search',
        ds: 'array',
        description: 'A database index is a sorted structure that enables binary search instead of full scan. Watch how the index narrows down to the target row in O(log n) steps instead of O(n).',
        code: `index = [1, 5, 10, 15, 20, 25, 30, 35]
target_id = 20
left, right = 0, len(index) - 1
found = -1
while left <= right:
    mid = (left + right) // 2
    if index[mid] == target_id:
        found = mid; break
    elif index[mid] < target_id:
        left = mid + 1
    else:
        right = mid - 1`,
      },
      {
        label: 'GROUP BY Count',
        ds: 'hashmap',
        description: 'GROUP BY aggregates rows with the same key. Internally it uses a hash map to accumulate counts per group. Watch each row get assigned to its group bucket and the count increment.',
        code: `employees = [
    ("Alice","Engineering"),("Bob","Marketing"),
    ("Carol","Engineering"),("Dave","HR"),
    ("Eve","Marketing"),("Frank","Engineering"),
]
# SELECT dept, COUNT(*) FROM emp GROUP BY dept
counts = {}
for name, dept in employees:
    counts[dept] = counts.get(dept, 0) + 1`,
      },
    ],
  },
  {
    id: 'system-design',
    icon: '◎',
    title: 'System Design',
    subtitle: 'Patterns & Concepts',
    desc: 'Visualize classic system design patterns — LRU Cache, Rate Limiting, Priority Queues and more through code animation.',
    color: 'pink',
    previewLines: ['LRU Cache · Rate Limiter', 'Load Balancing · Hashing', 'Priority Queue · Pub/Sub'],
    examples: [
      {
        label: 'LRU Cache',
        ds: 'hashmap',
        description: 'An LRU (Least Recently Used) Cache evicts the least recently accessed item when full. It combines a hash map for O(1) lookup with an ordered structure to track recency. Used in Redis, CPU caches, and CDNs.',
        code: `from collections import OrderedDict
class LRUCache:
    def __init__(self, cap):
        self.cap = cap
        self.cache = OrderedDict()
    def get(self, key):
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        return -1
    def put(self, key, val):
        self.cache[key] = val
        self.cache.move_to_end(key)
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
lru = LRUCache(3)
lru.put(1,"A"); lru.put(2,"B"); lru.put(3,"C")
lru.get(1)
lru.put(4,"D")`,
      },
      {
        label: 'Rate Limiter',
        ds: 'queue',
        description: 'A sliding window rate limiter tracks request timestamps in a queue. Old timestamps outside the window are removed. If the queue size exceeds the limit, the request is rejected. Used in APIs to prevent abuse.',
        code: `from collections import deque
class RateLimiter:
    def __init__(self, max_req, window):
        self.max_req = max_req
        self.window = window
        self.requests = deque()
    def allow(self, now):
        while self.requests and now - self.requests[0] > self.window:
            self.requests.popleft()
        if len(self.requests) < self.max_req:
            self.requests.append(now)
            return True
        return False
limiter = RateLimiter(3, 10)
for t in [1, 2, 3, 4, 12, 13]:
    print(limiter.allow(t))`,
      },
      {
        label: 'Balanced Parentheses',
        ds: 'stack',
        description: 'Compilers use a stack to validate balanced brackets. Each opening bracket is pushed; each closing bracket must match the top of the stack. If the stack is empty at the end, the expression is valid.',
        code: `def is_balanced(expr):
    stack = []
    pairs = {')':'(', ']':'[', '}':'{'}
    for ch in expr:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0
exprs = ["(())", "([{}])", "(]", "((()"]
for e in exprs:
    print(f"{e} -> {is_balanced(e)}")`,
      },
      {
        label: 'Priority Queue',
        ds: 'array',
        description: 'A Priority Queue always serves the highest priority item first using a min-heap. Used in task schedulers, Dijkstra\'s algorithm, and hospital triage systems. Watch tasks get reordered by priority.',
        code: `import heapq
tasks = [
    (3, "low_priority_task"),
    (1, "critical_task"),
    (2, "medium_task"),
    (1, "urgent_task"),
]
heap = []
for priority, name in tasks:
    heapq.heappush(heap, (priority, name))
order = []
while heap:
    order.append(heapq.heappop(heap))`,
      },
    ],
  },
  {
    id: 'dp',
    icon: '▦',
    title: 'Dynamic Programming',
    subtitle: 'Memoization & Tabulation',
    desc: 'See how DP breaks problems into subproblems. Visualize state tables filling up for Knapsack, Coin Change, LCS and more.',
    color: 'red',
    previewLines: ['Coin Change · Knapsack', 'Fibonacci · LCS', 'Memoization · Tabulation'],
    examples: [
      {
        label: 'Fibonacci DP',
        ds: 'array',
        description: 'Naive recursion recomputes Fibonacci values exponentially. DP stores each result in a table so it\'s computed only once. Watch the dp array fill left to right — O(n) instead of O(2ⁿ).',
        code: `n = 10
dp = [0] * (n + 1)
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i-1] + dp[i-2]
print(dp)`,
      },
      {
        label: 'Coin Change',
        ds: 'array',
        description: 'Coin Change asks: what is the minimum number of coins to make amount X? DP builds up solutions from amount 0 to the target. Watch each cell get filled with the optimal coin count.',
        code: `coins = [1, 5, 10, 25]
amount = 30
dp = [float('inf')] * (amount + 1)
dp[0] = 0
for i in range(1, amount + 1):
    for coin in coins:
        if coin <= i:
            dp[i] = min(dp[i], dp[i - coin] + 1)`,
      },
      {
        label: 'Longest Common Subsequence',
        ds: 'array',
        description: 'LCS finds the longest sequence present in both strings. A 2D DP table is filled where each cell represents the LCS length for prefixes. Used in diff tools and DNA sequence comparison.',
        code: `s1 = "ABCBDAB"
s2 = "BDCAB"
m, n = len(s1), len(s2)
dp = [[0]*(n+1) for _ in range(m+1)]
for i in range(1, m+1):
    for j in range(1, n+1):
        if s1[i-1] == s2[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])`,
      },
      {
        label: '0/1 Knapsack',
        ds: 'array',
        /* FIX: Completed the missing description and closed the objects/arrays properly */
        description: 'The 0/1 Knapsack problem optimizes values inside a bounded capacity weight matrix. Subproblems determine whether to include or exclude an item based on its weight and value contribution.',
        code: `weights = [2, 3, 4, 5]
values = [3, 4, 5, 6]
capacity = 8
n = len(weights)
dp = [[0] * (capacity + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    for w in range(capacity + 1):
        if weights[i-1] <= w:
            dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w-weights[i-1]])
        else:
            dp[i][w] = dp[i-1][w]`,
      },
    ],
  },
]
export const COLOR_MAP: Record<string, {
  card: string
  icon: string
  badge: string
  btn: string
  border: string
  text: string
  glow: string
}> = {
  violet: {
    card: 'hover:border-violet-700',
    icon: 'bg-violet-950 text-violet-400',
    badge: 'bg-violet-950 text-violet-400 border-violet-900',
    btn: 'bg-violet-600 hover:bg-violet-500',
    border: 'border-violet-700',
    text: 'text-violet-400',
    glow: 'bg-violet-600/10',
  },
  blue: {
    card: 'hover:border-blue-700',
    icon: 'bg-blue-950 text-blue-400',
    badge: 'bg-blue-950 text-blue-400 border-blue-900',
    btn: 'bg-blue-600 hover:bg-blue-500',
    border: 'border-blue-700',
    text: 'text-blue-400',
    glow: 'bg-blue-600/10',
  },
  green: {
    card: 'hover:border-green-700',
    icon: 'bg-green-950 text-green-400',
    badge: 'bg-green-950 text-green-400 border-green-900',
    btn: 'bg-green-700 hover:bg-green-600',
    border: 'border-green-700',
    text: 'text-green-400',
    glow: 'bg-green-600/10',
  },
  amber: {
    card: 'hover:border-amber-700',
    icon: 'bg-amber-950 text-amber-400',
    badge: 'bg-amber-950 text-amber-400 border-amber-900',
    btn: 'bg-amber-600 hover:bg-amber-500',
    border: 'border-amber-700',
    text: 'text-amber-400',
    glow: 'bg-amber-600/10',
  },
  pink: {
    card: 'hover:border-pink-700',
    icon: 'bg-pink-950 text-pink-400',
    badge: 'bg-pink-950 text-pink-400 border-pink-900',
    btn: 'bg-pink-700 hover:bg-pink-600',
    border: 'border-pink-700',
    text: 'text-pink-400',
    glow: 'bg-pink-600/10',
  },
  red: {
    card: 'hover:border-red-700',
    icon: 'bg-red-950 text-red-400',
    badge: 'bg-red-950 text-red-400 border-red-900',
    btn: 'bg-red-700 hover:bg-red-600',
    border: 'border-red-700',
    text: 'text-red-400',
    glow: 'bg-red-600/10',
  },
}
export interface SubCategory {
  id: string
  label: string
  icon: string
  examples: Example[]
}

export const DSA_SUBCATEGORIES: SubCategory[] = [
  {
    id: 'arrays',
    label: 'Arrays & Strings',
    icon: '▦',
    examples: [
      {
        label: 'Bubble Sort',
        ds: 'array',
        description: 'Watch adjacent elements get compared and swapped until the array is fully sorted. Each pass bubbles the largest unsorted element to its correct position.',
        code: `arr = [5, 3, 8, 1, 9, 2]
for i in range(len(arr)):
    for j in range(len(arr) - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
      },
      {
        label: 'Two Pointers',
        ds: 'array',
        description: 'Two pointers start at opposite ends and move toward each other. Used for pair sum, palindrome check, and container with most water.',
        code: `arr = [1, 2, 3, 4, 5, 6]
target = 7
left, right = 0, len(arr) - 1
pairs = []
while left < right:
    s = arr[left] + arr[right]
    if s == target:
        pairs.append((arr[left], arr[right]))
        left += 1; right -= 1
    elif s < target:
        left += 1
    else:
        right -= 1`,
      },
      {
        label: 'Sliding Window',
        ds: 'array',
        description: 'A fixed window slides across the array. Instead of recomputing the sum from scratch, we add the new element and remove the old one — O(n) efficiency.',
        code: `arr = [2, 1, 5, 1, 3, 2]
k = 3
window_sum = sum(arr[:k])
max_sum = window_sum
for i in range(k, len(arr)):
    window_sum += arr[i] - arr[i - k]
    max_sum = max(max_sum, window_sum)`,
      },
    ],
  },
  {
    id: 'sorting',
    label: 'Sorting Algorithms',
    icon: '⇅',
    examples: [
      {
        label: 'Selection Sort',
        ds: 'array',
        description: 'Finds the minimum in the unsorted portion and swaps it to the front. Grows the sorted section one element at a time.',
        code: `arr = [64, 25, 12, 22, 11]
n = len(arr)
for i in range(n):
    min_idx = i
    for j in range(i+1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      },
      {
        label: 'Insertion Sort',
        ds: 'array',
        description: 'Builds the sorted array one item at a time by inserting each element into its correct position — like sorting playing cards in your hand.',
        code: `arr = [5, 2, 4, 6, 1, 3]
for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = key`,
      },
      {
        label: 'Binary Search',
        ds: 'array',
        description: 'Cuts the sorted search space in half each step. Watch left, right and mid pointers converge to the target in O(log n).',
        code: `arr = [1, 3, 5, 7, 9, 11, 13]
target = 7
left, right = 0, len(arr) - 1
while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        break
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1`,
      },
    ],
  },
  {
    id: 'linked-lists',
    label: 'Linked Lists',
    icon: '⬡',
    examples: [
      {
        label: 'Traversal',
        ds: 'linked_list',
        description: 'Watch the current pointer move from node to node following the next reference until it reaches null.',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
head.next.next.next = Node(4)
curr = head
while curr:
    print(curr.val)
    curr = curr.next`,
      },
      {
        label: 'Reverse List',
        ds: 'linked_list',
        description: 'Three pointers — prev, curr, next — reverse the direction of each link one node at a time until the entire list is reversed.',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
prev = None
curr = head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt
head = prev`,
      },
    ],
  },
  {
    id: 'stacks-queues',
    label: 'Stacks & Queues',
    icon: '⊟',
    examples: [
      {
        label: 'Stack LIFO',
        ds: 'stack',
        description: 'Last In First Out. Watch elements push onto the top and pop off. Used in function call stacks, undo operations, and DFS.',
        code: `stack = []
for val in [10, 20, 30, 40, 50]:
    stack.append(val)
while stack:
    top = stack.pop()
    print(top)`,
      },
      {
        label: 'Queue FIFO',
        ds: 'queue',
        description: 'First In First Out. Elements enter from the back and leave from the front — like a real queue line. Used in BFS and task scheduling.',
        code: `from collections import deque
queue = deque()
for val in ['A', 'B', 'C', 'D', 'E']:
    queue.append(val)
while queue:
    first = queue.popleft()
    print(first)`,
      },
      {
        label: 'Balanced Brackets',
        ds: 'stack',
        description: 'A classic stack problem. Opening brackets push, closing brackets pop and check. If mismatched or stack non-empty at end — invalid.',
        code: `def is_balanced(expr):
    stack = []
    pairs = {')':'(', ']':'[', '}':'{'}
    for ch in expr:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    return len(stack) == 0
for e in ["(())", "([{}])", "(]"]:
    print(e, '->', is_balanced(e))`,
      },
    ],
  },
  {
    id: 'trees',
    label: 'Trees',
    icon: '⊛',
    examples: [
      {
        label: 'BST Insert',
        ds: 'binary_tree',
        description: 'Each node goes left if smaller than root, right if larger. Watch nodes find their correct position in the BST.',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
root = Node(8)
root.left = Node(3)
root.right = Node(11)
root.left.left = Node(1)
root.left.right = Node(6)
root.right.right = Node(13)`,
      },
      {
        label: 'Inorder Traversal',
        ds: 'binary_list',
        description: 'Left → Root → Right. For a BST this always produces sorted output. Watch the recursive call stack unwind.',
        code: `class Node:
    def __init__(self, v):
        self.val=v; self.left=None; self.right=None
root = Node(5)
root.left = Node(3); root.right = Node(7)
root.left.left = Node(1); root.left.right = Node(4)
result = []
def inorder(node):
    if node:
        inorder(node.left)
        result.append(node.val)
        inorder(node.right)
inorder(root)`,
      },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    icon: '◎',
    examples: [
      {
        label: 'BFS',
        ds: 'array',
        description: 'Explores all neighbors at the current depth before going deeper using a queue. Guarantees shortest path in unweighted graphs.',
        code: `from collections import deque
graph = {'A':['B','C'],'B':['D','E'],'C':['F'],'D':[],'E':[],'F':[]}
visited = []
queue = deque(['A'])
while queue:
    node = queue.popleft()
    if node not in visited:
        visited.append(node)
        for n in graph[node]:
            queue.append(n)`,
      },
      {
        label: 'DFS',
        ds: 'array',
        description: 'Goes as deep as possible before backtracking. Uses recursion (implicit stack). Great for cycle detection and topological sort.',
        code: `graph = {'A':['B','C'],'B':['D','E'],'C':['F'],'D':[],'E':[],'F':[]}
visited = []
def dfs(node):
    if node not in visited:
        visited.append(node)
        for neighbor in graph[node]:
            dfs(neighbor)
dfs('A')`,
      },
    ],
  },
]