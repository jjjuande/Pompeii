/** @module StartupActions */

import { generateDeck } from "./CardsActions";
import { setPlayerArray, addPlayers } from "./PlayersActions";

export const gameSetup = numberOfPlayers => async dispatch => {
  let nop = numberOfPlayers;
  if (!nop) nop = Math.ceil(Math.random() * 3) + 1;
  if (nop < 2) nop = 2;
  if (nop > 4) nop = 4;
  const players = [];
  for (let i = 1; i <= nop; i += 1) {
    players.push(`player${i}`);
  }
  await dispatch(setPlayerArray(players));
  const details = {};
  players.forEach((player, idx) => {
    details[player] = {
      name: `Player ${idx + 1}`,
      hand: []
    };
  });
  await dispatch(addPlayers(details));
  await dispatch(generateDeck());
};