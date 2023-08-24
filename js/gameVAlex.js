let config = {
    type: Phaser.AUTO,
    width: 480,
    height: 320,
    physics: {
        default: 'arcade'
    },
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    },
    audio: {         
        disableWebAudio: true     
    },
    autoCenter: true
};

// Déclaration de nos variables globales
let game = new Phaser.Game(config);
let tileSize;
let down, up, left, right;
let mumFrogImage, frogImage;
let tweenHeart;
let carImages = [];
let carsPerRow;
let carSpeed;
let countDown;
let score;

// Possibilité de changer vitesse, voitures, ...
function init() {
    tileSize = 16;
    carsPerRow = 10;
    carSpeed = 30;
    countDown = 60;
    score = 0;
}

function preload() {
    this.load.image('background', './assets/images/FroggerBackground.png');
    this.load.image('mumFrog', './assets/images/MumFrog.png');
    this.load.image('frog', './assets/images/Frog.png');
    this.load.image('heart', './assets/images/heart.png');
    this.load.image('car1', './assets/images/car.png');
    this.load.image('car2', './assets/images/snowCar.png');
    this.load.image('car3', './assets/images/F1-1.png');
    this.load.image('deadFrog', './assets/images/deadFrog.png');

    this.load.audio('deadFrog', './assets/audio/smashed.wav');
    this.load.audio('meetingMom', './assets/audio/coaac.wav');
}

function create() {
    // Afficher background
    backImage = this.add.image(0, 0, 'background');
    backImage.setOrigin(0, 0);
    
    // Afficher maman grenouille
    mumFrogImage = this.add.image(Phaser.Math.Between(0, 27)*tileSize, 0, 'mumFrog');
    mumFrogImage.setOrigin(0, 0);
    
    // Afficher grenouille
    frogImage = this.add.image(Phaser.Math.Between(0, 25)*tileSize+(tileSize/2), config.height-tileSize/2, 'frog');

    // Affichage score
    scoreText = this.add.text(410, 300, 'Score : ' + score, {fontFamily : 'Arial', fontSize : 16, color : '#ffffff'});
    
    // Préparer cadavre grenouille
    deadFrogImage = this.add.image(1000, 1000, 'deadFrog');
    
    // Préparer coeur de réussite de jeu
    heartImage = this.add.image(240, 160, 'heart');
    heartImage.setScale(0.01);
    heartImage.alpha = 0;

    // Création audio
    deadFrogSound = this.sound.add('deadFrog');
    meetingMomSound = this.sound.add('meetingMom');
    
    // Afficher voitures "=>" 2 boucles pour 3 lignes de x voitures
    const spaceBetweenCars = config.width / carsPerRow; // Espace entre les voitures. Largeur divisé par le nombre de voitures
    const maxRandomOffset = (spaceBetweenCars - tileSize) / 2; // Petit décalage pour que les voitures ne soient pas parfaitement alignées
    for (let j = 0; j < 3; j++){
        for (let i = 0; i < carsPerRow; i++) {
            carImages[i+j*carsPerRow] = this.physics.add.image(i*spaceBetweenCars+Phaser.Math.Between(-maxRandomOffset, maxRandomOffset), 64+j*tileSize*2, 'car'+Phaser.Math.Between(1, 3));
            carImages[i+j*carsPerRow].setOrigin(0, 0); // i+j*carsPerRow représente un calcul pour chaque index de la liste des voitures
            carImages[i+j*carsPerRow].setVelocity(carSpeed, 0);
        }
    }

    // Afficher voitures "<=" 2 boucles pour 3 lignes de x voitures
    for (let j = 3; j < 6; j++){
        for (let i = 0; i < carsPerRow; i++) {
            carImages[i+j*carsPerRow] = this.physics.add.image(i*spaceBetweenCars+Phaser.Math.Between(-maxRandomOffset, maxRandomOffset), 96+j*tileSize*2, 'car'+Phaser.Math.Between(1, 3));
            carImages[i+j*carsPerRow].setOrigin(0, 0); // Liste J commence à 3 pour continuer les indexet ne pas remplacer les index des boucles d'avant
            carImages[i+j*carsPerRow].angle = 180; // Inverser l'image
            carImages[i+j*carsPerRow].setVelocity(-carSpeed, 0);// - carspeed, parce que la voiture va dans l'autre sens
        }
    }

    // Mise en place des commandes flèches
    down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // Création + affichage timer affiché sur écran
    countDownText = this.add.text(450, 0, countDown, {fontFamily : 'Arial', fontSize : 24, color : '#00ff00'});
    let countDownTimer = this.time.addEvent({
        delay: 1000, // correspond à 1 seconde
        callback: () => {
            countDown--;
            countDownText.text = countDown;
            if (countDown == 9) {
                countDownText.setColor('#ff0000');
                countDownText.setPosition(463, 0);
            }
            if (countDown == 0) {
                countDownText.text = "Fini";
                countDownText.setPosition(440, 0);
            }
        },
        repeat: countDown - 1
    })
}

function update() {
    // Faire bouger la grenouille avec les flèches
    if (Phaser.Input.Keyboard.JustDown(up) && (frogImage.y > tileSize/2)) {
        frogImage.angle = 0;
        frogImage.y -= tileSize;
    }

    if (Phaser.Input.Keyboard.JustDown(down) && (frogImage.y < config.height - tileSize/2)) {
        frogImage.angle = 180;
        frogImage.y += tileSize;
    }

    if (Phaser.Input.Keyboard.JustDown(left)&&(frogImage.x > tileSize/2)) {
        frogImage.angle = -90;
        frogImage.x -= tileSize;
    }

    if (Phaser.Input.Keyboard.JustDown(right)&&(frogImage.x < config.width - tileSize/2)) {
        frogImage.angle = 90;
        frogImage.x += tileSize;
    }

    // Faire gagner le jeu (interaction avec maman Grenouille + coeur de réussite)
    if(Phaser.Geom.Intersects.RectangleToRectangle(frogImage.getBounds(),mumFrogImage.getBounds())){
        heartImage.alpha = 1;
        meetingMomSound.play();
        tweenHeart = this.tweens.add({
            targets : heartImage,
            scaleX : 5,
            scaleY : 5,
            duration : 1000,
            ease : 'Linear',
            yoy : false,
            loop : 0,
            // Restart du jeu sans interrompre timer quand win
            onComplete: () => {
                frogImage.setPosition(Phaser.Math.Between(0, 29)*tileSize+(tileSize/2), config.height-tileSize/2, 'frog');
                frogImage.angle = 0;
                heartImage.setScale(0.1);
                heartImage.alpha = 0;
                score ++;
                scoreText.text = 'Score : ' + score;
            }
        })
        frogImage.x = 1000;
    }

    // Faire réapparaitre la voiture de l'autre côté 
    for (let i = 0; i < carImages.length; i++){
        // Voiture dans sens =>
        if((carImages[i].x > config.width)&&(i < carImages.length/2)) {
            carImages[i].x = -tileSize;
        }
        // Voiture dans sens <=
        if((carImages[i].x < 0)&&(i >= carImages.length/2)) {
            carImages[i].x = config.width + tileSize;
        }

        // Collision voiture/grenouille + timer 2 secondes avant de restart
        if(Phaser.Geom.Intersects.RectangleToRectangle(frogImage.getBounds(),carImages[i].getBounds())){
            deadFrogImage.setPosition(frogImage.x, frogImage.y);
            deadFrogSound.play();
            frogImage.x = 1000;
            let timerBeforeRestart = this.time.addEvent({
                delay : 2000,
                // Restart du jeu sans interrompre timer quand dead
                callback: () => {
                    frogImage.setPosition(Phaser.Math.Between(0, 29)*tileSize+(tileSize/2), config.height-tileSize/2, 'frog');
                    frogImage.angle = 0;
                    deadFrogImage.setPosition(1000, 1000);
                }
            })
        }
    }
}