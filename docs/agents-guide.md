# AGENTS.md Guide — TurboIndex MCP

> Copy-paste the section below into your project's `AGENTS.md` to teach your AI
> coding agent how to use TurboIndex for local semantic code search.

---

## Template

Add this to your `AGENTS.md`:

````markdown
<!-- TURBOINDEX: Copy from here -->
## TurboIndex — Local Code Search (MCP)

You have access to **TurboIndex**, a local semantic codebase search MCP server. It
indexes your project's source files and lets you search them by meaning, not just text.

### Available Tools

| Tool | Purpose | When to use |
|---|---|---|
| `index_directory(path, respect_gitignore=True)` | Queue a directory for background indexing | First thing you do — index the project root. Returns instantly, files process in batches. |
| `search_codebase(query, k=3)` | Semantic search — find code by what it **does** | When you need to find relevant code for a feature, bug, or refactor. Use natural language queries. |
| `keyword_search(keyword, file_extension_filter="")` | Exact case-insensitive text match (30 result cap) | When you know the exact function/variable/string name. Optional file extension filter. |
| `update_file_index(path)` | Immediately re-index a single file | After you edit a file — keeps search results fresh without re-indexing everything. |
| `read_file_content(path)` | Read a file's full unabridged content | To see the complete file without opening it separately. |
| `get_index_stats()` | Index health (instant, no model load) | To check if indexing is complete or how many files are tracked. |
| `drop_index()` | Clear the entire index | When starting fresh or switching projects. |

**Resources (auto-loaded into your context):**

| Resource | What it shows |
|---|---|
| `turboindex://status` | `Idle. 47 files indexed.` or `Indexing... 12 queued` |
| `turboindex://stats` | JSON: vectors, disk usage, queue depth, model info |

### Workflows

#### New session / first use
```
1. Call index_directory("/path/to/project")   # Queue everything
2. Call get_index_stats()                      # Verify files are queued
3. (Wait a few seconds for background indexing)
4. Call search_codebase("your query")          # First call loads model (~5s), then instant
```

#### Searching for code
```
1. search_codebase("user authentication with JWT", k=5)   # Semantic: find by meaning
2. If you need an exact string: keyword_search("createToken")  # Exact text match
3. To see full context: read_file_content("/path/to/file.py")
```

#### After editing a file
```
1. Make your edit
2. Call update_file_index("/path/to/edited/file.py")   # Re-index immediately
3. Continue working — search results now reflect the edit
```

#### Re-indexing to catch up
```
1. Call index_directory("/project") again
2. Server diffs against last index — only new/changed/deleted files are processed
3. Check get_index_stats() to see: "Queued 3 files (1 new, 2 changed)"
```

#### Multi-project search
```
1. index_directory("/project-alpha")
2. index_directory("/project-beta")
3. search_codebase("query")  → searches across BOTH projects
```

### Important behaviors

- **`index_directory` is async and idempotent** — it returns instantly, batches files in background,
  and calling it twice doesn't create duplicates. Always call it at the start of a session.
- **First search loads the model** — `search_codebase` takes ~5s on first call (model load),
  then ~12ms after. Don't be alarmed by the first-call delay.
- **The server auto-indexes `cwd` on startup** — files are usually already indexed when you arrive.
  Still call `index_directory` to be safe — it's a fast no-op if everything is up to date.
- **`get_index_stats` is always instant** — it never loads the model. Use it freely.
- **Gotchas in search results** — if the model hasn't loaded yet, search results may be empty.
  Check `turboindex://stats` → `"model_loaded": true` if results seem wrong.
- **Persistent index** — the index survives restarts. Files indexed last week are still there.
  Stale files (>7 days since last scan) are re-indexed automatically.
- **Supported file types**: `.py`, `.rs`, `.md`, `.txt`, `.js`, `.ts`, `.go`, `.toml`, `.json`,
  `.yaml`, `.yml`
- **respect_gitignore** — `index_directory` skips gitignored files by default. Pass
  `respect_gitignore=False` to index everything.
<!-- TURBOINDEX: End copy -->
````

---

## Installation

If you don't have TurboIndex yet:

```bash
npm install -g turboindex
```

Then configure your MCP client:

```json
{
  "mcpServers": {
    "turboindex": {
      "command": "turboindex",
      "cwd": "."
    }
  }
}
```

See [Getting Started](getting-started.md) for full setup instructions.

---

## Real-world example

Here's a complete transcript of an AI coding agent using TurboIndex to fix a bug
in an Express.js API. The project is at `/home/dev/payment-api`.

> **Scenario:** A user reports that refunds aren't working. The agent needs to find
> the refund logic, understand how it works, and fix a missing validation check.

### 1. Start of session — index the project

```
🤖 Agent:  → index_directory("/home/dev/payment-api")

📡 TurboIndex:
  Queued 142 files (138 new, 4 changed) for indexing.
  Background worker is processing 5 files per batch.
```

### 2. Check indexing progress while it works

```
🤖 Agent:  → get_index_stats()

📡 TurboIndex:
  Index Stats
  - Vectors: 35
  - Files tracked: 35
  - Worker: indexing (107 queued, 35 processed, 0 errors)
  - Model loaded: False
```

### 3. Search for the refund logic

```
🤖 Agent:  → search_codebase("process a refund transaction", k=5)

📡 TurboIndex (first call, ~5s model load):
  **/home/dev/payment-api/src/services/refund.service.ts** (score: 0.8921)
  ```typescript
  async function processRefund(transactionId: string, amount: number) {
    const transaction = await findTransaction(transactionId);
    if (!transaction) throw new NotFoundError("Transaction not found");
    // BUG: missing validation — doesn't check if transaction is refundable
    const refund = await paymentGateway.refund(transaction.gatewayId, amount);
    await updateTransactionStatus(transactionId, "refunded");
    return refund;
  }
  ```
  ---
  **/home/dev/payment-api/src/routes/refund.routes.ts** (score: 0.7345)
  ```typescript
  router.post("/refund", async (req, res) => {
    const { transactionId, amount } = req.body;
    const result = await processRefund(transactionId, amount);
    res.json(result);
  });
  ```
  ---
  **/home/dev/payment-api/src/models/transaction.model.ts** (score: 0.6892)
  ```typescript
  enum TransactionStatus {
    completed = "completed",
    refunded = "refunded",
    failed = "failed",
    pending = "pending"
  }
  ```
```

### 4. Read the full refund service file

```
🤖 Agent:  → read_file_content("/home/dev/payment-api/src/services/refund.service.ts")

📡 TurboIndex:
  [Returns the full 120-line file — agent sees the complete context]
```

### 5. Fix the bug — add validation

```typescript
// The agent edits the file, adding:
if (transaction.status !== TransactionStatus.completed) {
  throw new ValidationError("Transaction is not refundable");
}
```

### 6. Re-index the edited file

```
🤖 Agent:  → update_file_index("/home/dev/payment-api/src/services/refund.service.ts")

📡 TurboIndex:
  ✓ Indexed /home/dev/payment-api/src/services/refund.service.ts
```

### 7. Verify the fix is findable

```
🤖 Agent:  → search_codebase("refund validation check", k=3)

📡 TurboIndex (instant, model already loaded):
  **/home/dev/payment-api/src/services/refund.service.ts** (score: 0.9512)
  ```typescript
  if (transaction.status !== TransactionStatus.completed) {
    throw new ValidationError("Transaction is not refundable");
  }
  ```
```

### 8. Confirm final state

```
🤖 Agent:  → get_index_stats()

📡 TurboIndex:
  Index Stats
  - Vectors: 142
  - Files tracked: 142
  - Worker: idle (0 queued, 142 processed, 0 errors)
  - Model loaded: True

🤖 Agent:  → turboindex://status

📡 TurboIndex: Idle. 142 files indexed.
```

### What the agent did right

| Step | Tool | Why |
|---|---|---|
| 1 | `index_directory` | Started indexing immediately — didn't wait |
| 2 | `get_index_stats` | Checked progress without triggering model load |
| 3 | `search_codebase` | Used natural language, not regex. First call slow but worth it |
| 4 | `read_file_content` | Got full file context before editing |
| 5 | (edited the file) | Made the fix |
| 6 | `update_file_index` | Re-indexed just the one changed file — fast |
| 7 | `search_codebase` | Verified the fix appears in search results |
| 8 | `get_index_stats` | Confirmed everything is indexed and idle |

**Key takeaway:** The agent never waited for indexing to finish before searching.
It used `get_index_stats` to monitor progress, searched once the model loaded,
and kept the index fresh with `update_file_index` after edits.

---

## Why this matters

Without these instructions, a coding agent might:

- **Never call `index_directory`** → no search results, no benefit
- **Call `search_codebase` before indexing** → empty results, assumes nothing exists
- **Not re-index after edits** → stale search results
- **Use `keyword_search` for everything** → misses the point of semantic search
- **Re-index the whole project after one edit** → wastes time when `update_file_index` exists

With this AGENTS.md block, the agent knows the exact workflow: index → search → update → repeat.
