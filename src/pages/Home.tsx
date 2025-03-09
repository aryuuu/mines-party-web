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

  const { name, avatar_url: avatarUrl } = useSelector(
    (state: RootState) => state.playerReducer,
  );
  const { id_room: roomId } = useSelector(
    (state: RootState) => state.roomReducer,
  );
  const socket = useSelector((state: RootState) => state.socketReducer.socket);

  socket.onopen = () => {
    console.log("Socket connected");
    socket.send(
      JSON.stringify({
        event_type: isCreate
          ? SocketEvents.CREATE_ROOM
          : SocketEvents.JOIN_ROOM,
        client_name: name,
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
    const data = JSON.parse(ev.data);
    switch (data.event_type) {
      case SocketEvents.CREATE_ROOM:
        navigateTo(`/room/${roomId}`);
        dispatch({
          type: PLAYER_ACTIONS.SET_PLAYER_ID,
          payload: data.game_room.id_host,
        });
        dispatch({
          type: ROOM_ACTIONS.SET_ROOM,
          payload: data.game_room,
        });
        dispatch({
          type: PLAYER_ACTIONS.SET_ADMIN,
        });
        break;
      case SocketEvents.JOIN_ROOM:
        if (data.detail !== "success") {
          const errorMessage = data.detail
            ? data.detail
            : "Failed to join room, please check the room ID";
          return Swal.fire({
            icon: "error",
            title: errorMessage,
          });
        }
        dispatch({
          type: PLAYER_ACTIONS.SET_PLAYER_ID,
          payload: data.id_player,
        });
        dispatch({
          type: ROOM_ACTIONS.SET_ROOM,
          payload: data.game_room,
        });
        navigateTo(`/room/${roomId}`);
        break;
      default:
        break;
    }
  };

  const onCreateRoom = async () => {
    setIsCreate(true);
    try {
      const response = await axios.post(
        `${MINES_PARTY_SERVER_BASE_URL}/game/create`,
      );
      dispatch({
        type: ROOM_ACTIONS.SET_ROOM_ID,
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
  };

  const onJoinRoom = () => {
    setIsCreate(false);
    // TODO: only init socket if socket is not initiated
    dispatch({
      type: SOCKET_ACTIONS.INIT_SOCKET,
      payload: roomId,
    });
  };

  const onUpdateUsername = (value: string) => {
    dispatch({
      type: PLAYER_ACTIONS.SET_NAME,
      payload: value,
    });
  };

  const onUpdateRoomId = (value: string) => {
    dispatch({
      type: ROOM_ACTIONS.SET_ROOM_ID,
      payload: value,
    });
  };

  return (
    <>
      <div className="flex flex-col place-items-center justify-center items-center h-screen">
        <div className="text-bold mb-5">Mines Party</div>
        <div className="container mx-auto flex flex-col place-items-center">
          <input
            className="block"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => onUpdateUsername(e.target.value)}
          />
          <button className="block" onClick={onCreateRoom}>
            Create room
          </button>
          <input
            className="block mt-5"
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => onUpdateRoomId(e.target.value)}
          />
          <button className="block" onClick={onJoinRoom}>
            Join room
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
