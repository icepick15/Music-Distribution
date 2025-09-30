"""
Views for real-time notifications demo
"""
from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import TemplateView
import os


def notifications_demo(request):
    """Serve the real-time notifications demo page"""
    static_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'static', 'realtime_notifications_demo.html')
    
    try:
        with open(static_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse("""
        <!DOCTYPE html>
        <html>
        <head><title>Demo Page Not Found</title></head>
        <body>
            <h1>🔧 Demo Page Setup</h1>
            <p>The demo HTML file wasn't found. Let's create a simple test instead:</p>
            
            <h2>🔌 WebSocket Test</h2>
            <div id="status">Disconnected</div>
            <button onclick="connect()">Connect</button>
            <button onclick="sendTest()">Send Test</button>
            <div id="messages"></div>
            
            <script>
                let ws = null;
                
                function connect() {
                    ws = new WebSocket('ws://localhost:8000/ws/realtime-notifications/');
                    
                    ws.onopen = function() {
                        document.getElementById('status').innerHTML = '✅ Connected';
                    };
                    
                    ws.onmessage = function(event) {
                        const data = JSON.parse(event.data);
                        document.getElementById('messages').innerHTML += 
                            '<div>📱 ' + (data.notification?.title || data.type) + '</div>';
                    };
                    
                    ws.onclose = function() {
                        document.getElementById('status').innerHTML = '❌ Disconnected';
                    };
                }
                
                function sendTest() {
                    if (ws) {
                        ws.send(JSON.stringify({type: 'ping'}));
                    }
                }
            </script>
        </body>
        </html>
        """, content_type='text/html')


class NotificationsDemoView(TemplateView):
    """Class-based view for notifications demo"""
    template_name = 'realtime_notifications_demo.html'