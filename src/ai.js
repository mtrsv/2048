import Matrix, {isMatricesEqual} from './matrix';
import {DOWN, generateNewNumber, hasMoves, insertAtRandom, LEFT, move, RIGHT, UP} from './game';

let aiWorker;
let applyDirection;
let getState;

class AI {
  constructor({applyDirectionCallback, getStateCallback}){
    if (typeof applyDirectionCallback !== 'function') {
      throw new Error('applyDirectionCallback must be a function.');
    }
    if (typeof getStateCallback !== 'function') {
      throw new Error('getStateCallback must be a function.');
    }
    applyDirection = applyDirectionCallback;
    getState = getStateCallback;
  }

  start ({moves, depth, attempts, timeout}) {
    if(!aiWorker) {
      initAiWorkers();
    }

    startAI(moves, depth, attempts, timeout);
  }
}

const initAiWorkers = () => {
  if (window.Worker) {
    aiWorker = {};
    aiWorker[UP] = new Worker('/worker.js');
    aiWorker[DOWN] = new Worker('/worker.js');
    aiWorker[RIGHT] = new Worker('/worker.js');
    aiWorker[LEFT] = new Worker('/worker.js');
  }
};

async function startAI (movesRemain, depth, attempts, timeout) {
  saveTime();
  const bestMove = await predictBestMove(getState().grid, depth, attempts);

  applyDirection(bestMove);

  if (!getState().isFinished && movesRemain !== 1) {
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
    (best, x) => {
      if (compareSequences(x, best)) {
        best = x;
      }
      return best;
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
        data: {initialMove, initialGrid, depth, attempts, a:window.a},
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
  };
};

const generateSequence = (initialMove, initialGrid, depth) => {
  let currentMove = initialMove;
  // with call() it can be used in Worker
  let grid = new Matrix(Matrix.prototype.getArray.call(initialGrid), initialGrid.size);
  let points = 0;

  const addPoints = (value) => {
    points += value;
  };

  for (let i = 0; i < depth; i++) {
    let newGrid = move(grid, currentMove, addPoints);
    if (!isMatricesEqual(grid, newGrid)) {
      newGrid = insertAtRandom(newGrid, generateNewNumber());

      grid = newGrid;
      currentMove = getRandomMove(currentMove);

      if(!hasMoves(newGrid)) {
        break;
      }
    } else if (i === 0){
      points = 0;
      break;
    }
  }

  return {
    move: initialMove,
    points: points,
  };
};

const compareSequences = (first, second) => {
  return first.points > second.points;
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

export default AI;