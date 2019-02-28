import Matrix, {getIndex} from './../src/matrix';

describe('game', () => {
  let array = [11,22,33,44,55,66,77,88,99];
  let matrix;

  beforeEach(() => {
    matrix = new Matrix(array, 3);
  });

  it('get', () => {
    expect(matrix.get(0,0)).toEqual(11);
    expect(matrix.get(0,1)).toEqual(22);
    expect(matrix.get(0,2)).toEqual(33);
    expect(matrix.get(1,0)).toEqual(44);
    expect(matrix.get(1,1)).toEqual(55);
    expect(matrix.get(1,2)).toEqual(66);
    expect(matrix.get(2,0)).toEqual(77);
    expect(matrix.get(2,1)).toEqual(88);
    expect(matrix.get(2,2)).toEqual(99);
  });

  it('set', () => {
    expect(matrix.get(2,2)).toEqual(99);
    matrix.set(2,2,123);
    expect(matrix.get(2,2)).toEqual(123);

    expect(matrix.get(1,2)).toEqual(66);
    matrix.set(1,2,321);
    expect(matrix.get(1,2)).toEqual(321);
  });

  it('getIndex', () => {
    expect(getIndex(0,0,3)).toEqual(0);
    expect(getIndex(0,1,3)).toEqual(1);
    expect(getIndex(0,2,3)).toEqual(2);
    expect(getIndex(1,0,3)).toEqual(3);
    expect(getIndex(1,1,3)).toEqual(4);
    expect(getIndex(1,2,3)).toEqual(5);
    expect(getIndex(2,0,3)).toEqual(6);
    expect(getIndex(2,1,3)).toEqual(7);
    expect(getIndex(2,2,3)).toEqual(8);

    expect(getIndex(0,0,5)).toEqual(0);
    expect(getIndex(0,1,5)).toEqual(1);
    expect(getIndex(0,2,5)).toEqual(2);
    expect(getIndex(1,0,5)).toEqual(5);
    expect(getIndex(1,1,5)).toEqual(6);
    expect(getIndex(1,2,5)).toEqual(7);
    expect(getIndex(2,0,5)).toEqual(10);
    expect(getIndex(2,1,5)).toEqual(11);
    expect(getIndex(2,2,5)).toEqual(12);
  });

  it('getArray', () => {
    let arr = [1,2,3,4];
    let matrix = new Matrix(arr, 2);
    let gottenArr = matrix.getArray();
    expect(gottenArr).toEqual(arr);
    expect(gottenArr !== arr).toBeTruthy();
  });
});