'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(VectorObj) {
    if (NewVectorObj) {
      const NewVectorObj = new Vector();
      NewVectorObj.x = this.x + VectorObj.x;
      NewVectorObj.y = this.y + VectorObj.y;
      return NewVectorObj;
    } else {
      throw  Error('Передали не вектор ');
    }
  }

  times(number) {
    const NewVectorObj = new Vector();
    NewVectorObj.x = this.x * number;
    NewVectorObj.y = this.y * number;
    return NewVectorObj;
  }
}

