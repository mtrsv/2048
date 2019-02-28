export default class Matrix {
  constructor(array, matrixSize) {
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
