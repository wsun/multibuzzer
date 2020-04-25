import React, { useState, useEffect } from 'react';
import { get, some, values, sortBy, orderBy, isEmpty, round } from 'lodash';
import { Howl } from 'howler';
import { AiOutlineDisconnect } from 'react-icons/ai';

export default function Table(game) {
  const [loaded, setLoaded] = useState(false);
  const [buzzed, setBuzzer] = useState(
    some(game.G.queue, (o) => o.id === game.playerID)
  );
  const [sound, setSound] = useState(false);
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

  const players = game.gameMetadata
    .filter((p) => p.name)
    .map((p) => ({ ...p, id: String(p.id) }));
  // host is lowest user
  const firstPlayer =
    get(
      sortBy(players, (p) => parseInt(p.id, 10)),
      '0'
    ) || null;
  const isHost = get(firstPlayer, 'id') === game.playerID;

  const queue = sortBy(values(game.G.queue), ['timestamp']);
  const buzzedPlayers = queue
    .map((p) => {
      const player = players.find((player) => player.id === p.id);
      return {
        ...p,
        name: player.name,
        connected: player.connected,
      };
    })
    .filter((p) => p.name);
  // active players who haven't buzzed
  const activePlayers = orderBy(
    players.filter((p) => !some(queue, (q) => q.id === p.id)),
    ['connected', 'name'],
    ['desc', 'asc']
  );

  const timeDisplay = (delta) => {
    if (delta > 1000) {
      return `+${round(delta / 1000, 2)} s`;
    }
    return `+${delta} ms`;
  };

  return (
    <div>
      <section className="mobile-fixed">
        <p id="room-title">Room {game.gameID}</p>
        {!game.isConnected ? (
          <p className="warning">
            Your connection is unstable - please refresh
          </p>
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
          {isHost ? (
            <button
              disabled={game.G.queue.length === 0}
              onClick={() => game.moves.resetBuzzers()}
            >
              Reset all buzzers
            </button>
          ) : null}
          <button onClick={() => setSound(!sound)}>
            {sound ? 'Turn off sound' : 'Turn on sound '}
          </button>
        </div>
      </section>
      <div className="queue">
        <p>Players Buzzed</p>
        <ul>
          {buzzedPlayers.map(({ id, name, timestamp, connected }, i) => (
            <li key={id}>
              <div className={`bold ${!connected ? 'dim' : ''}`}>
                {name}
                {!connected ? (
                  <AiOutlineDisconnect className="disconnected" />
                ) : (
                  ''
                )}
              </div>
              {i > 0 ? (
                <div className="mini">
                  {timeDisplay(timestamp - queue[0].timestamp)}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="queue">
        <p>Other Players</p>
        <ul>
          {activePlayers.map(({ id, name, connected }) => (
            <li key={id}>
              <div className={`bold ${!connected ? 'dim' : ''}`}>
                {name}
                {!connected ? (
                  <AiOutlineDisconnect className="disconnected" />
                ) : (
                  ''
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
