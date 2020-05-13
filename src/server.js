import path from 'path';
import serve from 'koa-static';
import ratelimit from 'koa-ratelimit';
import { v4 as uuidv4 } from 'uuid';

const Server = require('boardgame.io/server').Server;
const Buzzer = require('./lib/store').Buzzer;
const server = Server({ games: [Buzzer], generateCredentials: () => uuidv4() });

const PORT = process.env.PORT || 4001;
const { app } = server;

const FRONTEND_PATH = path.join(__dirname, '../build');
app.use(
  serve(FRONTEND_PATH, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

function randomString(length, chars) {
  let result = '';
  // eslint-disable-next-line no-plusplus
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// rate limiter
const db = new Map();
app.use(
  ratelimit({
    driver: 'memory',
    db: db,
    // 1 min window
    duration: 60000,
    errorMessage: 'Too many requests',
    id: (ctx) => ctx.ip,
    max: 25,
    whitelist: (ctx) => {
      return !ctx.path.includes(`games/${Buzzer.name}`);
    },
  })
);

server.run(
  {
    port: PORT,
    lobbyConfig: { uuid: () => randomString(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ') },
  },
  () => {
    // rewrite rule for catching unresolved routes and redirecting to index.html
    // for client-side routing
    server.app.use(async (ctx, next) => {
      await serve(FRONTEND_PATH)(
        Object.assign(ctx, { path: 'index.html' }),
        next
      );
    });
  }
);
