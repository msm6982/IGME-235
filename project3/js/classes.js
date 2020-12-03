class Bat extends PIXI.Sprite {
    constructor(x = 0, y = 0, flapAcceleration = 0.2, rotateSpeed = 3, maxSpeed = 50, gravityModifier = 30) {
        super(app.loader.resources["images/batTemp.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.25);
        this.maxSpeed = maxSpeed;
        this.x = x;
        this.y = y;
        this.currentPosition = { x: 0, y: 0 };
        this.currentVelocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.currentDircetion = { x: 0, y: 0 };
        this.rotation = 0;
        this.flapAcceleration = flapAcceleration;
        this.rotateSpeed = rotateSpeed;
        this.gravityModifier = gravityModifier;
        this.startFlapping = false;
        this.isAlive = true;
    }

    // Flap Wings only once
    propelOnce() {
        this.startFlapping = true;
    }

    // Reset Upon restanting the game
    resetLife() {
        this.currentPosition = { x: 0, y: 0 };
        this.currentVelocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.currentDircetion = { x: 0, y: 0 };
        this.startFlapping = false;
        this.isAlive = true;
    }

    // Update the current position and set the position of the sprite
    setPosition(intX, intY) {
        this.currentPosition.x = intX;
        this.currentPosition.y = intY;
        this.x = this.currentPosition.x;
        this.y = this.currentPosition.y;
    }

    // apply downwards gravitational force
    applyGravity() {
        // Positive since bottom is max scene height
        let AccelDueToGrav = 1;
        let applyToVelocity = AccelDueToGrav * this.gravityModifier;
        return applyToVelocity;
    }

    // Handle the bat's movement called in gameloop
    move(dt) {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        if (this.startFlapping == true) {
            this.propelFoward();
            this.startFlapping = false;
        }
        this.acceleration.y += this.applyGravity();
        this.setVelocity(dt);
        let newX = this.currentPosition.x += this.currentVelocity.x * dt;
        let newY = this.currentPosition.y += this.currentVelocity.y * dt;
        this.setPosition(newX, newY);
    }

    // Set the velocity of the bat, clamping the velocity
    setVelocity(dt) {
        this.currentVelocity.x += this.acceleration.x * dt;
        this.currentVelocity.y += this.acceleration.y * dt;
        this.currentVelocity.x = clamp(this.currentVelocity.x, -this.maxSpeed, this.maxSpeed * 2);
        this.currentVelocity.y = clamp(this.currentVelocity.y, -this.maxSpeed, this.maxSpeed * 2);
    }

    // flap the bat's wings propelling it foward
    propelFoward() {
        this.acceleration.x += Math.cos(this.rotation + Math.PI / 2) * (-2000);
        this.acceleration.y += Math.sin(this.rotation + Math.PI / 2) * (-2000);
    }

    // rotate the bat left
    rotateLeft(dt) {
        this.rotation += this.rotateSpeed * dt;
        this.setDirection();
    }

    // rotate the bat right
    rotateRight(dt) {
        this.rotation -= this.rotateSpeed * dt;
        this.setDirection();
    }

    // Set the direction of the bat based on d
    setDirection() {
        this.currentDircetion.y = (Math.sin(this.rotation) * (180 / Math.PI));
        this.currentDircetion.x = (Math.cos(this.rotation) * (180 / Math.PI));
    }
}

// Based on circles form circle blasters
class Bugs extends PIXI.Graphics {
    constructor(sides = 5, color = 0xD3D3D3, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.sides = sides;
        this.drawRect(0, 0, sides, sides);
        this.endFill();
        this.x = x;
        this.y = y;
        // variables
        this.fwd = getRandomUnitVector();
        this.speed = 75;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Owl extends PIXI.Graphics {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}