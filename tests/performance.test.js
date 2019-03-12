import Game, {
  getRandomMove,
  move,
  getInitialField,
  insertAtRandom,
  generateNewNumber,
} from './../src/game';

jest.setTimeout(1000*60*1000);

const DEPTH = 30;
const ATTEMPTS = 30;
const RUNS = 30;

describe('Test overall algorithm performance ', () => {
  xit('123', (done) => {
    runTestGames(RUNS).then((results)=>{
      console.log(results);
      console.log(`
        Depth: ${DEPTH}, attempts: ${ATTEMPTS}, runs: ${RUNS}
        max score:  ${results.map(x => x.score).reduce((acc, x) => { if (x > acc){acc=x;} return acc;},0)}
        mean score: ${(results.map(x => x.score).reduce((acc, x) => { return acc+x},0)/results.length).toFixed(2)}
        mean time: ${(results.map(x => x.time).reduce((acc, x) => { return acc+x},0)/results.length).toFixed(2)}
      `);
      done();
    });
    expect(1).toEqual(1);
  });
  it('makeMoveTest', () => {
    makeMoveTest(100*1000);
    expect(1).toEqual(1);
  });
});

//Depth: 5, attempts: 50, runs: 100
//mean score: 23183.56
//mean time: 23524.54

// Depth: 5, attempts: 1, runs: 30
// max score:  13904
// mean score: 7041.2
// mean time: 1065.02

// Depth: 5, attempts: 10, runs: 30
// max score:  35500
// mean score: 19093.33
// mean time: 9229.32

// Depth: 5, attempts: 30, runs: 30
// max score:  36228
// mean score: 22115.06
// mean time: 11190.37

// Depth: 20, attempts: 30, runs: 30
// max score:  59800
// mean score: 28544.93
// mean time: 43740.13

// Depth: 50, attempts: 30, runs: 30
// max score:  51572
// mean score: 24614.53
// mean time: 54949.47

// Depth: 20, attempts: 60, runs: 30
// max score:  56784
// mean score: 28463.87
// mean time: 78704.72

// Depth: 30, attempts: 30, runs: 30
// max score:  35784
// mean score: 23486.53
// mean time: 41359.53

// Depth: 30, attempts: 30, runs: 30 -- with promise
// max score:  36340
// mean score: 24385.47
// mean time: 44086.83


function runTestGames(runs, results = []) {
  runs--;
  return createGame()
    .then((data) => {
      results.push(data);
      if (runs > 0) {
        return runTestGames(runs, results);
      } else {
        return(results);
      }
    });
}

function createGame() {
  return new Promise((resolve) => {
    const staringTime = performance.now();
    const game = new Game({
      renderCallback: (rows, score, isFinished) => {
        if (isFinished) {
          resolve({
            score,
            time: performance.now() - staringTime,
          });
        }
      }
    });
    game.start();
    game.startAi({
      moves: -1,
      depth: DEPTH,
      attempts: ATTEMPTS,
      timeout: 0,
    });
  });
}


// ------------------------------
// ------ performance block -----
// ------------------------------
const makeMoveTest = (times) => {
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
  console.log(`Test move: ${times/1000} moves took ${((t1-t0)/1000).toFixed(2)} ms`)
  //2.15   2.07   2.50
};