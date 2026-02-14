#!/bin/bash
# Script de démarrage du backend SANS auto-reload
# IMPORTANT: Pas de --reload pour éviter les coûts inutiles sur Cloud Run
echo "========================================"
echo "  Démarrage backend SANS auto-reload"
echo "  (Pour économiser les coûts Cloud)"
echo "========================================"
uvicorn app.main:app --host 0.0.0.0 --port 8888
