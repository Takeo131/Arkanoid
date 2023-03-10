'use strict';

let ctx;

let ball = {
	x:200,
	y:200,
	color:"#FF0000",
	radius:10,
	direction:{x:0, y:0},
	domObject:null,
	animationId:null,
	speed:2,
	top:0,
	bottom:0,
	left:0,
	right:0,
};

let game = {
	domObject:null,
	width:null,
	height:null,
	color:"#DDDDDD",
	gameOver:false,
	start:false,
	pause:false,
	win:false,
};

let paddle ={
	color:"#0000FF",
	width:80,
	height:10,
	x:null,
	y:null,
	speed:10,
	direction:0,
};

let bricks ={
	color:"#0F0F0F",
	width:60,
	height:30,
	row:4,
	column:10,
	padding:18,
}
let brick = [];

let user ={
	life:3,
	score:0,
}

document.addEventListener('DOMContentLoaded',function(){
	game.domObject = document.getElementById('canvas');
	game.width = game.domObject.width;
	game.height = game.domObject.height;
	paddle.x = (game.width/2 - paddle.width/2);
	paddle.y = (game.height - paddle.height);
	ctx = game.domObject.getContext('2d');
	
	initGames();
});

function displayGame(){
	ctx.clearRect(0, 0, game.width, game.height);
	ctx.fillStyle = game.color;
	ctx.fillRect(0, 0, game.width, game.height);
	
	ctx.fillStyle = ball.color;
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fill();
	
	ctx.fillStyle = paddle.color;
	ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
	
	displayBricks();
	
	displayUi();
	
	if (game.gameOver == true){
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.fillStyle = game.color;
		ctx.fillRect(0, 0, game.width, game.height);
		
		ctx.font = '20px sans-serif';
		ctx.fillStyle ='#000';
		ctx.fillText('Game Over', (game.width/2 - ctx.measureText('Game Over').width/2), game.height/2);
		return;
	}
	
	checkWin();
	if (game.win == true){
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.fillStyle = game.color;
		ctx.fillRect(0, 0, game.width, game.height);
		
		ctx.font = '20px sans-serif';
		ctx.fillStyle ='#000';
		ctx.fillText('You Win !', (game.width/2 - ctx.measureText('You Win !').width/2), game.height/2);
		return;
	}
}

function initGames(){
	initPositions();
	initBricks();
	KeyboardEvent();
	ball.animationId = requestAnimationFrame(playGame);
}

function playGame(){
	detectCollisions();
	displayGame();
	ball.animationId = requestAnimationFrame(playGame);
	
	if (game.pause == false){
		paddle.x += (paddle.direction * paddle.speed);
	}
	if (game.start == false){
		ball.x = (paddle.x + (paddle.width / 2));
	}
	if (game.start == true && game.pause == false){
		ball.x += ball.direction.x;
		ball.y += ball.direction.y;
	}
}

function KeyboardEvent()
{
	document.addEventListener('keydown', function(e) {
		if (game.gameOver == false && game.win == false){
			switch(e.key)
    		{
    		    case 'ArrowRight':
    		        if (paddle.x + paddle.width < game.width)
    		        paddle.direction = 1;
    		        break;
    		    case 'ArrowLeft':
    		    	if (paddle.x > 0)
    		    	paddle.direction = -1;
    		    	break;
    		    case ' ':
	    		    if (game.start == false)
	    		    game.start = true;
	    		    else if (game.start == true && game.pause == false)
	    		    game.pause = true;
	    		    else if (game.start == true && game.pause == true)
	    		    game.pause = false;
	    		    break;
    		}
			/* Bonus : paddle dont go away */
    		if(paddle.x + paddle.width > game.width){
    			paddle.x = game.width-paddle.width;
    			paddle.direction = 0;
    		}
    		if(paddle.x < 0){
    			paddle.x = 0;
    			paddle.direction = 0;
    		}
		}
		else{
			if (e.key == ' '){
				initPositions();
				initBricks();
				initUser();
			}
		}
	});
	
	document.addEventListener('keyup', function(){
		paddle.direction = 0;
	});
}

function detectCollisions(){
	ball.top = ball.y - ball.radius;
	ball.bottom = ball.y + ball.radius;
	ball.left = ball.x - ball.radius;
	ball.right = ball.x + ball.radius;
	/* top collision */
	if(ball.top <= 0){
		ball.direction.y *= -1;
	}
	/* border collision */
	else if (ball.left <= 0 || ball.right >= game.width){
		ball.direction.x *= -1;
	}
	/* bottom collision */
	else if (ball.bottom >= game.height){
		ball.direction.y = 0;
		game.start = false;
		if (user.life == 1){
			game.gameOver = true;
		}
		else{
			user.life -= 1;
			initPositions();
		}
	}
	/* paddle collision */
	else if((paddle.x + paddle.width) >= ball.left && ball.right >= paddle.x && ball.bottom >= paddle.y){
		if (ball.right >= paddle.x && ball.x < (paddle.x + paddle.width*(1/3))){
			ball.direction.y *= -1;
			ball.direction.x = -ball.speed;
		}
		else if (ball.x >= (paddle.x + paddle.width*(1/3)) && ball.x <= (paddle.x + paddle.width*(2/3))){
			ball.direction.y *= -1;
			ball.direction.x = 0;
		}
		else if (ball.x > (paddle.x + paddle.width*(2/3)) && ball.left <= (paddle.x + paddle.width)){
			ball.direction.y *= -1;
			ball.direction.x = ball.speed;
		}
	}

	else {
		brickCollision();
	}
}

function initPositions(){
	game.start = false;
	game.pause = false;
	game.gameOver = false;
	game.win = false;
	
	paddle.x = (game.width/2 - paddle.width/2);
	paddle.y = (game.height - paddle.height);
	
	ball.x = (paddle.x + (paddle.width / 2));
	ball.y = (paddle.y - ball.radius - 1);
	
	ball.direction.x = 0;
	ball.direction.y = -ball.speed;
}

function initBricks(){
	for (let r = 0; r < bricks.row; r++){
		brick[r] = [];
		for (let c = 0; c < bricks.column; c++){
			brick[r][c] = {x:0, y:0, display:true};
		}
	}
}

function displayBricks(){
	let x = bricks.padding;
	let y = bricks.padding;
	
	for (let r = 0; r < bricks.row; r++){
		for (let c = 0; c < bricks.column; c++){
			if(brick[r][c].display == true){
				brick[r][c].x = x;
				brick[r][c].y = y;
				ctx.fillStyle = bricks.color;
				ctx.fillRect(brick[r][c].x, brick[r][c].y, bricks.width, bricks.height);
			}
			x += (bricks.width + bricks.padding);
		}
		x = bricks.padding;
		y += (bricks.height + bricks.padding);
	}
}

function brickCollision(){
	for (let r = 0; r < bricks.row; r++){
		for (let c = 0; c < bricks.column; c++){
			if (brick[r][c].display == true){
				let startX = brick[r][c].x;
				let endX = brick[r][c].x + bricks.width;
				let startY = brick[r][c].y;
				let endY = brick[r][c].y + bricks.height;
				
				if (ball.right >= startX && ball.left <= endX && ball.bottom >= startY && ball.top <= endY){
					brick[r][c].display = false;
					user.score += 1;
					if (ball.bottom >= startY && ball.right > startX && ball.left < endX){
						ball.direction.y *= -1;
					}
					else if (ball.top <= endY && ball.right > startX && ball.left < endX){
						ball.direction.y *= -1;
					}
					else if (ball.right >= startX || ball.left <= endX){
						ball.direction.x *= -1;
					}
				}
			}
		}
	}
}

function displayUi(){
	ctx.font = '20px sans-serif';
	ctx.fillStyle ='#000';
	ctx.fillText('Score : '+ user.score, 10, game.height - 10, 200);
	
	ctx.font = '20px sans-serif';
	ctx.fillStyle ='#000';
	ctx.fillText('Life : '+ user.life, game.width - 75, game.height - 10, 75);
}

function initUser(){
	user.life = 3;
	user.score = 0;
}

function checkWin(){
	let result = true;
	for (let r = 0; r < bricks.row; r++){
		for (let c = 0; c < bricks.column; c++){
			if (brick[r][c].display == true){
				result = false;
			}
		}
	}
	if (result == true){
		game.win = true;
	}
}