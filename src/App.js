import React from 'react';
import { Buzzer } from './lib/game';

import Header from './components/Header';
import Lobby from './components/Lobby';
import Table from './components/Table';
import './App.css';

const hostname = window.location.hostname;
const port = window.location.port;
const protocol = window.location.protocol;
const gameport = process.env.PORT || 4001;

const url = protocol + '//' + hostname + (port ? ':' + port : '');
const localUrl = `${protocol}//${hostname}:${gameport}`;

function App() {
  return (
    <div className="App">
      <main>
        <Header />
        <Lobby
          gameServer={process.env.NODE_ENV === 'production' ? url : localUrl}
          lobbyServer={process.env.NODE_ENV === 'production' ? url : localUrl}
          gameComponents={[{ game: Buzzer, board: Table }]}
        />
      </main>
    </div>
  );
}

export default App;
