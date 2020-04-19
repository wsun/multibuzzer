import React from 'react';
import { Button, Navbar } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router';
import { leaveRoom } from '../lib/endpoints';

export default function Header({ auth, clearAuth }) {
  const location = useLocation();
  const history = useHistory();

  // leave current game
  async function leave() {
    try {
      await leaveRoom(auth.roomID, auth.playerID, auth.credentials);
      clearAuth();
      history.push('/');
    } catch (error) {
      console.log('leave error', error);
      clearAuth();
      history.push('/');
    }
  }

  return (
    <header>
      <Navbar>
        <Navbar.Brand>
          <span role="img" aria-label="buzzer">
            🛎️
          </span>{' '}
          Multibuzzer
        </Navbar.Brand>
        {location.pathname.length > 1 ? (
          <Button onClick={() => leave()}>Leave game</Button>
        ) : null}
      </Navbar>
    </header>
  );
}
