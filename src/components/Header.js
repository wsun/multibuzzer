import React from 'react';
import { Navbar } from 'react-bootstrap';

export default function Header() {
  return (
    <header>
      <Navbar>
        <Navbar.Brand>
          <span role="img" aria-label="buzzer">
            🛎️
          </span>{' '}
          MultiBuzzer
        </Navbar.Brand>
      </Navbar>
    </header>
  );
}
