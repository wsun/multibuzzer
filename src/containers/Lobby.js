import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import { get } from 'lodash';
import { joinRoom, getRoom, createRoom } from '../lib/endpoints';

export default function Lobby({ setAuth }) {
  const location = useLocation();
  const prefilledRoomID = get(location, 'state.roomID');

  const history = useHistory();
  const [name, setName] = useState('');
  const [room, setRoom] = useState(prefilledRoomID || '');
  const [joinMode, setJoinMode] = useState(true);

  // enter room: find room, then join it
  async function enterRoom(roomId) {
    try {
      // get room
      const roomRes = await getRoom(roomId);
      if (roomRes.status !== 200)
        throw new Error(`Server room error ${roomRes.status}`);
      const room = roomRes.data;

      // determine seat to take
      const playerSeat = room.players.find((player) => player.name === name);
      const freeSeat = room.players.find((player) => !player.name);
      if (!playerSeat && !freeSeat) {
        throw new Error('Room is full');
      }
      const playerID = get(playerSeat, 'id') || get(freeSeat, 'id');
      const joinRes = await joinRoom(room.roomID, playerID, name);
      if (joinRes.status !== 200) {
        throw new Error(`Join room error ${joinRes.status}`);
      }
      const creds = joinRes.data;
      const auth = {
        playerID,
        credentials: creds.playerCredentials,
        roomID: room.roomID,
      };

      // save auth and go to room
      setAuth(auth);
      history.push(`/${room.roomID}`);
    } catch (error) {
      console.log('joinError', error);
    }
  }

  // make room: create room, then join it
  async function makeRoom() {
    try {
      const createRes = await createRoom();
      if (createRes.status !== 200) {
        throw new Error(`Create room error ${createRes.status}`);
      }
      const roomID = createRes.data.gameID;
      await enterRoom(roomID);
    } catch (error) {
      console.log('createError', error);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (joinMode) {
      enterRoom(room);
    } else {
      makeRoom();
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
