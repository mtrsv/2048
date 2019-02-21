import isEqual from 'lodash/isEqual'

const GRID_SIZE = 4;

const UP = 'direction-up';
const DOWN = 'direction-down';
const LEFT = 'direction-left';
const RIGHT = 'direction-right';

let rootElement;
let rootGrid;

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
    render(rootElement, rootGrid);
  }
}

const onKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      move(LEFT);
      break;
    case 'ArrowRight':
      move(RIGHT);
      break;
    case 'ArrowUp':
      move(UP);
      break;
    case 'ArrowDown':
      move(DOWN);
      break;
  }
};

const move = (direction) => {
  let grid = rootGrid;
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
    rootGrid = newGrid;
    let randomNumber = Math.random() * 10 > 9 ? 4 : 2;
    grid = insertAtRandom(grid, randomNumber);
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

  render(rootElement, grid);
};

const calculateGrid = (grid) => {
  return grid.map(calculateRow);
};

const calculateRow = (row) => {
  let newRow = [...row];

  newRow = shrinkRow(newRow);

  for (let i = 0; i < row.length; i++) {
    if (i < row.length -1 && newRow[i] === 0) {
      newRow[i] = newRow[i + 1];
      newRow[i + 1] = 0;
    }
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] = newRow[i] * 2;
      newRow[i + 1] = 0;
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

  let addNumber = row.length - newRow.length;
  while (addNumber > 0) {
    newRow.push(0);
    addNumber--;
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
  const maxX = grid[0].length - 1;
  const maxY = grid.length - 1;

  const xRand = Math.round(Math.random() * maxX);
  const yRand = Math.round(Math.random() * maxY);

  if (!grid[xRand][yRand]){
    grid[xRand][yRand] = number;
  }

  return grid;
};

const render = (element, grid) => {
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
