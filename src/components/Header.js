import React from 'react';
import { Button, Navbar } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { leaveRoom } from '../lib/endpoints';

function Logo({ size = 25 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 95 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="#F2994A" />
      <circle cx="75" cy="20" r="20" fill="#348DF5" />
      <circle cx="20" cy="75" r="20" fill="#348DF5" />
      <circle cx="75" cy="75" r="20" fill="#348DF5" />
    </svg>
  );
}

export default function Header({ auth = {}, clearAuth }) {
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
          <Logo /> Multibuzzer
        </Navbar.Brand>
        {clearAuth ? <Button onClick={() => leave()}>Leave game</Button> : null}
      </Navbar>
    </header>
  );
}
