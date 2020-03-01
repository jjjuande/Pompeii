/** @module MainContainer */

import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";

import actions from "../redux/Actions";
import * as types from "../types/types";
import * as constant from "../data/constants";
import {
  gridByColor,
  voidLavaSquares,
  voidRunSquares,
  escapeSquares
} from "../data/gridData";

import Main from "./Main";

const mapStateToProps = state => {
  return {
    cardsState: state.cardsState,
    flagsState: state.flagsState,
    gridState: state.gridState,
    messageState: state.messageState,
    playersState: state.playersState,
    tileState: state.tileState
  };
};

const mapDispatchToProps = {
  gameSetup: actions.gameSetup,
  takeCard: actions.takeCard,
  discardCard: actions.discardCard,
  incrementPlayerTurn: actions.incrementPlayerTurn,
  updatePlayerHand: actions.updatePlayerHand,
  updateInstructions: actions.updateInstructions,
  placePeopleInSquare: actions.placePeopleInSquare,
  incrementStage: actions.incrementStage,
  incrementPlayerPopulation: actions.incrementPlayerPopulation,
  incrementPlayerCasualties: actions.incrementPlayerCasualties,
  incrementPlayerSaved: actions.incrementPlayerSaved,
  takeTile: actions.takeTile,
  placeLavaTileOnSquare: actions.placeLavaTileOnSquare,
  toggleFlags: actions.toggleFlags,
  setRunCounter: actions.setRunCounter
};

/**
 * @function MainContainer
 * @description Functional Container component for Main
 * @returns {React.Component} - Rendered component.
 */
const MainContainer = props => {
  const {
    cardsState,
    flagsState,
    gridState,
    messageState,
    playersState,
    tileState,
    gameSetup,
    takeCard,
    discardCard,
    takeTile,
    incrementPlayerTurn,
    incrementPlayerSaved,
    updatePlayerHand,
    updateInstructions,
    placePeopleInSquare,
    incrementStage,
    incrementPlayerPopulation,
    incrementPlayerCasualties,
    placeLavaTileOnSquare,
    setRunCounter
  } = props;

  const numberOfPlayers = 3;
  const numberOfEruptionTurns = 0; // 6

  useEffect(() => {
    if (!_.get(cardsState.cards)) {
      gameSetup(numberOfPlayers);
    }
  }, [cardsState.cards, gameSetup]);

  const [activePlayer, setActivePlayer] = useState();

  useEffect(() => {
    setActivePlayer(_.get(playersState, `players[${playersState.turn}]`));
  }, [playersState]);

  const [cardGrid, setCardGrid] = useState([]);

  const [placingPersonFlag, setPlacingPersonFlag] = useState(false);

  const [numberOfRelatives, setNumberOfRelatives] = useState(0);
  const [placedRelatives, setPlacedRelatives] = useState([]);
  const [wildCardFlag, setWildCardFlag] = useState(false);

  const [omenFlag, setOmenFlag] = useState(false);
  const [ad79Flag, setAD79Flag] = useState(false);
  const [sacrificeMessage, setSacrificeMessage] = useState("");
  const [readyForSacrifice, setReadyForSacrifice] = useState(false);

  const [lavaFlag, setLavaFlag] = useState(false);
  const [lavaTile, setLavaTile] = useState();
  const [wildLavaFlag, setWildLavaFlag] = useState(false);
  const [dangerZone, setDangerZone] = useState([]);
  const [placingLavaFlag, setPlacingLavaFlag] = useState(false);
  const [noPlaceToPlaceFlag, setNoPlaceToPlaceFlag] = useState(false);

  const [initialEruptionCounter, setInitialEruptionCounter] = useState(
    numberOfEruptionTurns
  );

  const [runZone, setRunZone] = useState([]);
  const [runFromSquare, setRunFromSquare] = useState();
  const [runner, setRunner] = useState();

  /**
   * @function placeRelatives
   * @description function when relatives is placed
   * @param {String} grid - grid where "parent" was placed
   */
  const placeRelatives = grid => {
    // current other occupants
    const currentOccupants = _.get(gridState, `grid.${grid}.occupants`, []);
    let thisPlacedRelatives = placedRelatives;

    // place relative in square
    placePeopleInSquare(grid, [
      ...currentOccupants,
      {
        player: activePlayer,
        gender: Math.round(Math.random()) ? "male" : "female"
      }
    ]);
    incrementPlayerPopulation(activePlayer, 1);
    thisPlacedRelatives = [...placedRelatives, grid];
    setPlacedRelatives(thisPlacedRelatives);
    setCardGrid([...cardGrid].filter(val => val !== grid));

    // if enough relatives have been placed, end relative placement
    if (thisPlacedRelatives.length === numberOfRelatives) {
      setNumberOfRelatives(0);
      setPlacedRelatives([]);
      setCardGrid([]);
      setPlacingPersonFlag(false);
      updateInstructions({
        text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
          constant.DRAW
        }`,
        color: _.get(playersState, `details[${activePlayer}].color`)
      });
    }
  };

  /**
   * @function placePerson
   * @description function when person is placed
   * @param {String} grid
   */
  const placePerson = grid => {
    // if number of relatives is set, place relative instead
    if (numberOfRelatives > 0) {
      placeRelatives(grid);
      return;
    }

    // current other occupants
    const currentOccupants = _.get(gridState, `grid.${grid}.occupants`, []);

    // place person in square
    placePeopleInSquare(grid, [
      ...currentOccupants,
      {
        player: activePlayer,
        gender: Math.round(Math.random()) ? "male" : "female"
      }
    ]);
    incrementPlayerPopulation(activePlayer, 1);

    // if there should be relatives, set relative states
    if (
      messageState.stage === 1 &&
      currentOccupants.length > 0 &&
      numberOfRelatives === 0 &&
      !wildCardFlag
    ) {
      setNumberOfRelatives(currentOccupants.length);
      setPlacedRelatives([]);
      const newGridArray = _.uniq([
        ...cardGrid,
        ...gridByColor.White,
        ...gridByColor[
          _.get(gridState, `grid.${grid}.buildingName`, "").split(" ")[0]
        ]
      ]).filter(val => val !== grid);
      setCardGrid(newGridArray);
      updateInstructions({
        text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
          constant.RELATIVE
        }`,
        color: _.get(playersState, `details[${activePlayer}].color`)
      });
    } else {
      // else complete placement
      setCardGrid([]);
      setPlacingPersonFlag(false);
      setWildCardFlag(false);
      updateInstructions({
        text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
          constant.DRAW
        }`,
        color: _.get(playersState, `details[${activePlayer}].color`)
      });
    }
  };

  /**
   * @function vacancy
   * @description checks for vacancy within a square
   * @param {String} square
   * @return {Boolean}
   */
  const vacancy = square => {
    if (
      _.get(gridState, `grid.${square}.occupants.length`, 0) <
      _.get(gridState, `grid.${square}.buildingCapacity`, 0)
    ) {
      return true;
    }
    return false;
  };

  /**
   * @function playPompCard
   * @description when player plays pompeii card
   * @param {String} card
   */
  const playPompCard = card => {
    let gridHighlights = cardsState.cards[card].grid.filter(val =>
      vacancy(val)
    );

    if (!gridHighlights.length) {
      gridHighlights = _.uniqBy([
        ...gridByColor.White,
        ...gridByColor.Grey,
        ...gridByColor.Purple,
        ...gridByColor.Turquoise,
        ...gridByColor.Brown
      ]).filter(val => vacancy(val));
      setWildCardFlag(true);
    }

    setPlacingPersonFlag(true);

    setCardGrid(gridHighlights);
    updateInstructions({
      text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
        constant.PLACE
      }`,
      color: _.get(playersState, `details[${activePlayer}].color`)
    });
  };

  /**
   * @function resolveAd79
   * @description resolve AD 79 card when drawn
   */
  const resolveAd79 = () => {
    setAD79Flag(true);
    setTimeout(() => {
      if (messageState.stage === 1) {
        const nextPlayer =
          (playersState.turn + 1) % playersState.players.length;
        setActivePlayer(nextPlayer);
        incrementPlayerTurn();
        updateInstructions({
          text: `${_.get(
            playersState,
            `details[${playersState.players[nextPlayer]}].name`
          )}: ${constant.LAVA_TILE}`,
          color: _.get(
            playersState,
            `details[${playersState.players[nextPlayer]}].color`
          )
        });
      }
    }, 100);
    incrementStage();
  };

  /**
   * @function performSacrifice
   * @description upon selection of person, sacrifice if not your own
   * @param {Object} personObj
   * @param {String} square
   */
  const performSacrifice = (personObj, square) => {
    if (!omenFlag || personObj.player === activePlayer) return;

    const currentOccupants = _.get(gridState, `grid.${square}.occupants`, []);

    const idx = currentOccupants
      .map(person => person.player)
      .indexOf(personObj.player);
    currentOccupants.splice(idx, 1);

    if (!readyForSacrifice) return;
    setSacrificeMessage(
      `${_.get(
        playersState,
        `details[${activePlayer}].name`
      )} SACRIFICES one of ${_.get(
        playersState,
        `details[${personObj.player}].name`
      )}'s people! (click to continue)`
    );
    placePeopleInSquare(square, currentOccupants);
    incrementPlayerCasualties(personObj.player, 1);

    setReadyForSacrifice(false);
    setOmenFlag(false);
    updateInstructions({
      text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
        constant.DRAW
      }`,
      color: _.get(playersState, `details[${activePlayer}].color`)
    });
  };

  /**
   * @function resolveOmen
   * @description resolve Omen card when drawn - sacrifice another player's person
   */
  const resolveOmen = () => {
    setReadyForSacrifice(true);
    updateInstructions({
      text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
        constant.SACRIFICE
      }`,
      color: _.get(playersState, `details[${activePlayer}].color`)
    });
    setOmenFlag(true);
  };

  /**
   * @function drawCard
   * @description draw card from deck
   */
  const drawCard = () => {
    // draw card
    const takenCard = cardsState.deck[cardsState.deck.length - 1];
    takeCard();

    // check for AD79
    if (_.get(cardsState, `cards[${takenCard}].type`) === constant.AD79) {
      discardCard(takenCard);
      resolveAd79();
      return;
    }

    // check for Omen
    if (_.get(cardsState, `cards[${takenCard}].type`) === constant.OMEN) {
      discardCard(takenCard);
      resolveOmen();
      return;
    }

    const newHand = [
      ..._.get(playersState, `details[${activePlayer}].hand`),
      takenCard
    ];

    // add card to player hand
    updatePlayerHand(activePlayer, newHand);

    // next player's turn
    incrementPlayerTurn();
  };

  /**
   * @function highlightDangerZones
   * @description send list of available tiles to highlight component
   * @param {String} tile - picked lava tile
   */
  const highlightDangerZones = tile => {
    setLavaTile(tile);
    setPlacingLavaFlag(true);
    setLavaFlag(false);

    const hotZones = [];
    let homeVent = "";
    const gridKeys = Object.keys(gridState.grid);
    gridKeys.forEach(key => {
      if (_.get(gridState, `grid.${key}.lava`) === tile) {
        hotZones.push(key);
      }
      if (_.get(gridState, `grid.${key}.ventName`) === tile) {
        homeVent = key;
      }
    });

    if (!hotZones.length) {
      setDangerZone([homeVent]);
    } else {
      const warmZones = [];
      hotZones.forEach(zone => {
        const coord = zone.split("_");
        warmZones.push(
          `${Math.min(parseFloat(coord[0]) + 1, 6)}_${coord[1]}`,
          `${Math.max(parseFloat(coord[0]) - 1, 0)}_${coord[1]}`,
          `${coord[0]}_${Math.min(parseFloat(coord[1]) + 1, 10)}`,
          `${coord[0]}_${Math.max(parseFloat(coord[1]) - 1, 0)}`
        );
      });
      const filteredZones = _.uniqBy(
        warmZones.filter(zone => {
          return (
            !_.get(gridState, `grid.${zone}.lava`) &&
            !voidLavaSquares.includes(zone)
          );
        })
      );
      if (filteredZones.length) {
        setDangerZone(filteredZones);
      } else {
        setNoPlaceToPlaceFlag(true);
      }
    }
  };

  /**
   * @function resolveNoPlaceToPlace
   * @description continue from no place to place
   */
  const resolveNoPlaceToPlace = () => {
    setNoPlaceToPlaceFlag(false);
    setPlacingLavaFlag(false);
    setLavaTile();
    setDangerZone([]);
    incrementPlayerTurn();
  };

  /**
   * @function drawTile
   * @description drawing a tile during stage 3
   */
  const drawTile = () => {
    const tilePile = [...tileState.pile];

    // draw tile
    const takenTile = tilePile.pop();
    setLavaTile(takenTile);
    takeTile();

    const wilds = _.get(tileState, `tiles.${takenTile}.wilds`);
    if (wilds) {
      setWildLavaFlag(true);
    } else {
      highlightDangerZones(takenTile);
    }
    setLavaFlag(true);
  };

  /**
   * @function runForYourLives
   * @description player can now run two of their people
   */
  const runForYourLives = async () => {
    await updateInstructions({
      text: `${_.get(playersState, `details[${activePlayer}].name`)}: ${
        constant.RUN
      }`,
      color: _.get(playersState, `details[${activePlayer}].color`)
    });
  };

  /**
   * @function selectRunner
   * @description select person to run
   * @param {Object} person - person object
   * @param {String} square - square
   */
  const selectRunner = (person, square) => {
    setRunner(person);

    setRunFromSquare(square);
    if (person.player !== activePlayer) {
      console.log("Not your person!");
      return;
    }
    if (person.lastMoved === playersState.totalTurns) {
      console.log("Already ran this person this turn!");
      return;
    }

    const pop = _.get(gridState, `grid.${square}.occupants.length`);

    const coord = square.split("_");
    const coord0 = parseFloat(coord[0]);
    const coord1 = parseFloat(coord[1]);
    const targetZones = [];

    for (let xx = pop; xx >= 0; xx -= 1) {
      for (let yy = 0; yy <= pop - xx; yy += 1) {
        targetZones.push(
          `${Math.min(coord0 + xx, 7)}_${Math.min(
            coord1 + Math.abs(pop - xx - yy),
            11
          )}`
        );
        targetZones.push(
          `${Math.max(coord0 - xx, -1)}_${Math.min(
            coord1 + Math.abs(pop - xx - yy),
            11
          )}`
        );
        targetZones.push(
          `${Math.min(coord0 + xx, 7)}_${Math.max(
            coord1 - Math.abs(pop - xx - yy),
            -1
          )}`
        );
        targetZones.push(
          `${Math.max(coord0 - xx, -1)}_${Math.max(
            coord1 - Math.abs(pop - xx - yy),
            -1
          )}`
        );
      }
    }

    setRunZone(
      _.uniqBy(
        targetZones.filter(zone => {
          return (
            zone !== square &&
            !_.get(gridState, `grid.${zone}.ventName`) &&
            !_.get(gridState, `grid.${zone}.lava`) &&
            !voidRunSquares.includes(zone)
          );
        })
      )
    );
  };

  /**
   * @function placeLavaTile
   * @description placing tile in highlight area
   * @param {String} square
   */
  const placeLavaTile = square => {
    placeLavaTileOnSquare(square, lavaTile);

    _.get(gridState, `grid.${square}.occupants`, []).forEach(person => {
      incrementPlayerCasualties(person.player, 1);
    });
    placePeopleInSquare(square, []);

    setPlacingLavaFlag(false);
    setLavaTile();
    setDangerZone([]);

    if (initialEruptionCounter) {
      setInitialEruptionCounter(initialEruptionCounter - 1);
      incrementPlayerTurn();
    } else if (_.get(playersState, `details[${activePlayer}].population`) < 1) {
      incrementPlayerTurn();
    } else {
      setRunCounter(2);
      runForYourLives();
    }
  };

  /**
   * @function runToSquare
   * @description handle person running from one square to another
   * @param {String} player
   * @param {String} fromSquare
   * @param {String} toSquare
   */
  const runToSquare = toSquare => {
    let numberOfRuns = flagsState.runCounter;

    const oldSquareOccupants = _.get(
      gridState,
      `grid.${runFromSquare}.occupants`
    );
    const oldSquareIdx = oldSquareOccupants
      .map(person => person.player)
      .indexOf(activePlayer);
    oldSquareOccupants.splice(oldSquareIdx, 1);
    placePeopleInSquare(runFromSquare, oldSquareOccupants);

    if (escapeSquares.includes(toSquare)) {
      incrementPlayerSaved(activePlayer, 1);
    } else {
      const newSquareOccupants = _.get(gridState, `grid.${toSquare}.occupants`);
      newSquareOccupants.push({
        player: activePlayer,
        gender: runner.gender,
        lastMoved:
          oldSquareOccupants.length > 0 ? playersState.totalTurns : undefined
      });
    }

    numberOfRuns -= 1;
    setRunCounter(numberOfRuns);
    setRunZone([]);
    setRunner();
    if (!numberOfRuns) {
      incrementPlayerTurn();
    }
  };

  return (
    <div data-test="container-main">
      <Main
        cardsState={cardsState}
        flagsState={flagsState}
        gridState={gridState}
        messageState={messageState}
        playersState={playersState}
        tileState={tileState}
        drawCard={drawCard}
        discardCard={discardCard}
        updatePlayerHand={updatePlayerHand}
        deckEnabled={
          _.get(playersState, `details[${activePlayer}].hand.length`) < 4 &&
          !placingPersonFlag &&
          !omenFlag
        }
        pileEnabled={
          messageState.stage === 2 && !placingLavaFlag && !flagsState.runCounter
        }
        playPompCard={playPompCard}
        cardGrid={cardGrid}
        placePerson={placePerson}
        vacancy={vacancy}
        performSacrifice={performSacrifice}
        sacrificeMessage={sacrificeMessage}
        setSacrificeMessage={setSacrificeMessage}
        drawTile={drawTile}
        flags={{
          ad79Flag,
          setAD79Flag,
          lavaFlag,
          setLavaFlag,
          wildLavaFlag,
          setWildLavaFlag,
          noPlaceToPlaceFlag,
          resolveNoPlaceToPlace
        }}
        lavaTile={lavaTile}
        highlightDangerZones={highlightDangerZones}
        dangerZone={dangerZone}
        placeLavaTile={placeLavaTile}
        selectRunner={selectRunner}
        runZone={runZone}
        runToSquare={runToSquare}
      />
    </div>
  );
};

MainContainer.propTypes = {
  cardsState: types.cardsState.types,
  flagsState: types.flagsState.types,
  gridState: types.gridState.types,
  messageState: types.messageState.types,
  playersState: types.playersState.types,
  tileState: types.tileState.types,
  gameSetup: PropTypes.func,
  takeCard: PropTypes.func,
  discardCard: PropTypes.func,
  takeTile: PropTypes.func,
  incrementPlayerTurn: PropTypes.func,
  updatePlayerHand: PropTypes.func,
  updateInstructions: PropTypes.func,
  placePeopleInSquare: PropTypes.func,
  incrementStage: PropTypes.func,
  incrementPlayerPopulation: PropTypes.func,
  incrementPlayerCasualties: PropTypes.func,
  incrementPlayerSaved: PropTypes.func,
  placeLavaTileOnSquare: PropTypes.func,
  setRunCounter: PropTypes.func
};

MainContainer.defaultProps = {
  cardsState: types.cardsState.defaults,
  flagsState: types.flagsState.defaults,
  gridState: types.gridState.defaults,
  messageState: types.messageState.defaults,
  playersState: types.playersState.defaults,
  tileState: types.tileState.defaults,
  gameSetup: () => {},
  takeCard: () => {},
  discardCard: () => {},
  takeTile: () => {},
  incrementPlayerTurn: () => {},
  updatePlayerHand: () => {},
  updateInstructions: () => {},
  placePeopleInSquare: () => {},
  incrementStage: () => {},
  incrementPlayerPopulation: () => {},
  incrementPlayerCasualties: () => {},
  incrementPlayerSaved: () => {},
  placeLavaTileOnSquare: () => {},
  setRunCounter: () => {}
};

export const MainContainerTest = MainContainer;
export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);
