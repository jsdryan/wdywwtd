const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const { bottender } = require('bottender');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

// const port = Number(process.env.PORT) || 6000;
const port = Number(process.env.PORT) || 5000;

// the request handler of the bottender app
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };

  server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  server.use(express.json({ verify }));
  server.use(express.urlencoded({ extended: false, verify }));

  // your custom route
  server.get('/welcome', (_, res) => {
    res.json({ ok: true });
  });

  // route for webhook request
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
