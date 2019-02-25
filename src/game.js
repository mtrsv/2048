import isEqual from 'lodash/isEqual'
import flatten from 'lodash/flatten'
import some from 'lodash/some'
import cloneDeep from 'lodash/cloneDeep'

const GRID_SIZE = 4;

export const UP = 'direction-up';
export const DOWN = 'direction-down';
export const LEFT = 'direction-left';
export const RIGHT = 'direction-right';

let rootElement;
let rootGrid;
let isFinished = false;

class Game {
  constructor(rootSelector){
    rootGrid = [
      [2, 0, 0, 2],
      [2, 0, 0, 2],
      [2, 2, 2, 2],
      [8, 4, 2, 2],
    ];
    rootElement = document.querySelector(rootSelector);
  }

  start () {
    document.addEventListener('keydown', onKeyDown);
    renderField(rootElement, rootGrid);
  }
}

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

  if (newGrid && !isEqual(rootGrid, newGrid)) {
    let randomNumber = Math.random() * 10 > 9 ? 4 : 2;
    rootGrid = insertAtRandom(newGrid, randomNumber);
    renderField(rootElement, rootGrid);

    if(!hasEmptyCell(rootGrid) && !hasMoves(rootGrid)) {
      renderGameOver(rootElement);
    }
  }
};

const hasMoves = (grid) => {
  if (!isEqual(move(grid, UP), grid)) {
    return true;
  }
  if (!isEqual(move(grid, DOWN), grid)) {
    return true;
  }
  if (!isEqual(move(grid, LEFT), grid)) {
    return true;
  }
  if (!isEqual(move(grid, RIGHT), grid)) {
    return true;
  }
  return false;
};

export const move = (grid, direction) => {
  grid = cloneDeep(grid);
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

  return grid;
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
  //@todo add available cell checking
  const maxX = grid[0].length - 1;
  const maxY = grid.length - 1;

  const xRand = Math.round(Math.random() * maxX);
  const yRand = Math.round(Math.random() * maxY);

  if (!grid[xRand][yRand]){
    grid[xRand][yRand] = number;
  }

  return grid;
};

export const hasEmptyCell = (grid) => {
  return some(flatten(grid), x => x === 0);
};

const renderField = (element, grid) => {
  let markup = '';
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

export default Game
