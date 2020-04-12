import React, { useState, useEffect } from 'react';
import { get, some, values, sortBy } from 'lodash';

export default function Table(game) {
  const [host, selectHost] = useState(null);
  const [buzzed, setBuzzer] = useState(
    some(game.G.queue, (o) => o.playerId === game.playerID)
  );

  useEffect(() => {
    if (!game.G.queue[game.playerID]) {
      setBuzzer(false);
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
      <h3 className="room-title"></h3>
      <div id="buzzer">
        <button
          disabled={buzzed}
          onClick={() => {
            if (!buzzed) {
              game.moves.buzz(game.playerID);
              setBuzzer(true);
            }
          }}
        >
          Buzz
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
        <h3>Buzzed</h3>
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
