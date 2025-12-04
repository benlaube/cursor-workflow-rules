# update-port-config

You are an network /backend developer configuring a local development project that uses a Supabase local stack.

Follow these steps VERY carefully inside THIS project only:

A. Locate project files
1. Find the following files relative to the project root if they exist:
   a. Supabase config: "supabase/config.toml"
   b. Port config: "dev_ports.json"
   c. Environment files: ".env", ".env.local", or any other obvious env file in the root that contains SUPABASE_ variables.
2. If "dev_ports.json" does not exist:
   a. Create it at the project root with the following default structure:
      {
        "version": "1.0.0",
        "supabase": {
          "rest_port": 54321,
          "db_port": 54322,
          "studio_port": 54323,
          "image_proxy_port": 54324
        }
      }
   b. Make sure the JSON is valid and pretty-printed.

B. Read port configuration
1. Open "dev_ports.json" and read:
   a. supabase.rest_port
   b. supabase.db_port
   c. supabase.studio_port
   d. supabase.image_proxy_port (optional; only use if present)
2. Assume these ports are authoritative for this project. Do NOT invent new ports unless specifically asked in a future message.

C. Update Supabase config (supabase/config.toml)
1. If "supabase/config.toml" exists:
   a. Add or ensure a comment at the top:
      # Ports managed by dev:configure-local-supabase (Cursor command). Do not edit ports here manually.
   b. In the [api] section, set "port" to supabase.rest_port.
   c. In the [db] section, set "port" to supabase.db_port.
   d. In the [studio] section, set "port" to supabase.studio_port, if that section exists.
   e. In the [imgproxy] or equivalent image-related section, if present and image_proxy_port is defined in dev_ports.json, set "port" to supabase.image_proxy_port.
2. Do not modify any non-port settings.
3. Preserve formatting and comments as much as reasonably possible.

Ask questions as needed!

D. Update environment variables
1. For each env file you found (.env, .env.local, etc.):
   a. If any SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL variables exist, set their value to:
      "http://localhost:{rest_port}"
   b. If there are explicit port variables such as SUPABASE_DB_PORT, SUPABASE_STUDIO_PORT, or SUPABASE_REST_PORT, update them to match the values from dev_ports.json.
   c. If no SUPABASE_URL exists, add:
      SUPABASE_URL=http://localhost:{rest_port}
   d. If this is a frontend project (Next.js, Vite, etc.) and no NEXT_PUBLIC_SUPABASE_URL exists, add:
      NEXT_PUBLIC_SUPABASE_URL=http://localhost:{rest_port}
2. Be careful to:
   a. Only modify lines that clearly correspond to Supabase settings.
   b. Avoid touching unrelated env vars.

E. (Optional) Suggest /etc/hosts entry
1. Based on the folder name of the project, propose a nice local hostname, for example:
   a. If the project folder is "tradestation-bot", a good hostname is "supa-tradestation-bot.local".
2. At the end of your response to the user:
   a. Print a suggested /etc/hosts line like:
      127.0.0.1  supa-<project-name>.local
   b. Explain that the user must manually add this line to /etc/hosts with sudo if they want hostname-based access, and that this command cannot perform that step automatically.

F. Final summary to user
1. After applying changes, summarize:
   a. The ports in use:
      - REST: <rest_port>
      - DB: <db_port>
      - Studio: <studio_port>
      - Image Proxy (if applicable): <image_proxy_port>
   b. The files you modified (with short bullet descriptions).
   c. The suggested /etc/hosts entry for nicer local URLs.
2. Keep the summary short and pragmatic so it’s easy to scan.

