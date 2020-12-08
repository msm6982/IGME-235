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
        "images/background.png",
        "images/owlEdit.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// keys
let keys = {};

// game variables
let backgroundMusic;
let startScene;
let gameScene, bat, scoreLabel, lifeLabel, flapSound, hootSound, screechSound, background, owlSpawnTimer;
let gameOverScene;
let gameOverScoreLabel;


let playerSpriteSheet = [];
let owlSpriteSheet = [];
let owls = [];
let bugs = [];
let fruit = [];
let score = 0;
let level = 1;
let life = 5;
let bgX = 0;
let bgSpeed = 10;
let paused = true;
let flapStart = false;

function setup() {
    stage = app.stage;
    // Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);


    // Add Backgrounds
    background = new PIXI.TilingSprite(app.loader.resources["images/background.png"].texture, 600, 600);
    background.position.set(0, 0);
    gameScene.addChild(background);

    let startSceneBackground = new PIXI.TilingSprite(app.loader.resources["images/background.png"].texture, 600, 600);
    startSceneBackground.position.set(0, 0);
    startScene.addChild(startSceneBackground);

    let gameOverbackground = new PIXI.TilingSprite(app.loader.resources["images/background.png"].texture, 600, 600);
    gameOverbackground.position.set(0, 0);
    gameOverScene.addChild(gameOverbackground);

    // Load sprite sheet
    createPlayerSpriteSheet();
    createOwlSpriteSheet();

    // Create Bat
    bat = new Bat(playerSpriteSheet.Falling);
    gameScene.addChild(bat);

    // Create labels for all 3 scenes
    createLabelsAndButtons();

    // Control Event Handelers
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyRelease);

    // Load Sounds
    flapSound = new Howl({
        src: ['sounds/wingFlap.wav']
    });

    screechSound = new Howl({
        src: ['sounds/owlScreech.mp3']
    });

    hootSound = new Howl({
        src: ['sounds/owlHoot.mp3']
    });

    backgroundMusic = new Howl({
        src: ['sounds/soundtrack.mp3'],
        loop: true,
        autoplay: true,
        volume: 0.2
    });

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

// Load Sprite of the player bat sprite
function createPlayerSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.from(app.loader.resources["images/bat.png"].url);
    let w = 32;
    let h = 32;

    playerSpriteSheet["Flap"] = [
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(2 * w, 0, w, h)),
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(3 * w, 0, w, h)),
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(1 * w, 0, w, h))
    ];
    playerSpriteSheet["Falling"] = [
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(2 * w, 0, w, h))
    ];
}

// Load Sprite of the owls 
function createOwlSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.from(app.loader.resources["images/owlEdit.png"].url);
    let w = 16;
    let h = 16;

    owlSpriteSheet["Flying"] = [
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(0 * w, h * 3, w, h)),
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(1 * w, h * 3, w, h)),
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(2 * w, h * 3, w, h)),
        new PIXI.Texture(spriteSheet, new PIXI.Rectangle(3 * w, h * 3, w, h)),
    ];
}

function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x573280,
        fontSize: 48,
        fontFamily: "Arial"
    });

    // 1 - set up 'startScene'
    // 1A -  make the top start label
    let startLabel1 = new PIXI.Text("Night Flight");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: 'Arial',
        stroke: 0x573280,
        strokeThickness: 6
    });
    startLabel1.x = sceneWidth/2 - 230;
    startLabel1.y = sceneHeight - 480;
    startScene.addChild(startLabel1);

    // 1B - make the middle start label
    let startLabel2 = new PIXI.Text("For Nocturnals Only");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: 'Arial',
        fontStyle: 'italic',
        stroke: 0x573280,
        strokeThickness: 3
    });
    startLabel2.x = sceneWidth/2 - 130;
    startLabel2.y = sceneHeight/2 - 50;
    startScene.addChild(startLabel2);

    // 1C - make the start game button
    let startButton = new PIXI.Text("Take Flight!");
    startButton.style = buttonStyle;
    startButton.x = sceneWidth/2 - 110;
    startButton.y = sceneHeight/2 + 100;
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
        fontFamily: 'Arial',
        stroke: 0x573280,
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
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Arial",
        stroke: 0x573280,
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
    let playAgainButton = new PIXI.Text("Keep Flying?");
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
// Gained by collecting bugs
// Life and level is increased on reaching certain scores
function increaseScoreBy(value) {
    score += value;

    if (score == 15 || score == 30 || score == 45) {
        level++;
        life++;
        createBugs(1);
        lifeLabel.text = `Life     ${life}`; 
    }
    scoreLabel.text = `Score   ${score}`;
}

// Decrease Life total
function decreaseLifeBy(value) {
    life -= value;
    lifeLabel.text = `Life     ${life}`;
}

// Press and release Key functionality, press down
function keyDown(e) {
    // Dont do anything for space prevents the screne from scrolling, flapping
    if (e.key == " ") {
        e.preventDefault();
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

// Reset necicary feilds once the gamescene starts 
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    level = 1;
    life = 5;
    bat.resetLife();
    increaseScoreBy(0);
    decreaseLifeBy(0);
    bat.setPosition(sceneWidth / 2, sceneHeight / 2);
    paused = false;
    owlSpawnTimer = 6;
    createBugs(5);
    bgX = 0;
    bat.textures = playerSpriteSheet.Falling;
    bat.play();
}


function gameLoop() {

    // Keep track of delta time
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    bat.amimationSpeed = dt / 3;

    if (paused) { return; }

    moveBackground(dt);

    // Spawn and owl once a random time is matched
    owlSpawnTimer -= 1 * dt
    if (owlSpawnTimer <= 0) {
        let nextSpawn = 6 - (level - 1);
        CreateOwl();
        owlSpawnTimer = getRandom(nextSpawn - 2, nextSpawn);
    }


    KeepInBounds();

    // Move the bat
    bat.amimationSpeed = dt * (1 / 3);
    bat.move(dt);

    if (!bat.playing) {
        bat.textures = playerSpriteSheet.Falling
        bat.loop = true;
        bat.play();
    }

    // Move all the bugs
    for (let b of bugs) {
        b.move(dt);
    }

    // Move all owls
    for (let o of owls) {
        o.move(dt);
    }

    // Press D to rotate right
    if (keys["65"]) {
        bat.rotateRight(dt);
    }

    // Press A to rotate left
    if (keys["68"]) {
        bat.rotateLeft(dt);
    }

    // Press Space to flap wings once
    if (flapStart) {
        flapSound.play();
        bat.propelOnce();
        flapStart = false;

        bat.textures = playerSpriteSheet.Flap
        bat.loop = false;
        bat.play();

    }

    // Handle collision detections
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
    // Owls also eat bugs
    for (let b of bugs) {
        if (b.isAlive & rectsIntersect(b, bat)) {
            gameScene.removeChild(b);
            b.isAlive = false;
            increaseScoreBy(1);
        }
        for (let o of owls) {
            if (b.isAlive & rectsIntersect(b, o)) {
                gameScene.removeChild(b);
                b.isAlive = false;
            }
        }
    }

    // Owls damage the bat on contact and fly away
    for (let o of owls) {
        if (o.alreadyDamaged == false & rectsIntersect(o, bat)) {
            o.alreadyDamaged = true;
            o.speed *= 1.5;
            decreaseLifeBy(1);
            screechSound.play();
        }
    }

}


// Keep all objects in bounds
// Add specific behavior for objects relating to the screne bounds
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

    // "Kill" bugs that go out of bounds, they fly away ;)
    // If they hit the ground refelect off it
    for (let b of bugs) {
        if (b.x < b.sides / 2 || b.x > sceneWidth - b.sides / 2 || b.y < b.sides / 2) {
            b.isAlive = false;
            gameScene.removeChild(b);
        }

        if (b.y > sceneHeight - b.sides / 2) {
            b.reflectY();
        }
    }

    // "Kill" owls that go out of bounds on the left side of the screen, they fly away ;)
    for (let o of owls) {
        if (o.x < (- o.width / 2) || o.y < (- o.height / 2)) {
            o.isAlive = false;
            gameScene.removeChild(o);
        }
    }
    owls = owls.filter(o => o.isAlive);
}

// End the game and display the final score
function gameEnd() {
    paused = true;
    bugs.forEach(b => gameScene.removeChild(b));
    bugs = [];

    owls.forEach(o => gameScene.removeChild(o));
    owls = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
    gameOverScoreLabel.text = `Final Score:  ${score}`;
}

// Create collectable bugs and add them to the bug list
function createBugs(numBugs) {
    for (let i = 0; i < numBugs; i++) {
        let squareSides = 5;
        let b = new Bugs();
        b.x = getRandom(squareSides, sceneWidth - squareSides);
        b.y = getRandom(squareSides, (sceneHeight / 1.5) - squareSides);
        bugs.push(b);
        gameScene.addChild(b);
    }
}

// Move the scrolling background
function moveBackground(dt) {
    bgX -= bgSpeed * dt
    background.tilePosition.x = bgX;
}

// Create a new owl obstical
// Set it's initial position off screen to the right at a random height
function CreateOwl() {
    let newOwl = new Owl(owlSpriteSheet.Flying);
    newOwl.speed = (bgSpeed * 10) * (level / 2);
    let w1 = newOwl.width / 2;
    let h1 = newOwl.height / 2;
    newOwl.x = sceneWidth + (w1 * 4);
    newOwl.y = getRandom(h1 * 2, (sceneHeight / 1.5) - h1);
    gameScene.addChild(newOwl);
    hootSound.play();
    owls.push(newOwl);
}