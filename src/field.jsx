import React from 'react';

const Field = ({rows, score, isFinished=false, predictionTime = 0}) => {
  return (
    <div className="field">
      <div>Prediction Time: {(predictionTime || 0).toFixed(3)}</div>
      <div>Score: {score}</div>
      {rows.map((row, i) => {
        return (
          <div className="row" key={i}>
            {row.map((cell, j) => {
              return (
                <div className="cell" key={i+j}>
                  <div className="inner">{cell > 0 ? cell : ' '}</div>
                </div>
              );
            })}
          </div>
        )
      })}
      <div>{isFinished && 'Game Over'}</div>
    </div>
  );
};

export default Field;