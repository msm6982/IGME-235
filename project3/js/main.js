"use strict";
const app = new PIXI.Application({
    width: 600,
    height: 600
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load images
app.loader.
    add([
        "images/bat.png",
        "images/batTemp.png",
        "images/background.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// keys
let keys = {};

// game variables
let startScene;
let gameScene, bat, scoreLabel, lifeLabel, flapSound, background;
let gameOverScene;
let gameOverScoreLabel;

let trees = [];
let owls = [];
let bugs = [];
let fruit = [];
let score = 0;
let life = 5;
let paused = true;

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // Control Event Handelers
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyRelease);

    // #5 - Create Bat
    bat = new Bat();
    gameScene.addChild(bat);

    background = new PIXI.TilingSprite(app.loader.resources["images/background.png"].texture,600,600);
    background.position.set(0,0);
    gameScene.addChild(background);

    // #6 - Load Sounds
    flapSound = new Howl({
        src: ['sounds/wingFlap.wav']
    });
    // #7 - Load sprite sheet


    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // 1 - set up 'startScene'
    // 1A -  make the top start label
    let startLabel1 = new PIXI.Text("Night Flight");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: 'Futura',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make the middle start label
    let startLabel2 = new PIXI.Text("For Nocturnals Only!");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Futura',
        fontStyle: 'italic',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // 1C - make the start game button
    let startButton = new PIXI.Text("Take Flight!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); // startGame is a function reference
    startButton.on('pointover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on('pointout', e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);

    // 2 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: 'Futura',
        stroke: 0xFF0000,
        strokeThickness: 4
    })

    // 2A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // 2B - make life label
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);


    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n        :-O");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 100;
    gameOverScoreLabel.y = sceneHeight / 2;
    gameOverScene.addChild(gameOverScoreLabel);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);


    
}

// Increase Score Count
// Gained by collecting bugs and eventually fruit
function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score   ${score}`;
}

// Decrease Life total
function decreaseLifeBy(value) {
    life -= value;
    lifeLabel.text = `Life     ${life}`;
}

let flapStart = false;

// Press and release Key functionality, press down
function keyDown(e) {
    // Dont do anything for space, flapping
    if (e.key == " ") {

    }
    else {
        keys[e.keyCode] = true;
    }
}
// Release
function keyRelease(e) {
    // Only flap when the space is released
    if (e.key == " ") {
        flapStart = true;
    }
    keys[e.keyCode] = false;
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 5;
    bat.resetLife(); // Doesn't work?
    increaseScoreBy(0);
    decreaseLifeBy(0);
    bat.setPosition(sceneWidth / 2, sceneHeight / 2);
    paused = false;
    createBugs(10);
}


function gameLoop() {

    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    if (paused) { return; }

    KeepInBounds();

    // Move the bat
    bat.move(dt);

    // Move all the bugs
    for (let b of bugs) {
        b.move(dt);
    }

    // Press D to rotate right
    if (keys["65"]) {
        bat.rotateRight(dt);
    }

    // Press A to rotate left
    if (keys["68"]) {
        bat.rotateLeft(dt);
    }

    // Press Space to flap winds once
    if (flapStart) {
        flapSound.play();
        bat.propelOnce();
        flapStart = false;
    }

    collisionDetection();

    // Create new bugs for each dead one
    let newBugs = 0;
    for (let b of bugs) {
        if (!b.isAlive) {
            newBugs++;
        }
    }
    createBugs(newBugs);

    // get rid of dead bugs
    bugs = bugs.filter(b => b.isAlive);

    // End game if life goes to zero
    if (life <= 0) {
        bat.isAlive = false;
        gameEnd();
        return;
    }

}

// Check for collision amougst various objects
function collisionDetection() {
    // bugs and bat
    // Eat the bug and gain points!
    for (let b of bugs) {
        if (b.isAlive & rectsIntersect(b, bat)) {
            //hitSound.play();
            gameScene.removeChild(b);
            b.isAlive = false;
            increaseScoreBy(1);
        }
    }

}


// Keep all objects in bounds
function KeepInBounds() {
    // Keep the bat in bounds of screne
    let w1 = bat.width / 2;
    let h1 = bat.height / 2;
    if (sceneWidth - w1 < bat.x) {
        bat.setPosition(sceneWidth - w1, bat.y);
    }
    if (0 + w1 > bat.x) {
        bat.setPosition(w1, bat.y);
    }
    // Die if the bat hits the ground
    if (sceneHeight - h1 < bat.y) {
        bat.setPosition(bat.x, sceneHeight - h1);
        decreaseLifeBy(life);
    }
    if (0 + h1 > bat.y) {
        bat.setPosition(bat.x, h1);
    }

    // Keep bugs in bounds
    for (let b of bugs) {
        if (b.x <= b.sides / 2 || b.x >= sceneWidth - b.sides / 2) {
            b.reflectX();
        }

        if (b.y <= b.sides / 2 || b.y >= sceneHeight - b.sides / 2) {
            b.reflectY();
        }
    }
}

function gameEnd() {
    paused = true;
    bugs.forEach(c => gameScene.removeChild(c));
    bugs = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
    gameOverScoreLabel.text = `Final Score:  ${score}`;
}

function createBugs(numBugs) {
    for (let i = 0; i < numBugs; i++) {
        let squareSides = 5;
        let b = new Bugs(squareSides);
        b.x = Math.random() * (sceneWidth) - squareSides;
        b.y = Math.random() * (sceneHeight / 2) - squareSides;
        bugs.push(b);
        gameScene.addChild(b);
    }
}
