#!/bin/bash
# Démarrage backend (Render / production : pas de --reload)
echo "========================================"
echo "  Démarrage backend MediScan"
echo "========================================"
uvicorn app.main:app --host 0.0.0.0 --port 8888
