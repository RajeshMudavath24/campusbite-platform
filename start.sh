#!/bin/bash

# CampusBite Platform - Quick Start Script
echo "🚀 Starting CampusBite Platform..."

# Check if Firebase emulators are already running
if lsof -Pi :9099 -sTCP:LISTEN -t >/dev/null; then
    echo "✅ Firebase emulators are already running!"
else
    echo "📦 Starting Firebase emulators in the background..."
    firebase emulators:start &
    sleep 5
    echo "✅ Firebase emulators started"
fi

# Wait a moment for emulators to be ready
sleep 2

# Start React app
echo "⚛️  Starting React development server..."
npm start

