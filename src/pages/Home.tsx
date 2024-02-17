import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers/root-reducer";

import { ACTIONS as ROOM_ACTIONS } from "../redux/reducers/room-reducer";
import { ACTIONS as PLAYER_ACTIONS } from "../redux/reducers/player-reducer";
import { ACTIONS as SOCKET_ACTIONS } from "../redux/reducers/socket-reducer";
import { SocketEvents } from "../types";
import { MINES_PARTY_SERVER_BASE_URL } from "../config";

const Home = () => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [isCreate, setIsCreate] = useState(false);

  const { username, avatar_url: avatarUrl } = useSelector(
    (state: RootState) => state.playerReducer,
  );
  const { id_room: roomId } = useSelector(
    (state: RootState) => state.roomReducer,
  );
  const socket = useSelector((state: RootState) => state.socketReducer.socket);

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        event_type: isCreate
          ? SocketEvents.CREATE_ROOM
          : SocketEvents.JOIN_ROOM,
        client_name: username,
        avatar_url: avatarUrl,
      }),
    );
  };

  socket.onclose = () => {
    dispatch({
      type: ROOM_ACTIONS.RESET_ROOM,
    });
    dispatch({
      type: SOCKET_ACTIONS.REMOVE_SOCKET,
    });
    Swal.fire({
      icon: "warning",
      title: "Connection lost :(",
    });
  };

  socket.onclose = () => {
    console.log("Socket disconnected");
  };

  socket.onmessage = (ev) => {
        console.log(ev);
        const data = JSON.parse(ev.data);
        switch (data.event_type) {
            case SocketEvents.CREATE_ROOM:
                navigateTo(`/room/${roomId}`);
                dispatch({
                    type: PLAYER_ACTIONS.SET_ID,
                    payload: data.room.id_host,
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_ROOM,
                    payload: data.room,
                });
                dispatch({
                    type: PLAYER_ACTIONS.SET_ADMIN,
                });
                break;
            case SocketEvents.JOIN_ROOM:
                if (!data.success) {
                    const errorMessage = data.detail
                        ? data.detail
                        : "Failed to join room, please check the room ID";
                    return Swal.fire({
                        icon: "error",
                        title: errorMessage,
                    });
                }
                const newPlayer =
                    data.new_room.players[data.new_room.players.length - 1];
                dispatch({
                    type: PLAYER_ACTIONS.SET_ID,
                    payload: newPlayer.id_player,
                });
                dispatch({
                    type: ROOM_ACTIONS.SET_ROOM,
                    payload: data.new_room,
                });
                navigateTo(`/room/${roomId}`);
                break;
            default:
                break;
        }
  };

  const onCreateRoom = async () => {
    console.log("Create room", {
      username,
      roomId,
    });
    setIsCreate(true);
    // TODO: hit create room endpoint
    try {
      const response = await axios.post(`${MINES_PARTY_SERVER_BASE_URL}/game/create`);
      dispatch({
        type: ROOM_ACTIONS.SET_ID,
        payload: response.data,
      });
      dispatch({
        type: SOCKET_ACTIONS.INIT_SOCKET,
        payload: response.data,
      });
    } catch (error) {
      console.error("Error creating room", error);
      Swal.fire({
        icon: "error",
        title: "Error creating room",
      });
      return;
    }
    // navigateTo(`/room/${roomId}`);
  };

  const onJoinRoom = () => {
    setIsCreate(false);
    console.log("Join room", {
      username,
      roomId,
    });
    // TODO: hit join room endpoint
    // navigateTo(`/room/${roomId}`);
  };

  const onUpdateUsername = (value: string) => {
    dispatch({
      type: PLAYER_ACTIONS.SET_NAME,
      payload: value,
    });
  };

  const onUpdateRoomId = (value: string) => {
    dispatch({
      type: ROOM_ACTIONS.SET_ID,
      payload: value,
    });
  };

  return (
    <>
      <div className="text-bold">Mines Party</div>
      <div className="container mx-auto block">
        <input
          className="block"
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => onUpdateUsername(e.target.value)}
        />
        <button className="block" onClick={onCreateRoom}>
          Create room
        </button>
        <input
          className="block"
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => onUpdateRoomId(e.target.value)}
        />
        <button className="block" onClick={onJoinRoom}>
          Join room
        </button>
      </div>
    </>
  );
};

export default Home;
