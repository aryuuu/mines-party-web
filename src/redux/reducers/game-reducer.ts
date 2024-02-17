import { ActionType } from "../types"

export const ACTIONS = {
  RESET: 'RESET',
  SET_CHOOSING: 'SET_CHOOSING',
  SET_NOT_CHOOSING: 'SET_NOT_CHOOSING',
  SET_CHOOSEN_CARD_IDX: 'SET_CHOOSEN_CARD_IDX',
  SET_CHOOSING_PLAYER: 'SET_CHOOSING_PLAYER',
  SET_NOT_CHOOSING_PLAYER: 'SET_NOT_CHOOSING_PLAYER',
}

const initialState = {
  is_choosing: false,
  is_choosing_player: false,
  choosen_card_index: -1,
}

const gameReducer = (state = initialState, action: ActionType) => {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.RESET:
      return {
        ...initialState
      }
    case ACTIONS.SET_CHOOSING:
      return {
        ...state,
        is_choosing: true,
        choosen_card_index: payload
      }
    case ACTIONS.SET_NOT_CHOOSING:
      return {
        ...state,
        is_choosing: false
      }
    case ACTIONS.SET_CHOOSEN_CARD_IDX:
      return {
        ...state,
        choosen_card_index: payload
      }
    case ACTIONS.SET_CHOOSING_PLAYER:
      return {
        ...state,
        is_choosing_player: true,
      };
    case ACTIONS.SET_NOT_CHOOSING_PLAYER:
      return {
        ...state,
        is_choosing_player: false,
      }
    default:
      return state;
  }
}

export default gameReducer;

