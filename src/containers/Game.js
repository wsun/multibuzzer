import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Buzzer } from '../lib/store';
import { GAME_SERVER } from '../lib/endpoints';
import Header from '../components/Header';
import Table from '../components/Table';

function LoadingSpinner() {
  return (
    <Container className="container-loading">
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </Container>
  );
}

export default function Game({ auth, setAuth }) {
  const { id: roomID } = useParams();
  const App = Client({
    game: Buzzer,
    board: Table,
    multiplayer: SocketIO({ server: GAME_SERVER }),
    debug: false,
    loading: LoadingSpinner,
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
    </main>
  );
}
