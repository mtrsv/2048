import isEqual from 'lodash/isEqual';
import flatten from 'lodash/flatten';
import some from 'lodash/some';
import Matrix, { isMatricesEqual } from './matrix';

const GRID_SIZE = 4;

export const UP = 'direction-up';
export const DOWN = 'direction-down';
export const LEFT = 'direction-left';
export const RIGHT = 'direction-right';

let rootElement;
let rootGrid;
let isFinished = false;
let score;

class Game {
  constructor(rootSelector){
    resetState();
    rootElement = document.querySelector(rootSelector);
  }

  start () {
    document.addEventListener('keydown', onKeyDown);
    renderField(rootElement, rootGrid);

    startAI(-1, 20, 0);
    // makeTest();
  }
}

const resetState = () => {
  score = 0;
  isFinished = false;
  rootGrid = getInitialField();
};

const onKeyDown = (event) => {
  if (isFinished) {
    return;
  }

  let newGrid;
  switch (event.key) {
    case 'ArrowLeft':
      newGrid = move(rootGrid, LEFT, addGameScore);
      break;
    case 'ArrowRight':
      newGrid = move(rootGrid, RIGHT, addGameScore);
      break;
    case 'ArrowUp':
      newGrid = move(rootGrid, UP, addGameScore);
      break;
    case 'ArrowDown':
      newGrid = move(rootGrid, DOWN, addGameScore);
      break;
  }
  if (newGrid && !isMatricesEqual(rootGrid, newGrid)) {
    rootGrid = insertAtRandom(newGrid, generateNewNumber());
    renderField(rootElement, rootGrid);

    if(!hasEmptyCell(rootGrid.getArray()) && !hasMoves(rootGrid)) {
      isFinished = true;
      renderGameOver(rootElement);
    }
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

const hasMoves = (grid) => {
  //@todo make simpler
  if (!isMatricesEqual(move(grid, UP), grid)) {
    return true;
  }
  if (!isMatricesEqual(move(grid, DOWN), grid)) {
    return true;
  }
  if (!isMatricesEqual(move(grid, LEFT), grid)) {
    return true;
  }
  if (!isMatricesEqual(move(grid, RIGHT), grid)) {
    return true;
  }
  return false;
};

export const move = (matrix, direction, scoreCallback) => {
  //@todo full refactoring
  let grid = convertToMatrix([...matrix.getArray()]);

  switch (direction) {
    case LEFT:
      break;
    case DOWN:
      grid = rotateMatrix(grid);
      break;
    case RIGHT:
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      break;
    case UP:
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      break;
  }

  let newGrid = calculateGrid(grid, scoreCallback);
  if (!isEqual(grid, newGrid)) {
    grid = newGrid;
  }

  switch (direction) {
    case LEFT:
      break;
    case DOWN:
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      break;
    case RIGHT:
      grid = rotateMatrix(grid);
      grid = rotateMatrix(grid);
      break;
    case UP:
      grid = rotateMatrix(grid);
      break;
  }

  return new Matrix(flatten(grid), GRID_SIZE);
};

const calculateGrid = (grid, scoreCallback) => {
  return grid.map((row) => {
    return calculateRow(row, scoreCallback)
  });
};

const calculateRow = (row, scoreCallback) => {
  let newRow = [...row];

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

export const rotateMatrix = (matrix) => {
  let newMatrix = matrix.reverse();

  for (var i = 0; i < newMatrix.length; i++) {
    for (var j = 0; j < i; j++) {
      var temp = newMatrix[i][j];
      newMatrix[i][j] = newMatrix[j][i];
      newMatrix[j][i] = temp;
    }
  }

  return newMatrix;
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

export const hasEmptyCell = (grid) => {
  return some(grid, x => x === 0);
};

const renderField = (element, matrix) => {
  const grid = convertToMatrix(matrix.getArray());
  let markup = `Score: ${score}`;

  grid.forEach((row)=>{
    markup += '<div class="row">';
    row.forEach((cell)=>{
      markup += `<div class="cell"><div class="inner">${cell || ''}</div></div>`
    });
    markup += '</div>';
  });

  element.innerHTML = markup;
};

const renderGameOver = (element) => {
  element.appendChild(document.createTextNode('Game Over'));
};

export const convertToMatrix = (array, size) => {
  size = size || GRID_SIZE;
  const len = array.length;
  let result = [];
  for (let i = 0, j = 0; i < len; i++) {
    j = (i - i % size) / size;
    if (i % size === 0) {
      result.push([]);
    }
    result[j].push(array[i]);
  }

  return result;
};

// ------------------------------
// ------ performance block -----
// ------------------------------
const makeTest = () => {
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
};

// ------------------------------
// ------ AI block --------------
// ------------------------------
const startAI = (movesRemain, depth = 10, timeout) => {
  onKeyDown({key: getNextMove(depth)});

  movesRemain--;
  if (!isFinished && movesRemain) {
    if (timeout >= 0) {
      setTimeout(startAI.bind(null, movesRemain, depth, timeout), timeout);
    } else {
      startAI(movesRemain, depth);
    }
  }
};

const getNextMove = (depth) => {
  const moves = {
    [LEFT]: 'ArrowLeft',
    [RIGHT]: 'ArrowRight',
    [UP]: 'ArrowUp',
    [DOWN]: 'ArrowDown',
  };

  return moves[predictBestMove(rootGrid, depth)];
};

const predictBestMove = (grid, depth) => {
  let sequences = [];
  sequences.push(generateMCSequence(UP, grid, depth));
  sequences.push(generateMCSequence(DOWN, grid, depth));
  sequences.push(generateMCSequence(LEFT, grid, depth));
  sequences.push(generateMCSequence(RIGHT, grid, depth));
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

  return bestSequence.move;
};

const generateMCSequence = (initialMove, initialGrid, depth) => {
  const attempts = 100;
  const seqs = [];

  for (let i = 0; i < attempts; i++) {
    seqs.push(generateSequence(initialMove, initialGrid, depth));
  }

  return {
    move: initialMove,
    points: sum(seqs.map(x => x.points))/seqs.length,
    max: 0,
    sum: 0,
  };
};

const generateSequence = (initialMove, initialGrid, depth) => {
  let currentMove = initialMove;
  let grid = new Matrix(initialGrid.getArray(), GRID_SIZE);
  let points = 0;

  const addPoints = (value) => {
    points += value;
  };

  for (let i = 0; i < depth; i++) {
    let newGrid = move(grid, currentMove, addPoints);

    if (!isMatricesEqual(rootGrid, newGrid)) {
      newGrid = insertAtRandom(newGrid, generateNewNumber());

      grid = newGrid;
      currentMove = getRandomMove(currentMove);

      if(!hasEmptyCell(newGrid) && !hasMoves(newGrid)) {
        break;
      }
    }
  }

  return {
    move: initialMove,
    points: points,
    max: max(grid.getArray()),
    sum: sum(grid.getArray()),
    emptyCells: grid.getArray().reduce((acc, x) => { if (x === 0) {acc += x} return acc;}, 0)
  };
};

const compareSequences = (first, second) => {
  // if (first.emptyCells !== second.emptyCells) return first.emptyCells > second.emptyCells;
  if (first.points !== second.points) return first.points > second.points;
  if(first.max !== second.max) return first.max > second.max;
  if(first.sum !== second.sum) return first.sum > second.sum;
};

const getRandomMove = (exclude = '') => {
  const moves = [UP, DOWN, LEFT, RIGHT].filter(x => x !== exclude);
  return moves[Math.floor(Math.random() * 4)];
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
