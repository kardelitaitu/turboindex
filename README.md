<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/TurboIndex-FF6B35?style=for-the-badge&logo=python&logoColor=white">
  <img alt="TurboIndex" src="https://img.shields.io/badge/TurboIndex-FF6B35?style=for-the-badge&logo=python&logoColor=white">
</picture>

# TurboIndex

Fully local semantic code search for your AI assistant.  
Powered by Google [TurboQuant](https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/) vector quantization and [jina-v2-base-code](https://huggingface.co/jinaai/jina-embeddings-v2-base-code) embeddings (768-dim, 8K context, code-trained on 30+ languages).  
One-command install, zero config, zero cloud.

```bash
npm install -g turboindex    # Download the package
npm approve-scripts turboindex  # Allow the setup script to run (see note below)
```

> **Note:** npm's `allow-scripts` security feature blocks postinstall scripts by default.
> The second command approves TurboIndex's setup script, which creates a Python virtual
> environment and installs dependencies automatically. You'll see a banner with numbered
> progress steps as it sets up.

[![npm version](https://img.shields.io/npm/v/turboindex.svg)](https://www.npmjs.com/package/turboindex)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security-policy-brightgreen.svg)](./SECURITY.md)
[![Node >=18](https://img.shields.io/badge/node->=18-green.svg)](https://nodejs.org)
[![Python >=3.9](https://img.shields.io/badge/python->=3.9-blue.svg)](https://python.org)
[![Tests: 777 passing](https://img.shields.io/badge/tests-777%20passing-brightgreen.svg)](https://github.com/kardelitaitu/turboindex)

---

## Quick Start

### CPU (default)

```bash
npm install -g turboindex
npm approve-scripts turboindex
```

You'll see the postinstall setup script run:

```
  TurboIndex v1.0.1 — Local codebase vector search

[1/5] Checking Node.js
  ✓ Node.js v20.11.0
[2/5] Finding Python
  ✓ Python 3.11.4
[3/5] Creating virtual environment
  ✓ .venv created
[4/5] Installing Python dependencies
  ✓ fastembed, turbovec, fastmcp, pathspec
[5/5] Installing AI skill
  ✓ turboindex skill ready

  TurboIndex is ready!

  Add this to your MCP client config:
  { "mcpServers": { "turboindex": { "command": "turboindex", "cwd": "." } } }
```

### GPU (CUDA / DirectML / CoreML)

```bash
npm install -g turboindex
# Install GPU-enabled ONNX Runtime inside the auto-created venv
# Windows:
%APPDATA%\npm\node_modules\turboindex\.venv\Scripts\pip install onnxruntime-gpu
# Mac / Linux:
$(npm root -g)/turboindex/.venv/bin/pip install onnxruntime-gpu
```

### Configure

TurboIndex works with any MCP-compatible agent. Below are setup instructions for popular clients.

| Client | Type | Config Method |
|---|---|---|
| **Claude Desktop** | Desktop app | `claude_desktop_config.json` → `mcpServers` |
| **Cursor** | IDE | Settings → Features → MCP, add server |
| **opencode** | CLI | `opencode.json` → `mcp` |
| **Windsurf** | IDE | `~/.codeium/windsurf/mcp_config.json` → `mcpServers` |
| **Continue** | VS Code / JetBrains | `~/.continue/config.json` → `experimental.mcpServers` |
| **Cline / Roo Code** | VS Code extension | `cline_mcp_settings.json` or `roo_mcp_settings.json` |
| **Copilot** | VS Code / JetBrains | `~/.github/copilot-mcp.json` → `servers` |
| **Aider** | CLI | `aider --mcp-servers turboindex` or `aider-mcp-chat` mode |
| **Genkit / Goose** | CLI | `goose add mcp turboindex` or JSON config |

**Claude Desktop** (`claude_desktop_config.json`):
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

**Windsurf** (`~/.codeium/windsurf/mcp_config.json`):
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

**Continue** (`~/.continue/config.json`):
```json
{
  "experimental": {
    "mcpServers": {
      "turboindex": {
        "command": "turboindex",
        "cwd": "."
      }
    }
  }
}
```

**Cline / Roo Code** (`cline_mcp_settings.json` or `roo_mcp_settings.json`):
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

**Copilot** (`~/.github/copilot-mcp.json`):
```json
{
  "servers": {
    "turboindex": {
      "command": "turboindex",
      "cwd": "."
    }
  }
}
```

**Cursor:** Settings → Features → MCP → Add Server → Name: `turboindex`, Type: `command`, Command: `turboindex`

**Aider:** `aider --mcp-servers turboindex` (or run `aider-mcp-chat` for an MCP-native session)

**Genkit / Goose:** `goose add mcp turboindex`

**opencode** (`opencode.json`):
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "turboindex": {
      "type": "local",
      "command": ["turboindex"],
      "cwd": ".",
      "enabled": true
    }
  }
}
```

> **`"cwd": "."` tells the server to auto-index the project folder on startup.**  
> The server scans files, diffs against the persisted index, and queues new/changed/removed files automatically — no manual `/turboindex index` needed. Omit or change the path to index a different directory.

Your AI assistant can now index and search your local codebase. On startup, the server automatically indexes the `cwd` directory — no manual `index_directory` call required.

---

## Features

| Feature | What it means |
|---|---|
| **100% Local** | All embeddings and search run on your machine. No API keys. No cloud calls. |
| **Persistent** | Index saved to disk. Survives restarts. |
| **Background Indexing** | Tools return instantly; files processed in batches. |
| **Lazy Loading** | Server starts in ~100ms. The heavy ML model loads only on first search. |
| **Process Isolation** | Embedding model runs in a subprocess — main server stays at ~15MB. |
| **Model Choice** | `--model=<name>` flag to swap embedding models (default: `jinaai/jina-embeddings-v2-base-code`). |
| **GPU Auto-Detect** | Uses CUDA/DirectML/CoreML automatically when `onnxruntime-gpu` is installed. |
| **.gitignore Aware** | `index_directory` skips gitignored files by default. Opt out with `respect_gitignore=False`. |
| **777 Tests** | Python + JS, all passing, regression-gated. |
| **Auto-Shutdown** | Exits after 30 idle minutes. Client auto-restarts on next call. |
| **Self-Maintaining** | Idle worker re-indexes stale files automatically. |
| **One-Command Install** | Python venv and dependencies set up automatically. |
| **MCP Native** | Tools + Resources. Works with any MCP client. |

---

## Documentation

| Document | Description |
|---|---|
| **[Getting Started](docs/getting-started.md)** | Installation, configuration, and first workflow |
| **[Usage Guide](docs/usage.md)** | Complete tools & resources reference |
| **[Architecture](docs/architecture.md)** | System design, decisions, and data flows |
| **[Technical Reference](docs/reference.md)** | Implementation details for contributors |
| **[Roadmap](docs/roadmap.md)** | Planned features and development status |

---

## Quick Reference

**Tools:**

| Tool | Description |
|---|---|
| `index_directory(path, respect_gitignore=True)` | Queue a directory for background indexing (`.py`, `.rs`, `.md`, `.txt`, `.js`, `.ts`, `.go`, `.toml`, `.json`, `.yaml`, `.yml`) |
| `update_file_index(path)` | Immediately re-index a single file after modification |
| `search_codebase(query, k=3)` | Semantic search against indexed code |
| `keyword_search(keyword, file_extension_filter="")` | Case-insensitive exact match across indexed content — returns file paths and line numbers |
| `read_file_content(path)` | Read a file's full unabridged content from disk |
| `get_index_stats()` | Index health and statistics (instant, no model load) |
| `drop_index()` | Clear the entire index from memory and disk |

**Resources (auto-context for the AI):**

| Resource | What it shows |
|---|---|
| `turboindex://status` | `Idle. 47 files indexed.` |
| `turboindex://stats` | JSON with vector count, disk usage, queue depth |

---

## Benchmarks

### Python (current)

Synthetic benchmark: 100 generated code files, 50 search iterations, CPU embeddings.

| Category | Metric | Value |
|---|---|---|
| **Indexing** | Throughput | **~22 files/sec** (100 files in 4.5s) |
| Indexing | Median | ~32 ms/file |
| Indexing | P95 | ~54 ms/file |
| Indexing | P99 | ~80 ms/file |
| **Semantic search (k=3)** | Median | ~12.3 ms |
| Semantic search (k=3) | P95 | ~13.1 ms |
| **Semantic search (k=5)** | Median | ~12.1 ms |
| Semantic search (k=5) | P95 | ~13.7 ms |
| **Semantic search (k=10)** | Median | ~12.4 ms |
| Semantic search (k=10) | P95 | ~13.3 ms |
| **Keyword search** | Median | ~0.13 ms |
| Keyword search | P95 | ~0.14 ms |
| **Cold start (model load)** | — | ~6 ms |
| **Process memory** | — | ~500 MB (Python + embed subprocess, 768-dim jina model) |

Run benchmarks yourself:
```bash
.venv/Scripts/python benchmarks/benchmark.py          # 100 files, 50 searches
.venv/Scripts/python benchmarks/benchmark.py --files 500 --searches 200
.venv/Scripts/python benchmarks/benchmark.py --json    # raw JSON output
```

### Rust (WIP — estimated)

A native Rust port would replace the Python server + embed subprocess with a single binary. The embedding model (ONNX Runtime) stays the same — inference speed is unchanged. The gains come from removing Python overhead, IPC serialization, and the GIL.

| Category | Python (current) | Rust (estimate) | Why |
|---|---|---|---|
| **Indexing throughput** | ~22 files/sec | **~65–70 files/sec** | Eliminate JSON-RPC to embed subprocess; embed ONNX inline |
| **Semantic search (k=5)** | ~12 ms | **~0.3–0.5 ms** | No GIL, no Python dict lookups, native `turbovec-rs` |
| **Keyword search** | ~0.13 ms | **~0.01 ms** | `memchr` over contiguous memory instead of Python string ops |
| **Cold start** | ~6 ms | **~5 ms** | ONNX Runtime model load is the bottleneck (unchanged) |
| **Process memory** | ~500 MB | **~5–8 MB** | Single binary, no Python interpreter, no subprocess |
| **Dependency footprint** | Node.js + Python + .venv | **Single binary** | `cargo install turboindex`, no runtime deps |

The real win of a Rust port is not raw speed — it's **consistency** (no GC pauses, no GIL contention under concurrent search), **simplicity** (one static binary), and **eliminating the Node.js + Python runtime dependency**.

---

## Requirements

- **Node.js** ≥ 18
- **Python** ≥ 3.9 (with `python` or `python3` on PATH)

---

## License

MIT
