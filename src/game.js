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

let aiWorker;

class Game {
  constructor({renderCallback}){
    resetState();
    if (typeof renderCallback === 'function') {
      renderFunction = renderCallback;
    }
  }

  start () {
    render();

    // makeMoveTest();
  }

  startAi ({moves, depth, attempts, timeout}) {
    if(!aiWorker) {
      initAiWorkers();
    }

    startAI(moves, depth, attempts, timeout);
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

export const getInitialField = (starterArr) => {
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

export const insertAtRandom = (grid, number) => {
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
// ------ AI block --------------
// ------------------------------
const initAiWorkers = () => {
  if (window.Worker) {
    aiWorker = {};
    aiWorker[UP] = new Worker('../worker.js');
    aiWorker[DOWN] = new Worker('../worker.js');
    aiWorker[RIGHT] = new Worker('../worker.js');
    aiWorker[LEFT] = new Worker('../worker.js');
  }
};

async function startAI (movesRemain, depth, attempts, timeout) {
  saveTime();
  const bestMove = await predictBestMove(rootGrid, depth, attempts);

  applyDirection(bestMove);

  if (!isFinished && movesRemain !== 1) {
    setTimeout(startAI.bind(null, movesRemain - 1, depth, attempts, timeout), timeout);
  }
}

//@todo don't use global variables
const saveTime = () => {
  if (window.firstTime) {
    window.timeCounter ++;
    window.meanTime = (Date.now() - window.firstTime)/window.timeCounter;
  } else {
    window.timeCounter = 0;
    window.firstTime = Date.now();
  }
};

async function predictBestMove(grid, depth, attempts) {
  const sequences = await getDirectionalSequences(grid, depth, attempts);

  let bestSequence = sequences.reduce(
    (acc, x) => {
      if (compareSequences(x, acc)) {
        acc = x;
      }
      return acc;
    }
  );

  if (bestSequence.points === 0) {
    bestSequence = sequences[Math.floor(Math.random() * sequences.length)];
  }
  return bestSequence.move;
}

export const getDirectionalSequences = (grid, depth, attempts) => {
  let sequences = [
    generateMCSequencePromise(UP, grid, depth, attempts),
    generateMCSequencePromise(DOWN, grid, depth, attempts),
    generateMCSequencePromise(LEFT, grid, depth, attempts),
    generateMCSequencePromise(RIGHT, grid, depth, attempts),
  ];

  return Promise.all(sequences);
};

const generateMCSequencePromise = (initialMove, initialGrid, depth, attempts) => {
  return new Promise((resolve) => {
    if (aiWorker) {
      let worker = aiWorker[initialMove];
      worker.onmessage = ({data}) => {
        resolve(data.sequence);
      };

      worker.postMessage({
        name: 'generateMC',
        data: {initialMove, initialGrid, depth, attempts},
      });
    } else {
      resolve(generateMCSequence({initialMove, initialGrid, depth, attempts}));
    }
  });
};

export const generateMCSequence = ({initialMove, initialGrid, depth, attempts}) => {
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
  // with call() it can be used in Worker
  let grid = new Matrix(Matrix.prototype.getArray.call(initialGrid), GRID_SIZE);
  let points = 0;
  let emptyCells = 0;
  let steps = 0;

  const addPoints = (value) => {
    points += value;
  };

  for (let i = 0; i < depth; i++) {
    steps = i;
    let newGrid = move(grid, currentMove, addPoints);
    if (!isMatricesEqual(grid, newGrid)) {
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
      points = 0;
      emptyCells = 0;
      break;
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

export const getRandomMove = (exclude = '') => {
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
