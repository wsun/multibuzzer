import path from 'path';
import serve from 'koa-static';

const Server = require('boardgame.io/server').Server;
const Buzzer = require('./lib/store').Buzzer;
const server = Server({ games: [Buzzer] });

const PORT = process.env.PORT || 4001;
const { app } = server;

app.use(serve(path.join(__dirname, '../build')));

function randomString(length, chars) {
  let result = '';
  // eslint-disable-next-line no-plusplus
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function generateReferralCode(length = 6) {
  return randomString(length, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

server.run({
  port: PORT,
  lobbyConfig: { uuid: () => generateReferralCode(6) },
});
