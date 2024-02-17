import { createStore } from 'redux';
import { rootReducer } from '../reducers/root-reducer';

const defaultStore = createStore(rootReducer);

export const store = defaultStore;

