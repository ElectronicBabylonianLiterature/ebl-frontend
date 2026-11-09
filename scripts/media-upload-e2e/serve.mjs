import { build } from '../../.media-work/browser-tools/node_modules/esbuild/lib/main.js'
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
await build({
  entryPoints: ['scripts/media-upload-e2e/app.tsx'],
  bundle: true,
  outfile: '.media-work/e2e-dist/app.js',
  sourcemap: true,
  define: {
    'process.env.REACT_APP_DICTIONARY_API_URL': '""',
    'process.env.NODE_ENV': '"development"',
  },
  alias: { 'react-router/dom': 'react-router/dist/development/dom-export.js' },
  loader: {
    '.sass': 'empty',
    '.scss': 'empty',
    '.svg': 'dataurl',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
  },
  tsconfig: 'tsconfig.json',
})
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/media')) {
    const proxy = http.request(
      {
        hostname: '127.0.0.1',
        port: 18808,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (upstream) => {
        res.writeHead(upstream.statusCode, upstream.headers)
        upstream.pipe(res)
      },
    )
    proxy.on('error', (error) => {
      res.writeHead(502)
      res.end(error.message)
    })
    req.pipe(proxy)
    return
  }
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Media upload verification</title><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script></html>',
    )
    return
  }
  try {
    const file = path.basename(req.url.split('?')[0])
    res.setHeader(
      'Content-Type',
      file.endsWith('.css') ? 'text/css' : 'application/javascript',
    )
    res.end(await readFile(path.join('.media-work/e2e-dist', file)))
  } catch {
    res.writeHead(404)
    res.end()
  }
})
server.listen(18809, '127.0.0.1', () =>
  console.log('Local media UI http://127.0.0.1:18809'),
)
