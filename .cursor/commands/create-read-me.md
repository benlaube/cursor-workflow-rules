# create-read-me

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Review ONLY the codebase in the current directory. Treat this directory as a standalone Service. Generate a detailed, production-ready README.md for this Service with overview, limitations, technical breakdown, usage examples, and metadata.
- **Type:** Executable Command
- **Audience:** AI agents generating documentation
- **Applicability:** When creating README files for services, modules, or standalone directories
- **How to Use:** Run this command to generate a production-ready README.md for the current directory/service based on the codebase analysis
- **Dependencies:** None
- **Related Cursor Commands:** [audit-readmes.md](./audit-readmes.md)
- **Related Cursor Rules:** [readme-standards.mdc](../rules/readme-standards.mdc)
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md), [module-structure.md](../../standards/module-structure.md)

---

## Purpose

You are reviewing ONLY the codebase in the current directory. Treat this directory as a standalone Service. Generate a detailed, production-ready README.md for this Service.

README Requirements:

A. Overview
   A1. Summarize what the Service does based strictly on the files in this directory.
   A2. Explain its purpose, inputs, outputs, and core responsibilities.

B. Out-of-Scope
   B1. Explicitly list what this Service does NOT do.
   B2. Identify responsibilities that belong to other services or external systems.

C. Limitations
   C1. Document current constraints, missing pieces, edge cases, unclear logic, or brittle sections.
   C2. Include dependency risks, required configs, and environment variables that might cause issues.

D. Future Improvements
   D1. Suggest realistic enhancements based only on patterns in this Service.
   D2. Avoid inventing features unrelated to the current architecture.

E. Technical Breakdown
   E1. Explain the directory structure of THIS folder.
   E2. Describe important modules, classes, functions, and data flow.
   E3. Document environment variables used by THIS Service.
   E4. Provide installation, setup, and run instructions specific to THIS Service.

F. Usage Examples
   F1. Provide examples on how to call or integrate with the Service (CLI, API, import, webhook, etc.), based only on actual code.

G. Metadata
   G1. Date Created
   G2. Last Updated
   G3. Version Number
   G4. Maintainer/Author (placeholder if needed)

Rules:
• Analyze ONLY the current directory — do not include other services or the full project.
• Do NOT fabricate behavior that doesn’t exist in the code.
• If something is unclear or missing, mark it with TODO-style comments.
• Output a completed README.md file in clean Markdown formatting.
