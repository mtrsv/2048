import Game, {DOWN, LEFT, RIGHT, UP} from './game';
import AI from './ai';
import React from 'react';
import { render } from 'react-dom';
import Field from './field.jsx'

const rootElement = document.getElementById('root');
const game = new Game({
  gridSize: 4,
  renderCallback: renderReact,
});
const ai = new AI({
  applyDirectionCallback: game.applyCommand.bind(game),
  getStateCallback: game.getState.bind(game),
});

game.start();
ai.start({
  moves: -1,
  depth: 30,
  attempts: 50,
  timeout: 0,
});

document.addEventListener('keydown', onKeyDown);

function renderReact (rows, score, isFinished) {
  render(
    <Field
      rows={rows}
      score={score}
      isFinished={isFinished}
      predictionTime={window.meanTime}
    />,
    rootElement
  );
}


function onKeyDown (event) {
  switch (event.key) {
    case 'ArrowLeft':
      game.applyCommand(LEFT);
      break;
    case 'ArrowRight':
      game.applyCommand(RIGHT);
      break;
    case 'ArrowUp':
      game.applyCommand(UP);
      break;
    case 'ArrowDown':
      game.applyCommand(DOWN);
      break;
  }
}