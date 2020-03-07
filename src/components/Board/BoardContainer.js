/** @module BoardContainer */

import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import * as types from "../../types/types";

import Board from "./Board";
import OccupancyLayer from "./OccupancyLayer";
import CancelButtons from "./CancelButtons";

const mapStateToProps = state => {
  return {
    flagsState: state.flagsState,
    gridState: state.gridState,
    messageState: state.messageState,
    playersState: state.playersState
  };
};

/**
 * @function BoardContainer
 * @description Functional Container component for Board
 * @returns {React.Component} - Rendered component.
 */
const BoardContainer = props => {
  const {
    messageState,
    flagsState,
    gridState,
    playersState,
    performSacrifice,
    selectRunner,
    placeRelatives,
    runToSquare
  } = props;
  return (
    <div data-test="container-board" className="board-container">
      <Board messageState={messageState} />
      <OccupancyLayer
        gridState={gridState}
        playersState={playersState}
        performSacrifice={performSacrifice}
        runCounter={flagsState.runCounter}
        selectRunner={selectRunner}
      />
      <CancelButtons
        flagsState={flagsState}
        placeRelatives={placeRelatives}
        runToSquare={runToSquare}
      />
    </div>
  );
};

BoardContainer.propTypes = {
  flagsState: types.flagsState.types,
  gridState: types.gridState.types,
  messageState: types.messageState.types,
  playersState: types.playersState.types,
  performSacrifice: PropTypes.func,
  selectRunner: PropTypes.func,
  placeRelatives: PropTypes.func,
  runToSquare: PropTypes.func
};

BoardContainer.defaultProps = {
  flagsState: types.flagsState.defaults,
  gridState: types.gridState.defaults,
  messageState: types.messageState.defaults,
  playersState: types.playersState.defaults,
  performSacrifice: () => {},
  selectRunner: () => {},
  placeRelatives: () => {},
  runToSquare: () => {}
};

export const BoardContainerTest = BoardContainer;
export default connect(mapStateToProps)(BoardContainer);
