# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Use GitHub's private vulnerability reporting instead:
[Report a vulnerability](https://github.com/ANavas07/AN-Admin-Template/security/advisories/new).

If that is unavailable, email arielnavas05@gmail.com.

Please include:

- what the issue is and where in the code
- steps to reproduce, or a proof of concept
- the impact you believe it has

Expect a first response within 7 days. There is no bug bounty for this project.

## Supported versions

This is a template, not a deployed service. Only the latest commit on `main`
receives fixes. If you generated a project from this template, you own the
resulting code and are responsible for keeping its dependencies current.

## Scope

This repository is a **frontend template that runs entirely on mock data**.
The following are known and intentional, and are not vulnerabilities in this
project:

- **Authentication is simulated.** `handleLogin` in `src/app/App.tsx` writes a
  fixed string to `localStorage`; `ProtectedRoute` only checks that the key
  exists. Any email and password are accepted.
- **Role filtering is presentational.** `requiredRoles` in the module catalog
  hides cards in the UI. It is not an authorization check. A user can reach any
  route by typing the URL.
- **The RBAC screens are a UI shell.** They call a backend that does not ship
  with this repository.
- **Everything under `VITE_*` is public.** Vite inlines those values into the
  browser bundle. That is how Vite works, not a leak.

Anyone deploying something built from this template must enforce
authentication and authorization on their own server.

## What is in scope

- Dependency vulnerabilities reachable from the shipped code
- Cross-site scripting or injection in the components themselves
- Anything that would compromise a developer's machine when running the
  project locally (malicious build step, install script, workflow)
- Supply-chain issues in the repository's own CI configuration
