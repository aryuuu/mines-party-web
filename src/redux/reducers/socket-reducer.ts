import { Socket } from "../../types";
import { ActionType } from "../types";
import { MINES_PARTY_SOCKET_SERVER_URL } from '../../config'

export const ACTIONS = {
  INIT_SOCKET: 'INIT_SOCKET',
  REMOVE_SOCKET: 'REMOVE_SOCKET'
}

const initialState: Socket = {
  socket: {} as WebSocket
}

// socket.onopen = () => {
//   console.log('connected to websocket server');
// }

// socket.onmessage = (ev) => {
//   console.log(ev.data)
// }

const reducer = (state = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.INIT_SOCKET:
      console.log('init socket');
      state.socket = new WebSocket(`${MINES_PARTY_SOCKET_SERVER_URL}/game/${payload}`);
      console.log({ payload });
      console.log({ socket: state.socket });
      return state;
    case ACTIONS.REMOVE_SOCKET:
      return {
        socket: {} as WebSocket
      }
    default:
      return state;
  }
}

export default reducer;
