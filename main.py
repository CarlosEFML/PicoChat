import asyncio
from websockets.asyncio.server import serve

async def echo(websocket):
    async for message in websocket:
        await websocket.send(message)

async def main():
    async with serve(echo, "localhost", 443) as server:
        await server.serve_forever()

print("oi1")
if __name__ == "__main__":
    print("oi2")
    asyncio.run(main())

def app(environ, start_response):
    """Simplest possible application object"""
    data = b'Hello, World!\n'
    status = '200 OK'
    response_headers = [
        ('Content-type', 'text/plain'),
        ('Content-Length', str(len(data)))
    ]
    start_response(status, response_headers)
    return iter([data])
