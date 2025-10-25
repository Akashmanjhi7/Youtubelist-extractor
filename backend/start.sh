#!/usr/bin/env bash
# Render server ko uvicorn se chalaega
uvicorn main:app --host 0.0.0.0 --port $PORT