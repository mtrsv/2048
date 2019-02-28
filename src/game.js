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
      newGrid = move(rootGrid, LEFT);
      break;
    case 'ArrowRight':
      newGrid = move(rootGrid, RIGHT);
      break;
    case 'ArrowUp':
      newGrid = move(rootGrid, UP);
      break;
    case 'ArrowDown':
      newGrid = move(rootGrid, DOWN);
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

export const move = (matrix, direction) => {
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

  let newGrid = calculateGrid(grid);
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

const calculateGrid = (grid) => {
  return grid.map(calculateRow);
};

const calculateRow = (row) => {
  let newRow = [...row];

  newRow = shrinkRow(newRow);

  for (let i = 0; i < row.length; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] = newRow[i] * 2;
      newRow[i + 1] = 0;
      // @todo inject function
      score += newRow[i];
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

export default Game;
