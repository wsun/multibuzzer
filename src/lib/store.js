import { ActivePlayers } from 'boardgame.io/core';

function resetBuzzers(G) {
  G.queue = {};
}

function buzz(G, ctx, id) {
  const newQueue = {
    ...G.queue,
  };
  if (!newQueue[id]) {
    // buzz on server will overwrite the client provided timestamp
    newQueue[id] = { id, timestamp: new Date().getTime() };
  }
  G.queue = newQueue;
}

function restart(G, ctx) {
  G.queue = {};
  G.hostId = null;
  ctx.events.setPhase('setHost');
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 100,
  setup: () => ({ hostId: '0', queue: {} }),
  phases: {
    play: {
      start: true,
      moves: { buzz, resetBuzzers, restart },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};
