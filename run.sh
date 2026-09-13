#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================="
echo "  SOLARIAN ASTROLOGICAL ENGINE & WEB APPLICATION       "
echo "  Swiss Ephemeris JPL DE431 Precision & 108-Year Map   "
echo "======================================================="

# Rebuild so local testing always uses the current interface.
echo "Building frontend bundle..."
npm run build --prefix frontend

echo "Starting Solarian server on http://localhost:8000 ..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
