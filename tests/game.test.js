import {
  shrinkRow,
  move,
  hasEmptyCell,
  hasMoves,
  UP, DOWN, LEFT, RIGHT,
} from './../src/game'
import Matrix from '../src/matrix'

describe('game', () => {
  describe('shrinkRow', () => {
    it('shrink 1', () => {
      const initial = [0, 0, 0, 1];
      const expected = [1, 0, 0, 0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 2', () => {
      const initial = [0, 1, 0, 2];
      const expected = [1, 2, 0, 0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 3', () => {
      const initial = [1, 2, 0, 3];
      const expected = [1, 2, 3, 0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 4', () => {
      const initial = [1, 2, 3, 4];
      const expected = [1, 2, 3, 4];
      expect(shrinkRow(initial)).toEqual(expected);
    });
  });

  describe('move', () => {
    it('move left from right', () => {
      const initial = [
        0, 0, 2, 2,
        2, 2, 4, 4,
        0, 2, 2, 2,
        2, 2, 2, 2,
      ];
      const expected = [
        4, 0, 0, 0,
        4, 8, 0, 0,
        4, 2, 0, 0,
        4, 4, 0, 0,
      ];
      expect(move(new Matrix(initial, 4), LEFT).getArray()).toEqual(expected, 4);
    });
    it('move left from left', () => {
      const initial = [
        2, 2, 0, 0,
        4, 4, 2, 2,
        2, 2, 2, 0,
        2, 2, 2, 2,
      ];
      const expected = [
        4, 0, 0, 0,
        8, 4, 0, 0,
        4, 2, 0, 0,
        4, 4, 0, 0,
      ];
      expect(move(new Matrix(initial, 4), LEFT).getArray()).toEqual(expected, 4);
    });
    it('move right from left', () => {
      const initial = [
        2, 2, 0, 0,
        4, 4, 2, 2,
        2, 2, 2, 0,
        2, 2, 2, 2,
      ];
      const expected = [
        0, 0, 0, 4,
        0, 0, 8, 4,
        0, 0, 2, 4,
        0, 0, 4, 4,
      ];
      expect(move(new Matrix(initial, 4), RIGHT).getArray()).toEqual(expected, 4);
    });
    it('move right from right', () => {
      const initial = [
        0, 0, 2, 2,
        2, 2, 4, 4,
        0, 2, 2, 2,
        2, 2, 2, 2,
      ];
      const expected = [
        0, 0, 0, 4,
        0, 0, 4, 8,
        0, 0, 2, 4,
        0, 0, 4, 4,
      ];
      expect(move(new Matrix(initial, 4), RIGHT).getArray()).toEqual(expected, 4);
    });
    it('move up from up', () => {
      const initial = [
        2, 4, 2, 2,
        2, 4, 2, 2,
        0, 2, 2, 2,
        0, 2, 0, 2,
      ];
      const expected = [
        4, 8, 4, 4,
        0, 4, 2, 4,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ];
      expect(move(new Matrix(initial, 4), UP).getArray()).toEqual(expected, 4);
    });
    it('move up from down', () => {
      const initial = [
        0, 2, 0, 2,
        0, 2, 2, 2,
        2, 4, 2, 2,
        2, 4, 2, 2,
      ];
      const expected = [
        4, 4, 4, 4,
        0, 8, 2, 4,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ];
      expect(move(new Matrix(initial, 4), UP).getArray()).toEqual(expected, 4);
    });
    it('move down from down', () => {
      const initial = [
        0, 2, 0, 2,
        0, 2, 2, 2,
        2, 4, 2, 2,
        2, 4, 2, 2,
      ];
      const expected = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 4, 2, 4,
        4, 8, 4, 4,
      ];
      expect(move(new Matrix(initial, 4), DOWN).getArray()).toEqual(expected, 4);
    });
    it('move down from up', () => {
      const initial = [
        2, 4, 2, 2,
        2, 4, 2, 2,
        0, 2, 2, 2,
        0, 2, 0, 2,
      ];
      const expected = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 8, 2, 4,
        4, 4, 4, 4,
      ];
      expect(move(new Matrix(initial, 4), DOWN).getArray()).toEqual(expected, 4);
    });
  });

  it('hasEmptyCell', () => {
    expect(hasEmptyCell([0])).toEqual(true);
    expect(hasEmptyCell([2, 2, 0])).toEqual(true);
    expect(hasEmptyCell([
      2, 2, 2,
      2, 0, 2,
      2, 2, 2,
    ])).toEqual(true);

    expect(hasEmptyCell([1])).toEqual(false);
    expect(hasEmptyCell([2, 2, 2])).toEqual(false);
    expect(hasEmptyCell([
      2, 2, 2,
      2, 2, 2,
      2, 2, 2,
    ])).toEqual(false);
  });

  describe('hasMoves', () => {
    it('hasMoves 1', () => {
      let grid;
      grid = new Matrix([
        8, 4,
        2, 8,
      ], 2);
      expect(hasMoves(grid)).toBeFalsy();
    });
    it('hasMoves 2', () => {
      let grid = new Matrix([
        2, 2,
        2, 2,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
    it('hasMoves 3', () => {
      let grid = new Matrix([
        2, 2,
        4, 4,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
    it('hasMoves 4', () => {
      let grid = new Matrix([
        4, 2,
        4, 2,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
    it('hasMoves 5', () => {
      let grid = new Matrix([
        2, 2,
        0, 0,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
    it('hasMoves 6', () => {
      let grid = new Matrix([
        2, 0,
        2, 0,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
    it('hasMoves 7', () => {
      let grid = new Matrix([
        2, 0,
        0, 2,
      ], 2);
      expect(hasMoves(grid)).toBeTruthy();
    });
  });
});
