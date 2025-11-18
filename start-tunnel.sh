#!/bin/bash
# Start StudyPad web app with ngrok tunnel

echo "🚀 Starting StudyPad web app..."

# Start Next.js dev server in background
cd ~/projects/studypad-web
npm run dev > /tmp/studypad-dev.log 2>&1 &
DEV_PID=$!
echo $DEV_PID > /tmp/studypad-dev.pid
echo "✓ Next.js dev server started (PID: $DEV_PID)"

# Wait for dev server to be ready
echo "⏳ Waiting for dev server to start..."
sleep 5

# Start ngrok tunnel in background
ngrok http 3000 > /tmp/studypad-ngrok.log 2>&1 &
NGROK_PID=$!
echo $NGROK_PID > /tmp/studypad-ngrok.pid
echo "✓ ngrok tunnel started (PID: $NGROK_PID)"

# Wait for ngrok to be ready
echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get and display the public URL
PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "✅ StudyPad is now live!"
echo "🌐 Public URL: $PUBLIC_URL"
echo ""
echo "To stop, run: ./stop-tunnel.sh"
