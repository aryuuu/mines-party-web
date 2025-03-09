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

const reducer = (state = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.INIT_SOCKET:
      state.socket = new WebSocket(`${MINES_PARTY_SOCKET_SERVER_URL}/game/${payload}`);
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
