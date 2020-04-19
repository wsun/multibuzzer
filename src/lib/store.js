import { ActivePlayers } from 'boardgame.io/core';

function setHost(G, ctx, id) {
  G.hostId = id;
}

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
  setup: () => ({ hostId: null, queue: {} }),
  phases: {
    setHost: {
      start: true,
      moves: { setHost },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
      endIf: (G) => G.hostId,
      next: 'playLive',
    },
    playLive: {
      moves: { buzz, resetBuzzers, restart },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};
