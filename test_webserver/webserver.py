
import os

from pathlib import Path
from aiohttp import web

ROOT = Path(__file__).parent

port = int(os.environ.get('SERVER_PORT', 9090))

async def index(request):
    content = open(str(ROOT / 'index.html')).read()
    return web.Response(content_type='text/html', text=content)


if __name__ == '__main__':

    app = web.Application()

    app.router.add_get('/', index)
    app.router.add_static('/webserver/', path= ROOT, name='static')

    web.run_app(app, port=port)






