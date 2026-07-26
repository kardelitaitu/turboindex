# Support

## Documentation

- [GitHub Wiki](https://github.com/kardelitaitu/turboindex/wiki) — Getting
  started, usage guide, architecture reference
- [README](https://github.com/kardelitaitu/turboindex#readme) — Quick start,
  features, benchmarks
- [Changelog](https://github.com/kardelitaitu/turboindex/blob/main/CHANGELOG.md)
  — Version history and release notes

## Getting Help

### GitHub Issues

For bug reports, feature requests, or general questions:

[Open an issue](https://github.com/kardelitaitu/turboindex/issues)

Please include:

- TurboIndex version (`turboindex --version`)
- Node.js version (`node --version`)
- Python version (`python --version`)
- Operating system
- Steps to reproduce the issue
- Any relevant error logs or debug output (`turboindex --debug`)

### Discussions

For questions, ideas, and community discussion:

[GitHub Discussions](https://github.com/kardelitaitu/turboindex/discussions)

### npm

Package page with install instructions:

[npm: turboindex](https://www.npmjs.com/package/turboindex)

## Common Issues

| Problem | Solution |
|---|---|
| `command not found: turboindex` | Reinstall: `npm install -g turboindex` |
| Server starts but tools error | Delete `.venv/` and reinstall |
| First search is slow (~5s) | Normal — embedding model loads once per session |
| Server exits after idle | Normal — watchdog shuts down after 30 min, client auto-restarts |
| Index empty after restart | Run `index_directory` again on your project |
