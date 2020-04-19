import React from 'react';
import { useParams } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Buzzer } from '../lib/store';
import { GAME_SERVER } from '../lib/endpoints';
import Table from '../components/Table';

export default function Game({ auth }) {
  const { id: roomID } = useParams();
  const App = Client({
    game: Buzzer,
    board: Table,
    multiplayer: SocketIO({ server: GAME_SERVER }),
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
