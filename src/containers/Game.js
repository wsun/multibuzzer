import React from 'react';
import { useParams } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Buzzer } from '../lib/store';
import { GAME_SERVER } from '../lib/endpoints';
import Header from '../components/Header';
import Table from '../components/Table';
import Footer from '../components/Footer';

export default function Game({ auth, setAuth }) {
  const { id: roomID } = useParams();
  const App = Client({
    game: Buzzer,
    board: Table,
    multiplayer: SocketIO({ server: GAME_SERVER }),
    debug: false,
  });

  return (
    <main id="game">
      <div className="primary">
        <Header
          auth={auth}
          clearAuth={() =>
            setAuth({ playerID: null, credentials: null, roomID: null })
          }
        />
        <App
          gameID={roomID}
          playerID={String(auth.playerID)}
          credentials={auth.credentials}
        />
      </div>
      <Footer />
    </main>
  );
}
