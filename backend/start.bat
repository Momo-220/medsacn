@echo off
REM Script de démarrage du backend SANS auto-reload
REM IMPORTANT: Pas de --reload pour éviter les coûts inutiles
echo ========================================
echo  Demarrage backend SANS auto-reload
echo  (Pour economiser les couts Cloud)
echo ========================================
uvicorn app.main:app --host 0.0.0.0 --port 8888
