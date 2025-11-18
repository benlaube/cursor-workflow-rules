# Git_Repository_Standards_v1.0

Description: Standards and checklists for initializing and configuring new Git repositories, including structure, includes/excludes, and questions AI agents should ask before setup.
Created: 2025-11-17 23:10
Last_Updated: 2025-11-17 23:10

---

## A. When to Apply This Rule

A.1 Apply this rule whenever:
  A.1.a A new project is created and needs its first Git repo.
  A.1.b An existing unversioned codebase is being put under Git for the first time.
  A.1.c An AI agent is asked to "set up a repo," "init a project," or "create a new codebase" for this ecosystem.

A.2 This rule should be used together with the documentation standards for /docs and versioned docs.

---

## B. Default Repo Structure (What to Include)

### B.1 Root-Level Required Files

B.1.a README.md
  - Purpose: Human entrypoint for what this project is, how to run it, and current status.
  - Must include:
    - Project name and one-sentence description.
    - Quickstart (install, run dev, run tests).
    - Tech stack summary.
    - Link to /docs for deeper info.

B.1.b LICENSE (or LICENSE.md)
  - Purpose: Defines how the code may be used and shared.
  - For private/internal repos, this can still exist.

B.1.c .gitignore
  - Purpose: Prevents junk, builds, and secrets from being committed.

B.1.d .gitattributes

B.1.e .editorconfig

B.1.f Project-specific config

B.1.g AI / Agent Files (if applicable)

---

### B.2 Standard Directories

B.2.a /src

B.2.b /tests

B.2.c /docs

B.2.d /scripts

B.2.e /config (optional)

B.2.f /public or /static (for web apps)

---

## C. .gitignore – What to Exclude

C.1 Always Exclude These

C.1.a Build Artifacts
C.1.b Dependencies
C.1.c Local IDE/Editor Files
C.1.d Local Environment & Secrets
C.1.e Logs & Temp Files

C.2 Conditionally Exclude
C.2.a Large Binaries
C.2.b Local Tool Config

---

## D. Secrets & Configuration

D.1 Never Commit Real Secrets
D.2 Use Example Files
D.3 Document Secret Requirements

---

## E. Branching, Commits, and Defaults

E.1 Default Branch = main

E.2 Initial Commit Requirements

E.3 Commit Style Requirements

---

## F. Questions an AI Agent Should Ask Before Initializing a Repo

F.1 Project Purpose & Scope
F.2 Tech Stack & Language
F.3 Testing & Quality
F.4 Docs & Processes
F.5 CI/CD & Hosting
F.6 Secrets & Environment
F.7 Repo Visibility & Licensing

---

## G. Initialization Checklist (Agent Playbook)

G.1 Setup
G.2 Files & Structure
G.3 Tooling
G.4 First Commit
G.5 Remote

---

## H. Safety Rules for AI Agents

H.1 Don’t Commit Secrets
H.2 Don’t Over-Engineer Day One
H.3 Respect Existing Standards
H.4 Ask Before Destroying

