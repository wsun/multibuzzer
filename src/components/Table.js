import React, { useState, useEffect } from 'react';
import { get, some, values, sortBy, isEmpty, round } from 'lodash';
import { Howl } from 'howler';

export default function Table(game) {
  const [loaded, setLoaded] = useState(false);
  const [host, selectHost] = useState(null);
  const [buzzed, setBuzzer] = useState(
    some(game.G.queue, (o) => o.playerId === game.playerID)
  );
  const [sound, setSound] = useState(true);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const buzzSound = new Howl({
    src: [
      `${process.env.PUBLIC_URL}/shortBuzz.webm`,
      `${process.env.PUBLIC_URL}/shortBuzz.mp3`,
    ],
    volume: 0.5,
    rate: 1.5,
  });

  const playSound = () => {
    if (sound && !soundPlayed) {
      buzzSound.play();
      setSoundPlayed(true);
    }
  };

  useEffect(() => {
    // reset buzzer based on game
    if (!game.G.queue[game.playerID]) {
      setBuzzer(false);
    }

    // reset ability to play sound if there is no pending buzzer
    if (isEmpty(game.G.queue)) {
      setSoundPlayed(false);
    } else if (loaded) {
      playSound();
    }

    if (!loaded) {
      setLoaded(true);
    }
  }, [game.G.queue]);

  const players = game.gameMetadata;

  if (game.ctx.phase === 'setHost') {
    return (
      <div>
        <select
          value={host}
          onChange={(e) => selectHost(e.currentTarget.value)}
        >
          <option value={null}></option>
          {players
            .filter((p) => p.name)
            .map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
        </select>
        <button onClick={() => game.moves.setHost(host)}>Confirm host</button>
      </div>
    );
  }

  const queue = sortBy(values(game.G.queue), ['timestamp']);
  const timeDisplay = (delta) => {
    if (delta > 1000) {
      return `+${round(delta / 1000, 2)} s`;
    }
    return `+${delta} ms`;
  };

  return (
    <div>
      <p id="room-title">Room {game.gameID}</p>
      {!game.isConnected ? (
        <p id="warning">Your connection is unstable - please refresh</p>
      ) : null}
      <div id="buzzer">
        <button
          disabled={buzzed}
          onClick={() => {
            if (!buzzed) {
              playSound();
              game.moves.buzz(game.playerID);
              setBuzzer(true);
            }
          }}
        >
          Buzz
        </button>
      </div>
      <div id="settings">
        <button
          disabled={game.G.queue.length === 0}
          onClick={() => game.moves.resetBuzzers()}
        >
          Reset all buzzers
        </button>
        <button onClick={() => setSound(!sound)}>
          {sound ? 'Turn off sound' : 'Turn on sound '}
        </button>
      </div>
      <div id="queue">
        <p>Players Buzzed</p>
        <ul>
          {queue.map(({ playerId, timestamp }, i) => (
            <li key={playerId}>
              <div className="bold">
                {get(
                  players.find((player) => String(player.id) === playerId),
                  'name'
                )}
              </div>
              <div className="mini">
                {i > 0
                  ? ` ${timeDisplay(timestamp - queue[0].timestamp)}`
                  : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
