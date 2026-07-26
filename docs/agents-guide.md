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

## Why this matters

Without these instructions, a coding agent might:

- **Never call `index_directory`** → no search results, no benefit
- **Call `search_codebase` before indexing** → empty results, assumes nothing exists
- **Not re-index after edits** → stale search results
- **Use `keyword_search` for everything** → misses the point of semantic search
- **Re-index the whole project after one edit** → wastes time when `update_file_index` exists

With this AGENTS.md block, the agent knows the exact workflow: index → search → update → repeat.
