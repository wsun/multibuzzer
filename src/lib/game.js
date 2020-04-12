import { ActivePlayers } from 'boardgame.io/core';
import { sortBy, uniqBy } from 'lodash';

function setHost(G, ctx, playerId) {
  G.hostId = playerId;
}

function resetBuzzers(G) {
  G.queue = [];
}

function buzz(G, ctx, playerId, timestamp) {
  G.queue = uniqBy(
    sortBy([...G.queue, { playerId, timestamp }], ['timestamp']),
    (o) => o.playerId
  );
}

function restart(G, ctx) {
  G.queue = [];
  G.hostId = null;
  ctx.events.setPhase('setHost');
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 100,
  setup: () => ({ hostId: null, queue: [] }),
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
