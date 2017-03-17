// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import counter from './counter';
import sideBarReducer from './sidebar';

const rootReducer = combineReducers({
  counter,
  routing,
  sideBarReducer
});

export default rootReducer;
