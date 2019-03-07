import React from 'react';

const Field = ({rows, score, isFinished=false}) => {
  return (
    <div className="field">
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