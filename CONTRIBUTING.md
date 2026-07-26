# Contributing to TurboIndex

Thanks for your interest in contributing! TurboIndex is a fully local codebase
vector search MCP server — a Node.js CLI wrapper around a Python MCP server
with local embeddings and vector search.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).
Please read it before participating.

## Tech Stack

| Layer | Technology |
|---|---|
| Package manager | npm |
| CLI entry | JavaScript (Node.js) |
| MCP server | Python (FastMCP) |
| Vector index | Turbovec (IdMapIndex) |
| Embeddings | fastembed (jina-v2-base-code) |
| Tests (Python) | pytest |
| Tests (JS) | node:test |
| Lint/format | ruff (Python) |

## Development Setup

```bash
# Clone the repo
git clone https://github.com/kardelitaitu/turboindex.git
cd turboindex

# Install dependencies (creates .venv + installs Python deps)
npm install

# Link globally for local testing
npm link
```

### Windows Notes

- Use `node scripts/run-python.js` instead of calling Python directly
- The `.venv` is at `.venv/Scripts/python.exe` (not `bin/python`)
- Test file paths must be explicit: `node --test test/cli.test.js test/runtime.test.js test/setup.test.js`

## Running Tests

### Full Validation (recommended before PR)

```bash
npm run prepublishOnly
```

This runs: lint → format check → Python tests → JS tests → CLI smoke test → MCP protocol smoke test.

### Individual Test Suites

```bash
# Python tests (all)
npm run test:py

# Python tests (specific file)
node scripts/run-python.js -m pytest tests/test_search.py -v

# Python tests (specific test)
node scripts/run-python.js -m pytest tests/test_search.py::TestSearchCodebase::test_search_returns_results -v

# JS tests (all)
npm run test:js

# JS tests (specific file)
node --test test/setup.test.js

# Integration tests
npm run test:integration

# Lint
npm run lint

# Format check
npm run lint:format
```

### Benchmarks

```bash
node scripts/run-python.js benchmarks/benchmark.py
node scripts/run-python.js benchmarks/benchmark.py --files 500 --searches 200 --json
```

## Project Structure

```
turboindex/
├── bin/cli.js              # Node.js CLI wrapper
├── scripts/
│   ├── setup.js            # Postinstall: creates .venv, installs deps
│   ├── prepublish-test.js  # Pre-publish validation script
│   └── run-python.js       # Cross-platform Python runner helper
├── src/
│   ├── server.py           # MCP server (main logic)
│   └── embed_service.py    # Embedding subprocess
├── tests/                  # Python tests (pytest)
├── test/                   # JS tests (node:test)
├── benchmarks/             # Performance benchmarks
├── docs/                   # User documentation
├── skills/turboindex/      # AI agent skill definition
└── AGENTS.md               # Orientation for AI coding agents
```

## Pull Request Guidelines

### Before Submitting

1. **Run `npm run prepublishOnly`** — all checks must pass
2. **Add tests** for new features or bug fixes
3. **Keep changes focused** — one PR, one concern
4. **Update docs** if you change public API (tools, resources, CLI flags)
5. **Update CHANGELOG.md** under `[Unreleased]`

### Commit Style

Use conventional commit prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `test:` — test additions or fixes
- `refactor:` — code restructuring (no behavior change)
- `perf:` — performance improvement
- `chore:` — build, CI, dependencies

### PR Description

Include:
- What the change does and why
- How to test it
- Any breaking changes or migration notes
- Screenshots or logs if relevant

## Key Design Rules

Read `AGENTS.md` for the full list. Critical ones:

1. **Lazy loading** — model and index load on first use, not at startup
2. **Two independent locks** — `queue_lock` and `index_lock` are never nested
3. **Atomic writes** — use temp file + `os.replace()` for all persistence
4. **None-guards** — `handle_index`/`handle_remove` must guard against unloaded model/index
5. **`--stdio` flag** — required for MCP stdio transport; tests must pass it

## Getting Help

- [GitHub Discussions](https://github.com/kardelitaitu/turboindex/discussions)
- [GitHub Issues](https://github.com/kardelitaitu/turboindex/issues)
- [Documentation](https://github.com/kardelitaitu/turboindex/wiki)
