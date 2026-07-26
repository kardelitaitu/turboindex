# Security Policy

## Reporting a Vulnerability

We take the security of TurboIndex seriously. If you believe you have found a
security vulnerability, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via email to the project maintainer:

**Email:** [security contact to be added]

## What to Include

When reporting a vulnerability, please include as much of the following as possible:

- A clear description of the vulnerability
- Steps to reproduce the issue
- The affected version(s) of TurboIndex
- Any potential mitigations you've identified
- Whether you believe the vulnerability is publicly known

## What to Expect

- **Acknowledgment:** You will receive an acknowledgment of your report within
  48 hours.
- **Triage:** The maintainer will triage the issue and determine severity and
  scope.
- **Resolution:** We aim to release a fix for critical vulnerabilities within
  7 days. Non-critical issues will be addressed in the next release cycle.
- **Disclosure:** We will coordinate disclosure with you. We prefer to release
  a fix before public disclosure.

## Scope

This policy covers the TurboIndex npm package (`turboindex`), its source code,
and its dependencies as shipped. It does not cover:

- Issues in third-party dependencies beyond our control (please report those
  to the respective maintainers)
- Issues requiring physical access to a user's machine
- Social engineering attacks

## Supported Versions

| Version | Supported |
|---|---|
| 1.x | ✅ Active support |
| < 1.0 | ❌ Pre-release only |

## Secure by Design

TurboIndex is designed with local-first security principles:

- **No network egress:** The embedding model runs entirely locally — your code
  never leaves your machine.
- **No telemetry:** The server does not phone home or collect any usage data.
- **No API keys:** No cloud services are used; no credentials are stored.
- **Isolated Python environment:** Dependencies are installed in a dedicated
  `.venv`, not system Python.

If you discover a way that TurboIndex could be made to exfiltrate data or
communicate with remote servers, that qualifies as a critical security issue.
