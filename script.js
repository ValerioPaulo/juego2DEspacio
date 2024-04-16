var juego=new Phaser.Game(1000,845,Phaser.CANVAS,'escenario');
var fondoJuego;
var persona;
var teclaDerecha;
var teclaIzquierda;
var teclaArriba;
var teclaAbajo;
var nuevo;
var enemigos;
var balas;
var tiempoBala=0;
var botonDisparo;
var musicaFondo;

var sonido; //////////////////// Declaración de la variable de sonido
var explosion; ///////////////////////////


var estadoPrincipal={
	//reducir personaje y enemigo a 128 pixeles
	preload: function(){
		juego.load.image('fondo','img/espacio.png');
		juego.load.spritesheet('animacion','img/personajeSprite.png',128,128);//lado x lado del enemigo
		juego.load.spritesheet('enemigo', 'img/nave.png',128,128); //lado x lado del enemigo
		juego.load.image('laser','img/laser.png');	
		juego.load.audio('musica', 'audio/fondo.mp3');

		juego.load.audio('sonidoAtaque', 'audio/disparo.mp3'); //////// Carga el sonido
    	juego.load.audio('sonidoExplosion', 'audio/explosion.mp3');////////

    	juego.load.audio('musicaVictoria', 'audio/wingame.wav'); // Carga la música de victoria

	},
	create: function(){

	
		//Mostrar en pantalla el FONDO del juego
		fondoJuego=juego.add.tileSprite(0,0,1000,845,'fondo');
		//----------PERSONAJE-------------------
		//Color el SPRITE(personaje) del juego en la posicion x=100, y=360
		nuevo=juego.add.sprite(100,450,'animacion');
		//Dar animacion al personaje que esta en el juego	
		nuevo.animations.add('movimiento',[0,1,2,3,4],10,true); //tercer parametro es velocidad

		//-------------BALAS DEL ENEMIGO--------
		botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		balas = juego.add.group();
		balas.enableBody=true;
		balas.physicsBodyType = Phaser.Physics.ARCADE;

		balas.createMultiple(20,'laser');
		balas.setAll('anchor.x',-1.5);
		balas.setAll('anchor.y',1);
		balas.setAll('outOfBoundsKill',true);
		balas.setAll('checkWorldBounds',true);


		//----------------GRUPO DE ENEMIGOS---------------
		enemigos = juego.add.group();
		enemigos.enableBody =  true;
		enemigos.physicsBodyType=Phaser.ARCADE;
		for(var y=0; y<2; y++){
			for(var x=0; x<5; x++){
				//SEPARAR ENEMIGOS
				var enemig = enemigos.create(x*150, y*150,'enemigo'); //Separacion de enemigos
				enemig.anchor.setTo(0.5);
			}
		}
		enemigos.x = 100;
		enemigos.y = 50;
		//Dando la posicion a los enemigos
		var animacion = juego.add.tween(enemigos).to( {x:500}, 2000,Phaser.Easing.Linear.None,true,0,1000,true

			);


		//Tecla de movimiento de personaje
		teclaDerecha=juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		teclaIzquierda=juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		teclaArriba=juego.input.keyboard.addKey(Phaser.Keyboard.UP);
		teclaAbajo=juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);

		//Detener el personaje cuando dejas de presionar la tecla
		teclaDerecha.onUp.add(this.detenerMovimiento, this);
		teclaIzquierda.onUp.add(this.detenerMovimiento,this);


		//Estableciendo LIMITES DEL MAPA
		juego.physics.startSystem(Phaser.Physics.ARCADE);
		juego.physics.arcade.enable(nuevo);
		nuevo.body.collideWorldBounds = true;

		// REPRODUCIR AUDIO de fondo al hacer CLICK
        juego.input.onDown.add(this.iniciarMusica, this);



        sonido = juego.add.audio('sonidoAtaque'); // Crea el objeto de sonido ////////////
    	explosion = juego.add.audio('sonidoExplosion');////////////////////////////////

	},
	iniciarMusica: function () {
        if (!musicaFondo || !musicaFondo.isPlaying) {
            musicaFondo = juego.add.audio('musica');
            musicaFondo.play();
        }
    },

	update: function(){		
		

		if(teclaDerecha.isDown){
			fondoJuego.tilePosition.x-=3;
			nuevo.x++;
			nuevo.animations.play('movimiento');
		}
		else if(teclaIzquierda.isDown){
			fondoJuego.tilePosition.x+=3;
			nuevo.x--;
			nuevo.animations.play('movimiento');
		}
		else if(teclaArriba.isDown){
			fondoJuego.tilePosition.y+=3;
			nuevo.y--;
			nuevo.animations.play('movimiento');
		}
		else if(teclaAbajo.isDown){
			fondoJuego.tilePosition.y-=3;
			nuevo.y++;
			nuevo.animations.play('movimiento');
		}

		//------------BALA DEL ENEMIGO---------------
		var bala;
		if(botonDisparo.isDown){
			if(juego.time.now>tiempoBala){
				bala = balas.getFirstExists(false);
			}
			if(bala){
				bala.reset(nuevo.x, nuevo.y);
				bala.body.velocity.y = -300;
				tiempoBala = juego.time.now+100;
				sonido.play(); // Reproduce el sonido cuando se dispara una bala
          		sonido.volume=0.4;
			}
		}

		
		juego.physics.arcade.overlap(balas,enemigos, colision, null,this);

	},
	detenerMovimiento: function(){
    // Detiene la animación y establece al personaje en un frame específico
    nuevo.animations.stop();
    nuevo.frame = 0; // Ajusta este frame al que desees para cuando el personaje esté quieto

	},
	

};


function colision(bala, enemigo){
	bala.kill();
	enemigo.kill();
	explosion.play();


	  // Verificar si quedan enemigos
    if (enemigos.countLiving() === 0) {
        mostrarFinJuego();
    }

}
//FUNCION PARA VERIFICAR QUE YA NO HAY ENEMIGOS Y AGREGAR MUSICA
function mostrarFinJuego() {
    var estilo = { font: "80px Arial", fill: "#FF5733" };
    var texto = juego.add.text(juego.world.centerX, juego.world.centerY, "El juego ha finalizado", estilo);
    texto.anchor.setTo(0.5, 0.5);


      // Detener la música de fondo si está sonando
    if (musicaFondo && musicaFondo.isPlaying) {
        musicaFondo.stop();
    }


    // Reproducir la música de victoria
    var musicaVictoria = juego.add.audio('musicaVictoria');
    musicaVictoria.play();


    // Detener los movimientos y animaciones
    nuevo.animations.stop();
    nuevo.body.velocity.x = 0;
    nuevo.body.velocity.y = 0;



 // Desactivar los controles
    juego.input.keyboard.removeKey(Phaser.Keyboard.RIGHT);
    juego.input.keyboard.removeKey(Phaser.Keyboard.LEFT);
    juego.input.keyboard.removeKey(Phaser.Keyboard.UP);
    juego.input.keyboard.removeKey(Phaser.Keyboard.DOWN);
    juego.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);

    // Opcional: Detener todos los procesos del juego si es necesario
    juego.time.events.removeAll();

     // Desactivar los controles
    // juego.paused = true;
    musicaFondo.stop();

}



// Ahora, registra ambos estados y empieza con el estado de inicio
//juego.state.add('inicio', estadoInicio);
juego.state.add('principal',estadoPrincipal);
juego.state.start('principal');



window.onload = function() {
    var botonIngresar = document.getElementById('ingresar');
    botonIngresar.onclick = function() {
        document.getElementById('bienvenida').style.display = 'none';
        document.getElementById('escenario').style.display = 'block';
        iniciarJuego();
    };
};

function iniciarJuego() {
    var juego = new Phaser.Game(1148, 685, Phaser.CANVAS, 'escenario');
    // Mueve toda la configuración del juego que tenías en 'estadoPrincipal' aquí
    // Resto del código de configuración del juego
    juego.state.add('principal', estadoPrincipal);
    juego.state.start('principal');
}
