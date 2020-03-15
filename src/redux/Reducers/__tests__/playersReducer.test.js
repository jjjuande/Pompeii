/** PlayersReducer.test */

import * as actionTypes from "../../ActionTypes";
import Reducer from "../PlayersReducer";
import * as types from "../../../types/types";

const defaultState = types.playersState.defaults;

test("should return initial state", () => {
  expect(Reducer(undefined, { type: "", payload: "" })).toEqual(defaultState);
});

test("should handle SET_PLAYERS_ARRAY action", () => {
  const payload = ["player1", "player2"];
  const action = {
    type: actionTypes.SET_PLAYERS_ARRAY,
    payload
  };
  const state = Reducer(undefined, action);
  expect(state.players).toEqual(payload);
});

test("should handle ADD_PLAYERS action", () => {
  const payload = { player1: { value: "test" } };
  const action = {
    type: actionTypes.ADD_PLAYERS,
    payload
  };
  const state = Reducer(undefined, action);
  expect(state.details).toEqual(payload);
});

test("should handle ADD_PLAYER action", () => {
  const payload = {
    playerId: "player1",
    details: {
      value: "test"
    }
  };
  const action = {
    type: actionTypes.ADD_PLAYER,
    payload
  };
  const state = Reducer(undefined, action);
  expect(state.details).toEqual({ player1: { value: "test" } });
});

test("should handle UPDATE_PLAYER_HAND action", () => {
  const payload = {
    playerId: "player1",
    hand: ["card_2", "card_1"]
  };
  const action = {
    type: actionTypes.UPDATE_PLAYER_HAND,
    payload
  };
  const state = Reducer(undefined, action);
  expect(state.details).toEqual({
    player1: {
      ...types.playerDetails.defaults.player1,
      name: "Player 1",
      color: "#FFFFFF",
      hand: ["card_1", "card_2"]
    }
  });
});

test("should handle INCREMENT_PLAYER_POPULATION action", () => {
  const payload = {
    playerId: "player1",
    population: 1
  };
  const action = {
    type: actionTypes.INCREMENT_PLAYER_POPULATION,
    payload
  };
  const state = Reducer({ details: { player1: { population: 1 } } }, action);
  expect(state.details).toEqual({
    player1: {
      population: 2
    }
  });
});

test("should handle INCREMENT_PLAYER_CASUALTIES action", () => {
  const payload = {
    playerId: "player1",
    casualties: 1
  };
  const action = {
    type: actionTypes.INCREMENT_PLAYER_CASUALTIES,
    payload
  };
  const state = Reducer(
    { details: { player1: { casualties: 0, population: 2 } } },
    action
  );
  expect(state.details).toEqual({
    player1: {
      casualties: 1,
      population: 1
    }
  });
});

test("should handle INCREMENT_PLAYER_SAVED action", () => {
  const payload = {
    playerId: "player1",
    saved: 1
  };
  const action = {
    type: actionTypes.INCREMENT_PLAYER_SAVED,
    payload
  };
  const state = Reducer(
    { details: { player1: { population: 2, saved: 0 } } },
    action
  );
  expect(state.details).toEqual({
    player1: {
      population: 1,
      saved: 1
    }
  });
});

test("should handle SET_PLAYER_TURN action", () => {
  const payload = 1;
  const action = {
    type: actionTypes.SET_PLAYER_TURN,
    payload
  };
  const state = Reducer(undefined, action);
  expect(state.turn).toEqual(payload);
});
