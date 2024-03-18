import { ActionType } from "../types"
import { Player, Room } from '../../types';

export enum ACTIONS {
  SET_ROOM = 'SET_ROOM',
  SET_ID = 'SET_ID',
  RESET_ROOM = 'RESET_ROOM',
  SET_CAPACITY = 'SET_CAPACITY',
  SET_HOST = 'SET_HOST',
  SET_START = 'SET_START',
  SET_STOP = 'SET_STOP',
  SET_PLAYERS = 'SET_PLAYERS',
  SET_FIELD = 'SET_FIELD',
  ADD_PLAYER = 'ADD_PLAYER',
  REMOVE_PLAYER = 'REMOVE_PLAYER',
  PAUSE_GAME = 'PAUSE_GAME',
  END_GAME = 'END_GAME',
  SET_PLAYER_SCORE = 'SET_PLAYER_SCORE',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_UP = 'MOVE_UP',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
}

const initialState: Room = {
  id_room: '',
  capacity: 0,
  id_host: '',
  is_started: false,
  players: [],
  field: [],
  time: 0,
  flag_count: 0,
  mine_count: 0,
}

const reducer = (state = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.SET_ROOM:
      state.id_room = payload.id_room;
      state.id_host = payload.id_host;
      state.capacity = payload.capacity;
      state.is_started = payload.is_started;
      state.players = payload.players;

      return state;
    case ACTIONS.SET_ID:
      return {
        ...state,
        id_room: payload,
      };
    case ACTIONS.RESET_ROOM:
      return {
        ...initialState
      };
    case ACTIONS.SET_CAPACITY:
      return {
        ...state,
        capacity: payload,
      };
    case ACTIONS.SET_HOST:
      return {
        ...state,
        id_host: payload,
      }
    case ACTIONS.SET_START:
      return {
        ...state,
        is_started: true,
      };
    case ACTIONS.SET_STOP:
      return {
        ...state,
        is_started: false,
      };
    case ACTIONS.SET_PLAYERS:
      return {
        ...state,
        players: payload,
      };
    case ACTIONS.ADD_PLAYER:
      return {
        ...state,
        players: [...state.players, payload]
      }
    case ACTIONS.REMOVE_PLAYER:
      const newPlayers = state.players.filter(
        (player: Player) => player.id_player !== payload)
      return {
        ...state,
        players: newPlayers
      }
    case ACTIONS.END_GAME:
      return {
        ...state,
        is_started: false,
      }
    case ACTIONS.SET_PLAYER_SCORE:
      console.log(payload);
      const tempPlayers = state.players.map((p: Player) => {
        if (p.id_player === payload.id_player) {
          return ({
            ...p,
            score: payload.score
          })
        }
        return p;
      })
      return {
        ...state,
        players: tempPlayers
      }
    case ACTIONS.SET_FIELD:
      return {
        ...state,
        field: payload
      }
    default:
      return state;
  }
}

export default reducer;

