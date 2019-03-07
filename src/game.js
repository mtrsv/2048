import isEqual from 'lodash/isEqual';
import flatten from 'lodash/flatten';
import Matrix, { isMatricesEqual } from './matrix';

const GRID_SIZE = 4;

export const UP = 'direction-up';
export const DOWN = 'direction-down';
export const LEFT = 'direction-left';
export const RIGHT = 'direction-right';

let renderFunction;
let rootGrid;
let isFinished = false;
let score;

class Game {
  constructor({renderCallback}){
    resetState();
    if (typeof renderCallback === 'function') {
      renderFunction = renderCallback;
    }
  }

  start () {
    render();

    startAI(-1, 20, 50, 0);
    // makeMoveTest();
  }

  applyCommand (command) {
    applyDirection(command);
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

const getInitialField = (starterArr) => {
  if (starterArr) {
    return new Matrix(starterArr, GRID_SIZE);
  } else {
    const emptyArray = new Array(16).fill(0);

    let grid = new Matrix(emptyArray, GRID_SIZE);
    grid = insertAtRandom(grid, generateNewNumber());
    grid = insertAtRandom(grid, generateNewNumber());
    return grid;
  }
};

const generateNewNumber = () => {
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
      newGrid = new Matrix(flatten(newGrid), GRID_SIZE).getColumns();
      break;
    case RIGHT:
      newGrid = calculateGrid(matrix.getRows(), {scoreCallback, direction: -1});
      break;
    case UP:
      newGrid = calculateGrid(matrix.getColumns(), {scoreCallback, direction: 1});
      newGrid = new Matrix(flatten(newGrid), GRID_SIZE).getColumns();
      break;
  }

  let grid = matrix.getArray();
  if (!isEqual(grid, flatten(newGrid))) {
    grid = newGrid;
  }

  return new Matrix(flatten(grid), GRID_SIZE);
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

const insertAtRandom = (grid, number) => {
  let arr = grid.getArray();

  let emptyPlaces = arr.reduce(
    (acc, x, i) => {
      if (x === 0) {
        acc.push(i);
      }
      return acc;
    },
    []
  );

  let randPlace = emptyPlaces[Math.floor(Math.random() * emptyPlaces.length)];

  grid.setAt(randPlace, number);

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

// ------------------------------
// ------ performance block -----
// ------------------------------
const makeMoveTest = () => {
  console.log('test');
  const times = 1000000;

  let t0 = performance.now();
  for (let i = 0; i < times; i ++) {
    let field = getInitialField();
    field = insertAtRandom(field, generateNewNumber());
    field = insertAtRandom(field, generateNewNumber());
    field = insertAtRandom(field, generateNewNumber());
    field = insertAtRandom(field, generateNewNumber());

    move(field, getRandomMove());
  }
  let t1 = performance.now();
  console.log(`${times/1000} moves took ${((t1-t0)/1000).toFixed(2)} ms`)
  //6.85   6.43   7.03
  //6.03   6.15   6.24
  //6.11   6.32   5.70
  //5.46   6.07   5.40
};

// ------------------------------
// ------ AI block --------------
// ------------------------------
const startAI = (movesRemain, depth, attempts, timeout) => {
  applyDirection(predictBestMove(rootGrid, depth, attempts));

  movesRemain--;
  if (!isFinished && movesRemain) {
    if (timeout >= 0) {
      setTimeout(startAI.bind(null, movesRemain, depth, attempts, timeout), timeout);
    } else {
      startAI(movesRemain, depth, attempts);
    }
  }
};

const predictBestMove = (grid, depth, attempts) => {
  let sequences = [];
  sequences.push(generateMCSequence(UP, grid, depth, attempts));
  sequences.push(generateMCSequence(DOWN, grid, depth, attempts));
  sequences.push(generateMCSequence(LEFT, grid, depth, attempts));
  sequences.push(generateMCSequence(RIGHT, grid, depth, attempts));
  // @todo add prediction method changing
  // sequences.push(generateSequence(UP, grid, depth));
  // sequences.push(generateSequence(DOWN, grid, depth));
  // sequences.push(generateSequence(LEFT, grid, depth));
  // sequences.push(generateSequence(RIGHT, grid, depth));
  let bestSequence = sequences.reduce(
    (acc, x) => {
      if (!acc || compareSequences(x, acc)) {
        acc = x;
      }
      return acc;
    }
  );

  if (bestSequence.points === 0) {
    bestSequence = sequences[Math.floor(Math.random() * sequences.length)];
  }

  return bestSequence.move;
};

const generateMCSequence = (initialMove, initialGrid, depth, attempts) => {
  const seqs = [];

  for (let i = 0; i < attempts; i++) {
    seqs.push(generateSequence(initialMove, initialGrid, depth));
  }

  return {
    move: initialMove,
    points: sum(seqs.map(x => x.points))/seqs.length,
    // steps: sum(seqs.map(x => x.steps))/seqs.length,
    // emptyCells: sum(seqs.map(x => x.emptyCells))/seqs.length,
  };
};

const generateSequence = (initialMove, initialGrid, depth) => {
  let currentMove = initialMove;
  let grid = new Matrix(initialGrid.getArray(), GRID_SIZE);
  let points = 0;
  let emptyCells = 0;
  let steps = 0;

  const addPoints = (value) => {
    points += value;
  };

  for (let i = 0; i < depth; i++) {
    steps = i;
    let newGrid = move(grid, currentMove, addPoints);
    if (!isMatricesEqual(rootGrid, newGrid)) {
      newGrid = insertAtRandom(newGrid, generateNewNumber());

      grid = newGrid;
      currentMove = getRandomMove(currentMove);

      if (i === 0) {
        emptyCells = grid.getArray().reduce((acc, x) => { if (x===0) {acc++;} return acc;}, 0)
      }

      if(!hasMoves(newGrid)) {
        break;
      }
    } else if (i === 0){
      depth = 0;
      points = 0;
      emptyCells = 0;
    }
  }

  return {
    move: initialMove,
    points: points,
    // steps,
    // emptyCells,
  };
};

const compareSequences = (first, second) => {
  //@todo find optimal comparacion function
  // if (first.steps !== second.steps) return first.steps > second.steps;
  if (first.points !== second.points) return first.points > second.points;
  // if (first.emptyCells !== second.emptyCells) return first.emptyCells > second.emptyCells;
};

const getRandomMove = (exclude = '') => {
  const moves = [UP, DOWN, LEFT, RIGHT].filter(x => x !== exclude);
  return moves[Math.floor(Math.random() * moves.length)];
};


// ------------------------------
// ------ Helpers ---------------
// ------------------------------
const sum = (arr) => {
  return arr.reduce((acc,x) => acc + x, 0);
};

const max = (arr) => {
  return Math.max.apply(null, arr);
};

export default Game;
