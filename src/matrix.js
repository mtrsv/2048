export default class Matrix {
  constructor(array, matrixSize) {
    if (typeof matrixSize !== 'number') {
      throw new Error('matrixSize is not a number');
    }
    this.data = [...array];
    this.size = matrixSize;
  }
  get(i, j) {
    return this.data[getIndex(i, j, this.size)];
  }
  set(i, j, value) {
    this.data[getIndex(i, j, this.size)] = value;
  }
  getAt(i) {
    return this.data[i];
  }
  setAt(i, value) {
    this.data[i] = value;
  }
  getArray() {
    return [...this.data];
  }
  getRows() {
    const len = this.data.length;
    let result = [];
    for (let i = 0, j = 0; i < len; i++) {
      j = (i - i % this.size) / this.size;
      if (i % this.size === 0) {
        result.push([]);
      }
      result[j].push(this.getAt(i));
    }

    return result;
  }
  getColumns() {
    const len = this.data.length;
    let result = [];
    for (let i = 0; i < len; i++) {
      let column = (i % this.size);
      if(!result[column]) {
        result[column] = [];
      }
      result[column].push(this.getAt(i));
    }

    return result;
  }
}

export const getIndex = (i, j, size) => {
  return i * size + j;
};


export const isMatricesEqual = (a, b) => {
  if (!a || !b) {
    return false;
  }

  const arrA = a.getArray();
  const arrB = b.getArray();

  if (arrA.length !== arrB.length) {
    return false;
  }

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
};
