# set-vercel-env scripts

These scripts read the repository `.env` file and add the variables to Vercel (Production scope) using the Vercel CLI.

Files
- `set-vercel-env.ps1` — PowerShell script (Windows-friendly).
- `set-vercel-env.sh` — Bash script (macOS / Linux / WSL).

Pre-requisites
1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login to Vercel CLI:

```bash
vercel login
```

3. Ensure you run the script from the repository root where the `.env` file is located.

Usage (PowerShell)

```powershell
pwsh ./scripts/set-vercel-env.ps1
```

Usage (Bash)

```bash
chmod +x ./scripts/set-vercel-env.sh
./scripts/set-vercel-env.sh
```

Notes & cautions
- The scripts will call `vercel env add <KEY> <VALUE> production --yes` for each key/value pair in `.env`.
- They will attempt to add all variables found. If a variable already exists in Vercel, the CLI may prompt or create duplicates depending on your account settings — double-check in the Vercel dashboard.
- These scripts require you to be authenticated with Vercel and to have permissions to change environment variables for the target project.
- For security, consider adding secrets in the Vercel Dashboard manually if you prefer not to pass them through CLI.

Alternative: Manual dashboard method
- Go to Vercel → Project → Settings → Environment Variables and add the variables listed in this repository's `.env` file (prefer Production scope at minimum).

If you'd like, I can also prepare a single command line to add only the required keys (whitelist) rather than all `.env` entries — tell me which keys to include.