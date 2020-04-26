import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Buzzer } from '../lib/store';
import { GAME_SERVER } from '../lib/endpoints';
import Table from '../components/Table';
import Header from '../components/Header';

export default function Game({ auth, setAuth }) {
  const { id: roomID } = useParams();

  const loadingComponent = () => (
    <div>
      <Header
        auth={auth}
        clearAuth={() =>
          setAuth({
            playerID: null,
            credentials: null,
            roomID: null,
          })
        }
      />
      <Container className="container-loading">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    </div>
  );

  const App = Client({
    game: Buzzer,
    board: Table,
    multiplayer: SocketIO({ server: GAME_SERVER }),
    debug: false,
    loading: loadingComponent,
  });

  return (
    <main id="game">
      <div className="primary">
        <App
          gameID={roomID}
          playerID={String(auth.playerID)}
          credentials={auth.credentials}
          headerData={{ ...auth, setAuth }}
        />
      </div>
    </main>
  );
}
