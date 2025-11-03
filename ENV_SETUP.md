# Environment setup

Create a `.env` file at the project root with:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

Notes:
- Vite loads variables that start with `VITE_` and exposes them to the client. Do NOT put service-role or secrets in the client.
- `.env` is ignored by Git via the added `.gitignore`.

