import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { bootstrap } from './main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const serverIndexHtml = join(serverDistFolder, 'index.server.html');
  const devIndexHtml = join(serverDistFolder, 'index.html');
  const indexHtml = existsSync(serverIndexHtml) ? serverIndexHtml : devIndexHtml;

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.static(browserDistFolder, { maxAge: '1y' }));

  server.get(/.*/, (req, res, next) => {
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: req.originalUrl,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

export const reqHandler = createNodeRequestHandler(app());

function run(): void {
  const port = Number(process.env['PORT'] || 4000);
  const server = app();

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

if (isMainModule(import.meta.url)) {
  run();
}
