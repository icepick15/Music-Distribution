"""
Simple view to serve the notifications demo
"""
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import os


@csrf_exempt
def simple_demo(request):
    """Serve a simple WebSocket demo"""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔔 Real-time Notifications Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .connected { background: #d4edda; border: 1px solid #c3e6cb; }
        .disconnected { background: #f8d7da; border: 1px solid #f5c6cb; }
        .notification { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; margin: 10px 0; border-radius: 5px; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        #messages { max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <h1>🔔 Real-time Notifications Test</h1>
    
    <div id="status" class="status disconnected">❌ Disconnected</div>
    
    <div>
        <button id="connectBtn" onclick="connectWebSocket()">🔌 Connect</button>
        <button id="disconnectBtn" onclick="disconnectWebSocket()" disabled>❌ Disconnect</button>
        <button id="pingBtn" onclick="sendPing()" disabled>🏓 Ping</button>
        <button onclick="clearMessages()">🗑️ Clear</button>
    </div>
    
    <h3>📱 Live Messages</h3>
    <div id="messages"></div>
    
    <h3>🧪 Test Instructions</h3>
    <ol>
        <li>Click "🔌 Connect" to connect to WebSocket</li>
        <li>Open a terminal and run: <code>python manage.py test_notifications_live --email YOUR_EMAIL</code></li>
        <li>Watch notifications appear in real-time!</li>
    </ol>
    
    <p><strong>WebSocket URL:</strong> <code>ws://localhost:8000/ws/realtime-notifications/</code></p>
    
    <script>
        let ws = null;
        
        function updateStatus(connected, message) {
            const statusEl = document.getElementById('status');
            statusEl.className = 'status ' + (connected ? 'connected' : 'disconnected');
            statusEl.textContent = message;
            
            document.getElementById('connectBtn').disabled = connected;
            document.getElementById('disconnectBtn').disabled = !connected;
            document.getElementById('pingBtn').disabled = !connected;
        }
        
        function addMessage(type, content) {
            const messagesEl = document.getElementById('messages');
            const messageEl = document.createElement('div');
            messageEl.className = 'notification';
            
            const time = new Date().toLocaleTimeString();
            messageEl.innerHTML = `
                <strong>[${time}] ${type}</strong><br>
                ${typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
            `;
            
            messagesEl.insertBefore(messageEl, messagesEl.firstChild);
            
            // Keep only last 10 messages
            while (messagesEl.children.length > 10) {
                messagesEl.removeChild(messagesEl.lastChild);
            }
        }
        
        function connectWebSocket() {
            if (ws && ws.readyState === WebSocket.OPEN) return;
            
            updateStatus(false, '🔄 Connecting...');
            
            ws = new WebSocket('ws://localhost:8000/ws/realtime-notifications/');
            
            ws.onopen = function(event) {
                updateStatus(true, '✅ Connected');
                addMessage('🔌 CONNECTED', 'WebSocket connection established');
            };
            
            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'new_notification') {
                        addMessage('🔔 NEW NOTIFICATION', data.notification.title + ': ' + data.notification.message);
                    } else if (data.type === 'unread_count') {
                        addMessage('📊 UNREAD COUNT', 'Unread notifications: ' + data.count);
                    } else if (data.type === 'pong') {
                        addMessage('🏓 PONG', 'Server responded to ping');
                    } else {
                        addMessage('📨 MESSAGE', data);
                    }
                } catch (e) {
                    addMessage('⚠️ RAW MESSAGE', event.data);
                }
            };
            
            ws.onclose = function(event) {
                updateStatus(false, '❌ Disconnected (Code: ' + event.code + ')');
                addMessage('❌ DISCONNECTED', 'WebSocket connection closed');
            };
            
            ws.onerror = function(error) {
                updateStatus(false, '🚨 Error');
                addMessage('🚨 ERROR', 'WebSocket error occurred');
            };
        }
        
        function disconnectWebSocket() {
            if (ws) {
                ws.close();
            }
        }
        
        function sendPing() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({type: 'ping'}));
                addMessage('🏓 PING SENT', 'Sent ping to server');
            }
        }
        
        function clearMessages() {
            document.getElementById('messages').innerHTML = '';
        }
        
        // Auto-connect on page load
        setTimeout(connectWebSocket, 1000);
    </script>
</body>
</html>
    """
    return HttpResponse(html_content, content_type='text/html')