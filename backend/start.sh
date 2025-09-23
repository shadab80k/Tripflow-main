#!/bin/bash

# Start script for Render deployment
uvicorn server:app --host 0.0.0.0 --port $PORT