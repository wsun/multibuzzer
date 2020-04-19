import React from 'react';
import { useParams } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Buzzer } from '../lib/game';
import Table from '../components/Table';

export default function Lobby({ auth }) {
  const { id: roomID } = useParams();
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  const gameport = process.env.PORT || 4001;

  const url = protocol + '//' + hostname + (port ? ':' + port : '');
  const localUrl = `${protocol}//${hostname}:${gameport}`;
  const gameServer = process.env.NODE_ENV === 'production' ? url : localUrl;

  const App = Client({
    game: Buzzer,
    board: Table,
    multiplayer: SocketIO({ server: gameServer }),
    debug: false,
  });

  return (
    <App
      gameID={roomID}
      playerID={String(auth.playerID)}
      credentials={auth.credentials}
    />
  );
}
