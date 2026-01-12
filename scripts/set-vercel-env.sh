#!/usr/bin/env bash
# Bash script to push .env variables to Vercel
# Usage:
# 1) Install Vercel CLI: npm i -g vercel
# 2) Login: vercel login
# 3) Run this script from repo root: ./scripts/set-vercel-env.sh

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found in repo root"
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "Reading $ENV_FILE and adding variables to Vercel (Production)."
echo "Make sure you're logged in: vercel login"

while IFS= read -r line || [ -n "$line" ]; do
  # Trim whitespace
  line_trimmed="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  # skip comments and empty lines
  if [ -z "$line_trimmed" ] || [[ "$line_trimmed" == \#* ]]; then
    continue
  fi
  if [[ "$line_trimmed" != *=* ]]; then
    continue
  fi
  key="${line_trimmed%%=*}"
  value="${line_trimmed#*=}"
  if [ -z "$key" ]; then
    continue
  fi

  echo -n "Adding $key to Vercel (Production)..."
  vercel env add "$key" "$value" production --yes
  if [ $? -ne 0 ]; then
    echo " failed"
    echo "You may need to run the command interactively or add variables from the Vercel dashboard."
  else
    echo " done"
  fi

done < "$ENV_FILE"

echo "Done. Consider also adding same vars to Preview or Development scopes if needed."
