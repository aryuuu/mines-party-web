import { ActionType } from "../types"
import { Player } from '../../types';

export enum ACTIONS {
  RESET_PLAYER = 'RESET_PLAYER',
  SET_NAME = 'SET_NAME',
  SET_ID = 'SET_ID',
  SET_AVATAR = 'SET_AVATAR',
  RESET_AVATAR = 'RESET_AVATAR',
  SET_ADMIN = 'SET_ADMIN',
  RESET_ADMIN = 'RESET_ADMIN',
}

const initialState: Player = {
  id_player: '',
  avatar_url: '',
  username: '',
  is_admin: false,
  score: 0
}

const reducer = (state = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.RESET_PLAYER:
      state = initialState
      return state;
    case ACTIONS.SET_NAME:
      return {
        ...state,
        username: payload
      };
    case ACTIONS.SET_ID:
      return {
        ...state,
        id_player: payload
      }
    case ACTIONS.SET_AVATAR:
      return {
        ...state,
        avatar_url: payload
      };
    case ACTIONS.RESET_AVATAR:
      return {
        ...state,
        avatar_url: ''
      };
    case ACTIONS.SET_ADMIN:
      return {
        ...state,
        is_admin: true
      };
    case ACTIONS.RESET_ADMIN:
      return {
        ...state,
        is_admin: false
      };

    default:
      return state;
  }
}

export default reducer;

