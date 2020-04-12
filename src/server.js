import path from 'path';
import serve from 'koa-static';

const Server = require('boardgame.io/server').Server;
const Buzzer = require('./lib/game').Buzzer;
const server = Server({ games: [Buzzer] });

const PORT = process.env.PORT || 4001;
const { app } = server;

app.use(serve(path.join(__dirname, '../build')));

server.run(PORT, () => {
  console.log(`Serving at: http://localhost:${PORT}/`);
});
