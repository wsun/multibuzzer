import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import { get } from 'lodash';
import { joinRoom, getRoom, createRoom } from '../lib/endpoints';
import Header from '../components/Header';

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
    <Form className="lobby-form" onSubmit={(e) => handleSubmit(e)}>
      <h3>Join a game</h3>
      <Form.Group controlId="room">
        <Form.Label>Room code</Form.Label>
        <Form.Control value={room} onChange={(e) => setRoom(e.target.value)} />
      </Form.Group>

      <Form.Group controlId="name">
        <Form.Label>Your name</Form.Label>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </Form.Group>

      <button type="submit">Join</button>
      <div className="switcher">
        Hosting a game?{' '}
        <button className="inline" onClick={() => setJoinMode(false)}>
          Create room
        </button>
      </div>
    </Form>
  ) : (
    <Form className="lobby-form" onSubmit={(e) => handleSubmit(e)}>
      <h3>Host a game</h3>
      <Form.Group controlId="name">
        <Form.Label>Your name</Form.Label>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </Form.Group>

      <button type="submit">Host</button>
      <div className="switcher">
        Joining a game?{' '}
        <button className="inline" onClick={() => setJoinMode(true)}>
          Enter room
        </button>
      </div>
    </Form>
  );

  const touts = (
    <div className="touts">
      <div>
        <h4>Simple multiplayer buzzer system</h4>
        <p>Host a room and invite up to 100 people to join</p>
      </div>
      <div>
        <h4>Join on any device</h4>
        <p>
          Use your computer, smartphone, or tablet to join and start buzzing
        </p>
      </div>
      <div>
        <h4>Free to use</h4>
        <p>
          Perfect for online quiz bowl, trivia night, or a classroom activity
        </p>
      </div>
    </div>
  );

  return (
    <main id="lobby">
      <section className="primary d-none d-md-flex">
        <div id="lobby-left">
          <Header />
          <section className="container-half">{touts}</section>
        </div>
        <div id="lobby-right">
          <section className="container-half">{form}</section>
        </div>
      </section>
      <section className="primary d-block d-md-none">
        <Header />
        <Container>{form}</Container>
        <div className="divider" />
        <Container>{touts}</Container>
      </section>
      {/* TODO FOOTER */}
    </main>
  );
}
