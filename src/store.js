import { createStore, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import thunk from "redux-thunk";
import { createLogger } from 'redux-logger';
import { LOGOUT } from "./Reducers/ActionTypes";

import rootReducer from "./Reducers";
import { setupHttpClient } from './Services/httpClient';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['authReducer', 'LoginFormMethod'] // which reducer want to store
};

let composeEnhancers = compose;

if (process.env.REACT_APP_ENV === 'development') {
  const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  if (typeof composeWithDevToolsExtension === 'function') {
    composeEnhancers = composeWithDevToolsExtension;
  }
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware = [thunk];

if (process.env.REACT_APP_ENV === 'development') {
  middleware.push(createLogger({ collapsed: true, duration: true }));
}

export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

const dispatch = store.dispatch;
const onUnauthorizedCallback = () => {
  dispatch({ type: LOGOUT });
  localStorage.removeItem("user");
  localStorage.removeItem("welcome")
  localStorage.removeItem("firstImport")
  window.location.href = "/";
};

export const persistor = persistStore(store);

persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState();
  if (bootstrapped) {
    // Set up the http client upon rehydrating the persisted store.
    setupHttpClient(store, onUnauthorizedCallback)
  }
});

let currentJwt;

store.subscribe(() => {
  const prevJwt = currentJwt;
  currentJwt = store.getState().authReducer.jwt;

  if (prevJwt !== currentJwt) {
    // Set up the http client upon the auth session update.
    setupHttpClient(store, onUnauthorizedCallback);
  }
})