import React, { useState, useEffect } from 'react';
import { get, some, values, sortBy, isEmpty } from 'lodash';
import { Howl } from 'howler';

export default function Table(game) {
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
    if (!soundPlayed && game.G.queue)
      if (!game.G.queue[game.playerID]) {
        setBuzzer(false);
      }
    if (isEmpty(game.G.queue)) {
      setSoundPlayed(false);
    } else {
      playSound();
    }
  }, [game.playerID, game.G.queue]);

  console.log(game);
  if (game.ctx.phase === 'setHost') {
    return (
      <div>
        <select
          value={host}
          onChange={(e) => selectHost(e.currentTarget.value)}
        >
          <option value={null}></option>
          {game.gameMetadata.map((player) => (
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
  return (
    <div>
      <p id="room-title">Room {game.gameID}</p>
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
        <button onClick={() => setSound(!sound)}>
          {sound ? 'Turn off sounds' : 'Turn on sound '}
        </button>
      </div>
      <div id="reset">
        <button
          disabled={game.G.queue.length === 0}
          onClick={() => game.moves.resetBuzzers()}
        >
          Reset all buzzers
        </button>
      </div>
      <div id="queue">
        <h4>Buzzed</h4>
        <ul>
          {queue.map(({ playerId, timestamp }, i) => (
            <li key={playerId}>
              <span className="bold">
                {get(
                  game.gameMetadata.find(
                    (player) => String(player.id) === playerId
                  ),
                  'name'
                )}
              </span>
              {i > 0 ? ` +${timestamp - queue[0].timestamp} ms` : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
