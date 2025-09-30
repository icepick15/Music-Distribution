"""
Test WebSocket connection directly
"""
import asyncio
import websockets
import json
from datetime import datetime


async def test_websocket():
    """Test WebSocket connection and real-time notifications"""
    uri = "ws://localhost:8000/ws/realtime-notifications/"
    
    try:
        print("🔌 Attempting to connect to WebSocket...")
        
        # Note: This will fail without authentication, but we can test the connection
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to WebSocket!")
            
            # Send ping
            await websocket.send(json.dumps({"type": "ping"}))
            print("📤 Sent ping")
            
            # Wait for response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"📥 Received: {data}")
            
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        print("\n💡 This is expected if:")
        print("   1. User is not authenticated")
        print("   2. Django server is not running")
        print("   3. Redis is not running")


if __name__ == "__main__":
    print("🧪 Testing WebSocket Connection")
    print("=" * 50)
    asyncio.run(test_websocket())