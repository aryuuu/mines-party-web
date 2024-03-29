import { combineReducers } from 'redux';

import gameReducer from './game-reducer';
import socketReducer from './socket-reducer';
import roomReducer from './room-reducer';
import playerReducer from './player-reducer';

export const rootReducer = combineReducers({
  gameReducer,
  socketReducer,
  roomReducer,
  playerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
