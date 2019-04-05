'use strict';


class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(VectorObj) {
    if (VectorObj instanceof Vector) {
      const NewVectorObj = new Vector();
      NewVectorObj.x = this.x + VectorObj.x;
      NewVectorObj.y = this.y + VectorObj.y;
      return NewVectorObj;
    } else {
      throw new Error('К вектору можно прибавлять только Vector');
    }
  }

  times(multiplier) {
    const NewVectorObj = new Vector();
    NewVectorObj.x = this.x * multiplier;
    NewVectorObj.y = this.y * multiplier;
    return NewVectorObj;
  }
}

class Actor {
  constructor(vectorPosition = new Vector(0, 0), vectorSize = new Vector(1, 1), vectorSpeed = new Vector(0, 0)) {
    if (vectorPosition instanceof Vector) {
      this.pos = vectorPosition;
    } else {
      throw new Error('В vectorPosition передать можно только  Vector');
    }
    if (vectorSize instanceof Vector) {
      this.size = vectorSize;
    } else {
      throw new Error('В vectorSize передать можно только вектор типа Vector');
    }
    if (vectorSpeed instanceof Vector) {
      this.speed = vectorSpeed;
    } else {
      throw new Error('В vectorSize передать можно только  Vector');
    }
  }

  act() {
  }
  get left() {
    return this.pos.x;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get top() {
    return this.pos.y;
  }

  get type() {
    return "actor";
  }

  isIntersect(actorObj) {
    if (!(actorObj instanceof Actor)) {
      throw new Error("Передать можно только объект типа Actor");
    }
    if (this === actorObj) {
      return false;
    };
    if (this.left < actorObj.right && this.right > actorObj.left &&
      this.bottom > actorObj.top && this.top < actorObj.bottom) {
      return true;
    } 
    return false;
  }
}

class Level {
  constructor(arrayGrid = [], arrayActor = []) {
    this.grid = arrayGrid;
    this.actors = arrayActor;
    this.player = arrayActor.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = Math.max(0, ...this.grid.map(element => element.length));
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    } 
    return false;
  }

  actorAt(actorObj) {
    if (actorObj instanceof Actor) {
      return this.actors.find(
        function (actor) {
          if (actorObj.isIntersect(actor)) {
            return actor;
          } else {
            return;
          }
        });
    } else {
      throw new Error("Передать можно только вектор типа Actor");
    }
  }

  actorAt(moveActor) {
    if (!(moveActor instanceof Actor)) {
      throw new Error("Передать можно только вектор типа Actor");
    }
    return this.actors.find(actor => moveActor.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if (!((position instanceof Vector) && (size instanceof Vector))) {
      throw new Error("Передать можно только вектор типа Vector");
    }
    const topBorder = Math.floor(position.y), bottomBorder = Math.ceil(position.y + size.y), leftBorder = Math.floor(position.x), rightBorder = Math.ceil(position.x + size.x);
    if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
      return 'wall';
    }
    if (bottomBorder > this.height) {
      return 'lava';
    }
    for (let y = topBorder; y < bottomBorder; y++) {
      for (let x = leftBorder; x < rightBorder; x++) {
        const cell = this.grid[y][x];
        if (cell) {
          return cell;
        }
      }
    }
  }

  removeActor(actorObj) {
    const findIndex = this.actors.indexOf(actorObj);
    if (findIndex !== -1) {
      this.actors.splice(findIndex, 1)
    }
  }

  noMoreActors(typeString) {
    if (this.actors.find(actor => actor.type === typeString)) {
      return false;
    }
    return true;
  }

  playerTouched(obstacleType, actor) {
    if (this.status === null) {
      if (obstacleType === 'lava' || obstacleType === 'fireball') {
        this.status = 'lost';
      }
      if (obstacleType === 'coin') {
        this.removeActor(actor);
        if (this.noMoreActors('coin')) {
          this.status = 'won';
        }
      }
    }
  }
}

class LevelParser {
  constructor(actorsDict = {}) {
    this.actorsDict = actorsDict;
  }
  actorFromSymbol(symbolString) {
    if (symbolString === null || symbolString === undefined) {
      return;
    }
    const keysArr = Object.keys(this.actorsDict);
    if (keysArr.find(actor => actor === symbolString)) {
      return this.actorsDict[symbolString];
    }
    return;
  }
  obstacleFromSymbol(symbolString) {
    if (symbolString === 'x') {
      return 'wall';
    } else if (symbolString === '!') {
      return 'lava';
    } else { 
      return; 
    }
  }
  createGrid(plan) {
    const grid = plan.map(line => line.split(''));
    const grid1 = grid.map(line => line.map(cell => this.obstacleFromSymbol(cell)));
    return grid1;
  }
  createActors(stringsArr = []) {
    const actorsArr = [];
    const arrOfArrays = stringsArr.map(string => string.split(''));
    arrOfArrays.forEach((itemY, y) => {
      itemY.forEach((itemX, x) => {
        const constructorActors = this.actorFromSymbol(itemX);
        if (typeof constructorActors !== 'function') {
          return;
        }
        const result = new constructorActors(new Vector(x, y));
        if (result instanceof Actor) {
          actorsArr.push(result);
        }
      });
    });
    return actorsArr;
  }
  parse(plan = []) {
    const level = new Level(this.createGrid(plan), this.createActors(plan));
    return level;
  }
}

class Fireball extends Actor {
  constructor(vectorPosition = new Vector(0, 0), vectorSpeed = new Vector(0, 0)) {
    super(vectorPosition, vectorSpeed);
    this.size = new Vector(1, 1);
    this.speed = vectorSpeed;
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    const x1 = this.pos.x + this.speed.x * time;
    const y1 = this.pos.y + this.speed.y * time;
    return new Vector(x1, y1);
  }
  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }
  act(time, level) {
    const nextPosition = this.getNextPosition(time);
    const obstacle = level.obstacleAt(nextPosition, this.size);
    if (obstacle) {
      this.handleObstacle(this.speed);
    } else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(vectorPosition = new Vector(0, 0)) {
    super();
    this.speed = new Vector(2, 0);
  }
}

class VerticalFireball extends Fireball {
  constructor(vectorPosition = new Vector(0, 0)) {
    super();
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball {
  constructor(vectorPosition = new Vector(0, 0)) {
    super();
    this.speed = new Vector(0, 3);
    this.startPosition = vectorPosition;
  }
  handleObstacle() {
    this.pos = this.startPosition;
  }
}

class Coin extends Actor {
  constructor(vectorPosition = new Vector(0, 0)) {
    super();
    this.size = new Vector(0.6, 0.6);
    // this.pos.x = vectorPosition.x + 0.2; 
    // this.pos.y = vectorPosition.y + 0.1; 
    this.pos = new Vector(vectorPosition.x + 0.2, vectorPosition.y + 0.1);
    this.posStart = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;;
  }
  get type() {
    return 'coin';
  }
  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }
  getSpringVector() {
    const y = Math.sin(this.spring) * this.springDist;
    return new Vector(0, y);
  }
  getNextPosition(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
    const springVector = this.getSpringVector();
    const y = this.posStart.y + springVector.y;
    return new Vector(this.pos.x, y);
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(vectorPosition = new Vector(0, 0)) {
    super();
    this.pos = new Vector(vectorPosition.x + 0, vectorPosition.y - 0.5);
    console.log(this.pos);
    this.speed = new Vector(0, 0);
    this.size = new Vector(0.8, 1.5);
  }
  get type() {
    return 'player';
  }
}

const actorDict = {
  '@': Player,
  'v': VerticalFireball,
  'o': Coin,
  '=': HorizontalFireball,
  '|': FireRain


};

const parser = new LevelParser(actorDict);

loadLevels()
  .then((res) => {
    runGame(JSON.parse(res), parser, DOMDisplay)
      .then(() => alert('Вы выиграли!'))
  });

