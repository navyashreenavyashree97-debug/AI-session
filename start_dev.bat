@echo off
title BloomAnalytics - AI Learning Ability & Recommendation System
echo =====================================================================
echo  BloomAnalytics: AI-Powered Learning Ability & Recommendation System
echo =====================================================================
echo.
echo Checking database setup...
python backend\seed_data.py
echo.
echo Starting Application on http://localhost:5000...
echo Faculty Demo: faculty@demo.edu / Faculty@123
echo Student Demo: student@demo.edu / Student@123
echo.
python backend\app.py
pause
