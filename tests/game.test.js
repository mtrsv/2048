import {rotateMatrix, shrinkRow, convertToMatrix} from './../src/game'

describe('game', ()=>{
  describe('shrinkRow', ()=>{
    it('shrink 1', () => {
      const initial = [0,0,0,1];
      const expected = [1,0,0,0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 2', () => {
      const initial = [0,1,0,2];
      const expected = [1,2,0,0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 3', () => {
      const initial = [1,2,0,3];
      const expected = [1,2,3,0];
      expect(shrinkRow(initial)).toEqual(expected);
    });

    it('shrink 4', () => {
      const initial = [1,2,3,4];
      const expected = [1,2,3,4];
      expect(shrinkRow(initial)).toEqual(expected);
    });
  });

  describe('rotateMatrix', () => {
    it('rotateMatrix 1', () => {
      const initial = [
        [1,2],
        [4,3]
      ];
      const expected = [
        [4,1],
        [3,2]
      ];
      expect(rotateMatrix(initial)).toEqual(expected);
    });
    it('rotateMatrix 2', () => {
      const initial = [
        [0,0,1],
        [0,1,0],
        [1,0,0],
      ];
      const expected = [
        [1,0,0],
        [0,1,0],
        [0,0,1]
      ];
      expect(rotateMatrix(initial)).toEqual(expected);
    });
    it('rotateMatrix 3', () => {
      const initial = [
        [0,0,0,0],
        [1,1,1,1],
        [2,2,2,2],
        [3,3,3,3],
      ];
      const expected = [
        [3,2,1,0],
        [3,2,1,0],
        [3,2,1,0],
        [3,2,1,0],
      ];
      expect(rotateMatrix(initial)).toEqual(expected);
    });
  });

  it('convertToMatrix', () => {
    const initial = [
      0,0,0,0,
      1,1,1,1,
      2,2,2,2,
      3,3,3,3,
    ];
    const expected = [
      [0,0,0,0],
      [1,1,1,1],
      [2,2,2,2],
      [3,3,3,3],
    ];
    expect(convertToMatrix(initial)).toEqual(expected);
  })
});