import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { get, isNil } from 'lodash';

import Header from './components/Header';
import Lobby from './containers/Lobby';
import Game from './containers/Game';
import './App.css';

function App() {
  const [auth, setAuth] = useState({
    playerID: null,
    credentials: null,
    roomID: null,
  });

  return (
    <div className="App">
      <main>
        <Router>
          <Header
            auth={auth}
            clearAuth={() =>
              setAuth({ playerID: null, credentials: null, roomID: null })
            }
          />
          <Switch>
            <Route
              path="/:id"
              render={({ location, match }) => {
                const roomID = get(match, 'params.id');
                // redirect if the roomID in auth doesn't match, or no credentials
                return roomID &&
                  auth.roomID === roomID &&
                  !isNil(auth.credentials) &&
                  !isNil(auth.playerID) ? (
                  <Game auth={auth} />
                ) : (
                  <Redirect
                    to={{
                      pathname: '/',
                      state: { from: location, roomID },
                    }}
                  />
                );
              }}
            />
            <Route path="/">
              <Lobby setAuth={setAuth} />
            </Route>
          </Switch>
        </Router>
      </main>
    </div>
  );
}

export default App;
