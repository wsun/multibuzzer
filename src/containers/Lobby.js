import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import { get } from 'lodash';
import { Buzzer } from '../lib/store';

axios.defaults.headers['Content-Type'] = 'application/json';
axios.defaults.headers['Accept'] = 'application/json';

export default function Lobby({ setAuth }) {
  const location = useLocation();
  const prefilledRoomID = get(location, 'state.roomID');

  const history = useHistory();
  const [name, setName] = useState('');
  const [room, setRoom] = useState(prefilledRoomID || '');
  const [joinMode, setJoinMode] = useState(true);

  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  const gameport = process.env.PORT || 4001;

  const url = protocol + '//' + hostname + (port ? ':' + port : '');
  const localUrl = `${protocol}//${hostname}:${gameport}`;
  const lobbyServer = process.env.NODE_ENV === 'production' ? url : localUrl;

  // helper: join a room
  async function joiner(room) {
    const playerSeat = room.players.find((player) => player.name === name);
    const freeSeat = room.players.find((player) => !player.name);

    if (!playerSeat && !freeSeat) {
      throw new Error('Room is full');
    }
    const playerID = get(playerSeat, 'id') || get(freeSeat, 'id');
    const joinRes = await axios.post(
      `${lobbyServer}/games/${Buzzer.name}/${room.roomID}/join`,
      {
        playerID,
        playerName: name,
      }
    );
    if (joinRes.status !== 200) {
      throw new Error(`Join room error ${joinRes.status}`);
    }
    const creds = joinRes.data;
    return {
      playerID,
      credentials: creds.playerCredentials,
      roomID: room.roomID,
    };
  }

  // join room call: find room, then join it
  async function joinRoom(roomId) {
    try {
      const roomRes = await axios.get(
        `${lobbyServer}/games/${Buzzer.name}/${roomId}`
      );
      if (roomRes.status !== 200)
        throw new Error(`Server room error ${roomRes.status}`);
      const room = roomRes.data;
      const auth = await joiner(room);
      setAuth(auth);
      history.push(`/${room.roomID}`);
    } catch (error) {
      console.log('joinError', error);
    }
  }

  // create room call: create room, then join it
  async function createRoom() {
    try {
      const createRes = await axios.post(
        `${lobbyServer}/games/${Buzzer.name}/create`,
        {
          numPlayers: 100,
        }
      );
      if (createRes.status !== 200) {
        throw new Error(`Create room error ${createRes.status}`);
      }
      const roomID = createRes.data.gameID;
      await joinRoom(roomID);
    } catch (error) {
      console.log('createError', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (joinMode) {
      joinRoom(room);
    } else {
      createRoom();
    }
  }

  const form = joinMode ? (
    <Form id="lobby-form" onSubmit={(e) => handleSubmit(e)}>
      <Form.Group controlId="room">
        <Form.Label>Room ID</Form.Label>
        <Form.Control value={room} onChange={(e) => setRoom(e.target.value)} />
      </Form.Group>

      <Form.Group controlId="name">
        <Form.Label>Player name</Form.Label>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Join
      </Button>
    </Form>
  ) : (
    <Form id="lobby-form" onSubmit={(e) => handleSubmit(e)}>
      <Form.Group controlId="name">
        <Form.Label>Player name</Form.Label>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Host
      </Button>
    </Form>
  );

  return (
    <Container id="lobby">
      <div>
        <button onClick={() => setJoinMode(true)} disabled={joinMode}>
          Join Game
        </button>
        <button onClick={() => setJoinMode(false)} disabled={!joinMode}>
          Host Game
        </button>
      </div>
      {form}
    </Container>
  );
}
