import Game, {DOWN, LEFT, RIGHT, UP} from './game';
import React from 'react';
import { render } from 'react-dom';
import Field from './field.jsx'

const rootElement = document.getElementById('root');

const renderReact = (rows, score, isFinished) => {
  render(
    <Field
      rows={rows}
      score={score}
      isFinished={isFinished}
    />,
    rootElement
  );
};

const game = new Game({renderCallback: renderReact});

const onKeyDown = (event) => {
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
};

game.start();
game.startAi({
  moves: -1,
  depth: 20,
  attempts: 100,
  timeout: 0,
});
document.addEventListener('keydown', onKeyDown);
