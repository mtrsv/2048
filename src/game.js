import isEqual from 'lodash/isEqual';
import flatten from 'lodash/flatten';
import Matrix, { isMatricesEqual } from './matrix';

export const UP = 'direction-up';
export const DOWN = 'direction-down';
export const LEFT = 'direction-left';
export const RIGHT = 'direction-right';

let rootGridSize;
let renderFunction;
let rootGrid;
let isFinished = false;
let score;

class Game {
  constructor({gridSize, renderCallback}){
    if (typeof gridSize !== 'number') {
      throw new Error('rootGridSize is not a Number');
    }
    rootGridSize = gridSize;
    if (typeof renderCallback === 'function') {
      renderFunction = renderCallback;
    }
    resetState();
  }

  start () {
    render();
  }

  applyCommand (command) {
    applyDirection(command);
  }

  getState() {
    return {
      grid: rootGrid,
      isFinished,
    };
  }
}

const resetState = () => {
  score = 0;
  isFinished = false;
  rootGrid = getInitialField();
};

const applyDirection = (direction) => {
  if (isFinished) {
    return;
  }

  let newGrid = move(rootGrid, direction, addGameScore);

  if (newGrid && !isMatricesEqual(rootGrid, newGrid)) {
    rootGrid = insertAtRandom(newGrid, generateNewNumber());
    if(!hasMoves(rootGrid)) {
      isFinished = true;
    }
    render();
  }
};

const addGameScore = (value) => {
  score += value;
};

export const getInitialField = (starterArr) => {
  if (starterArr) {
    return new Matrix(starterArr, rootGridSize);
  } else {
    const emptyArray = new Array(16).fill(0);

    let grid = new Matrix(emptyArray, rootGridSize);
    grid = insertAtRandom(grid, generateNewNumber());
    grid = insertAtRandom(grid, generateNewNumber());
    return grid;
  }
};

export const generateNewNumber = () => {
  return (10 * Math.random() > 9) ? 4 : 2;
};

export const hasMoves = (grid) => {
  return hasEmptyCell(grid.getArray())
    || hasMovesInRows(grid.getRows())
    || hasMovesInRows(grid.getColumns());
};

const hasMovesInRows = (rows) => {
  for (let i = 0; i < rows.length; i++){
    const row = rows[i];
    for (let j = 0; j < row.length; j++) {
      if(row[j] === row[j + 1]) {
        return true;
      }
    }
  }

  return false;
};

export const move = (matrix, direction, scoreCallback) => {
  let newGrid;

  switch (direction) {
    case LEFT:
      newGrid = calculateGrid(matrix.getRows(), {scoreCallback, direction: 1});
      break;
    case DOWN:
      newGrid = calculateGrid(matrix.getColumns(), {scoreCallback, direction: -1});
      newGrid = new Matrix(flatten(newGrid), matrix.size).getColumns();
      break;
    case RIGHT:
      newGrid = calculateGrid(matrix.getRows(), {scoreCallback, direction: -1});
      break;
    case UP:
      newGrid = calculateGrid(matrix.getColumns(), {scoreCallback, direction: 1});
      newGrid = new Matrix(flatten(newGrid), matrix.size).getColumns();
      break;
  }

  let grid = matrix.getArray();
  if (!isEqual(grid, flatten(newGrid))) {
    grid = newGrid;
  }

  return new Matrix(flatten(grid), matrix.size);
};

const calculateGrid = (grid, {scoreCallback, direction}) => {
  return grid.map((row) => {
    return calculateRow(row, {scoreCallback, direction})
  });
};

const calculateRow = (row, {scoreCallback, direction}) => {
  let newRow = [...row];

  if (direction < 0) {
    newRow.reverse();
  }

  newRow = shrinkRow(newRow);

  for (let i = 0; i < row.length; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] = newRow[i] * 2;
      if (typeof scoreCallback === 'function'){
        scoreCallback(newRow[i]);
      }
      newRow[i + 1] = 0;
      newRow = shrinkRow(newRow);
    }
  }

  if (direction < 0) {
    newRow.reverse();
  }

  return newRow;
};

/**
 * Remove blank places.
 * @param row
 * @returns {*}
 */
export const shrinkRow = (row) => {
  let newRow = row.filter((c) => c !== 0);

  let zerosCounter = row.length - newRow.length;
  while (zerosCounter > 0) {
    newRow.push(0);
    zerosCounter--;
  }

  return newRow;
};

export const insertAtRandom = (grid, number) => {
  let gridArray = grid.getArray();

  let emptyPlaces = gridArray.reduce(
    (acc, x, i) => {
      if (x === 0) {
        acc.push(i);
      }
      return acc;
    },
    []
  );

  let randomIndex = Math.floor(Math.random() * emptyPlaces.length);

  grid.setAt(emptyPlaces[randomIndex], number);

  return grid;
};

export const hasEmptyCell = (array) => {
  for (let i = 0; i < array.length; i++){
    if(array[i] === 0){
      return true;
    }
  }
  return false;
};

const render = () => {
  if (renderFunction) {
    renderFunction(rootGrid.getRows(), score, isFinished);
  }
};

export default Game;
