#!/bin/bash
# Stop StudyPad web app and ngrok tunnel

echo "🛑 Stopping StudyPad web app..."

# Stop Next.js dev server
if [ -f /tmp/studypad-dev.pid ]; then
    DEV_PID=$(cat /tmp/studypad-dev.pid)
    if kill -0 $DEV_PID 2>/dev/null; then
        kill $DEV_PID
        echo "✓ Next.js dev server stopped (PID: $DEV_PID)"
    else
        echo "⚠ Next.js dev server was not running"
    fi
    rm /tmp/studypad-dev.pid
else
    echo "⚠ No PID file found for dev server"
fi

# Stop ngrok tunnel
if [ -f /tmp/studypad-ngrok.pid ]; then
    NGROK_PID=$(cat /tmp/studypad-ngrok.pid)
    if kill -0 $NGROK_PID 2>/dev/null; then
        kill $NGROK_PID
        echo "✓ ngrok tunnel stopped (PID: $NGROK_PID)"
    else
        echo "⚠ ngrok tunnel was not running"
    fi
    rm /tmp/studypad-ngrok.pid
else
    echo "⚠ No PID file found for ngrok"
fi

# Clean up log files
rm -f /tmp/studypad-dev.log /tmp/studypad-ngrok.log

echo ""
echo "✅ StudyPad stopped"
