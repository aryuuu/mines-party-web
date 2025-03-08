import { ActionType } from "../types";
import { Player, Room } from "../../types";

export enum ACTIONS {
  SET_ROOM = "SET_ROOM",
  SET_ROOM_ID = "SET_ROOM_ID",
  RESET_ROOM = "RESET_ROOM",
  SET_CAPACITY = "SET_CAPACITY",
  SET_HOST = "SET_HOST",
  SET_START = "SET_START",
  SET_STOP = "SET_STOP",
  SET_PLAYERS = "SET_PLAYERS",
  SET_FIELD = "SET_FIELD",
  ADD_PLAYER = "ADD_PLAYER",
  REMOVE_PLAYER = "REMOVE_PLAYER",
  PAUSE_GAME = "PAUSE_GAME",
  END_GAME = "END_GAME",
  SET_PLAYER_SCORE = "SET_PLAYER_SCORE",
  MOVE_DOWN = "MOVE_DOWN",
  MOVE_UP = "MOVE_UP",
  MOVE_LEFT = "MOVE_LEFT",
  MOVE_RIGHT = "MOVE_RIGHT",
  SET_CURRENT_POSITION = "SET_CURRENT_POSITION",
  SET_PLAYER_POSITION = "SET_PLAYER_POSITION",
}

const initialState: Room = {
  id_room: "",
  capacity: 0,
  id_host: "",
  is_started: false,
  players: {},
  player_positions: {},
  player_scores: [],
  field: [],
  time: 0,
  flag_count: 0,
  mine_count: 0,
  current_col: 0,
  current_row: 0,
};

const reducer = (state: Room = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.SET_ROOM:
      state.id_room = payload.id_room;
      state.id_host = payload.id_host;
      state.capacity = payload.capacity;
      state.is_started = payload.is_started;
      state.players = payload.players;

      return state;
    case ACTIONS.SET_ROOM_ID:
      return {
        ...state,
        id_room: payload,
      };
    case ACTIONS.RESET_ROOM:
      return {
        ...initialState,
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
      };
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
      console.log({payload});
      
      return {
        ...state,
        players: {...state.players, [payload.id_player]: payload}
      };
    case ACTIONS.REMOVE_PLAYER:
      delete state.players[payload];
      return {
        ...state,
        players: state.players
      };
    case ACTIONS.END_GAME:
      return {
        ...state,
        is_started: false,
      };
    case ACTIONS.SET_PLAYER_SCORE: {
      if (Object.keys(payload.scoreboard).length == 0) {
        return {...state};
      }
      
      Object.keys(payload.scoreboard).forEach((id: string) => {
        state.players[id].score = payload.scoreboard[id]
      });
      
      if (state.player_scores.length !== 0) {
        state.player_scores.forEach(ps => ps.scores.push({score: payload.scoreboard[ps.id_player], timestamp: payload.timestamp}));
      } else {
        state.player_scores = Object.keys(payload.scoreboard).map(id => ({
          id_player: id, 
          player: state.players[id], 
          scores: [{score: payload.scoreboard[id], timestamp: payload.timestamp}]
        }));
      }
      return {
        ...state,
        players: {...state.players},
        player_scores: [...state.player_scores],
      }
    }

    case ACTIONS.SET_FIELD:
      return {
        ...state,
        field: payload,
      };
    case ACTIONS.MOVE_DOWN:
      return {
        ...state,
        current_row:
          state.current_row + 1 < state.field.length
            ? state.current_row + 1
            : 0,
      };
    case ACTIONS.MOVE_UP:
      return {
        ...state,
        current_row:
          state.current_row - 1 >= 0
            ? state.current_row - 1
            : state.field.length - 1,
      };
    case ACTIONS.MOVE_LEFT:
      return {
        ...state,
        current_col:
          state.current_col - 1 >= 0
            ? state.current_col - 1
            : state.field[0].length - 1,
      };
    case ACTIONS.MOVE_RIGHT:
      return {
        ...state,
        current_col:
          state.current_col + 1 < state.field[0].length
            ? state.current_col + 1
            : 0,
      };
    case ACTIONS.SET_CURRENT_POSITION:
      return {
        ...state,
        current_col: payload.col,
        current_row: payload.row,
      };
    case ACTIONS.SET_PLAYER_POSITION:
      return {
        ...state,
        player_positions: {
          ...state.player_positions,
          [payload.player_id]: {
            row: payload.row,
            col: payload.col,
          }
        }
      };
      // console.log({ state })
      // return state;
    default:
      return state;
  }
};

export default reducer;
