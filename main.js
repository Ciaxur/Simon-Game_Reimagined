/*
	Made By: Omar Omar
	Last Modified: August 26

	Known Bugs:
		1. If you spam buttons on random, SOMETIMES the game will crash
    	2. When not in full-screen, game will look funky
*/

/* Global Variables */

var colors = ['#879eb0', '#445c6d', '#afd79f', '#f6b49e', '#eec0c0', '#93bddd', '#c471ff', '#a395ff', '#c93030', '#843645', '#d38c67'];
var btnStatus = 0;							// 0: Game is OFF  |   1: Game is ON

var tl = new TimelineLite();				// Timeline object from GreenSock for Playing animation
var timer = 0;								// Stores timer for settimeout

// Sound effects
var soundEffects = [];		// Define an array
soundEffects[0] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
soundEffects[1] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
soundEffects[2] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
soundEffects[3] = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');

// Game Variables
var patternMoves 	= [];						// Stores the index of the cloud in which the pattern was set
var playerMoves 	= [];						// Stores the index of the cloud in which the PLAYER clicked
var patternSound	= [];						// Stores the index of the soundEffect in parallel to patternMoves
var scoreCount		= 0;						// Keeps count of score
var strictModeStatus= 0;						// Keeps status of strict mode

/* On Page Load */

$(document).ready(function()
{
	/* Startup Animations */
	var clouds 				= $('#Clouds-Looks');
	var stars 				= $('#Stars');
	var clickableClouds 	= $('#Clickable-Clouds');
	var button 				= $('.btn');
	var score				= $('.score');
	var strictModeSwitch	= $('.switch input');

	var tlm 				= new TimelineMax();


	/* Cloud Animations */
	{
		TweenMax.from(clouds, 2, {y:-15, opacity:0});
		TweenMax.from(stars, 5, {y:-5, opacity:0});

		TweenMax.from(button, 1, {y:-35, opacity:0});
		TweenMax.from(score, 1, {y:-30, opacity:0, delay:1});

		TweenMax.from(clickableClouds, 1, {y:-30, opacity:0, delay:1, 
			onComplete:function()
			{ 
				button.prop('disabled', false) 		// After all has loaded, unlock the Start Game button
			}
		});


		tlm.to(clouds, 4, {y:2, x:5, delay:1})		// Clouds move side to side
		   .to(clouds, 4, 
		   	{
		   		ease: Power1.easeInOut,
		   		y:-2, 
		   		x:-5, 
		   		delay:2, 
		   		yoyo:true, 
		   		repeat:-1
		   	});

		tlm.to(clickableClouds, 4, {y:2, x:5, delay:1.5})
		   .to(clickableClouds, 4, 
		   	{
		   		ease: Power1.easeInOut,
		   		y:-2, 
		   		x:-5, 
		   		delay:2, 
		   		yoyo:true, 
		   		repeat:-1
		   	});
	}

	/* Strict Mode Switch Animation */
	TweenMax.fromTo($('.strictMode'), 1, { opacity:0, y:-50 }, { opacity:1, y:0 });

	/* Function Calls */
	disableClouds();							// When game starts, disable clouds

	/* Click functions */
	button.click(function()
	{
		buttonFunctions();						// Call button Functions
	});

	$($('#Stars').children()[26]).click(function() { displayEasterEgg(); });

	strictModeSwitch.click(function() { strictMode(this.checked); });

	/* Debugging */
	// score.click(function() { addScore(1); } );
});


/* Game Functions */

function buttonFunctions()
{
	var clickableClouds 	= $('#Clickable-Clouds');
	var button 				= $('.btn');
	var score				= $('.score');
	var strictModeSwitch	= $('.switch input');

	button.prop('disabled', true);		// Disable button


	if(!btnStatus)							// When game is OFF
	{
		strictModeSwitch.prop('disabled', true);	// Disable Strict Switch

		showClouds(clickableClouds);		// Show clouds
		btnStatus = 1;						// Set game to ON
		setNewMove(clickableClouds);		// Set a new Move

		button.html('End Game');			// Set HTML text
		score.html('- 00 -');
	}

	else 									// When game is ON
	{
		resetValues();
		resetClouds(clickableClouds);		// Reset Cloud Colors
		disableClouds();
	}


	setTimeout(function() { button.prop('disabled', false); }, 2000);
}

function showClouds(clouds)
{
	TweenMax.to(clouds, 0.5, {y:-15, opacity:0.5, onComplete:setCloudColors(clouds)});	// Animate and set colors
	TweenMax.to(clouds, 1.5, {y:0, opacity:1, delay:0.5});
}

function setCloudColors(clouds)
{
	colors = shuffle(colors);					// Shuffle the colors


	clouds.children().each(function(index, el) 
	{
		$(el).css('fill', colors[index]);		// Assign 'random' colors to clouds
	});
}

function resetClouds(clouds)
{
	// Reset Clouds Colors
	clouds.children().each(function(index, el)
	{
		TweenMax.to(el, 1, { fill:'#999999', delay:0.5,});
	});
}

function resetValues()
{
	btnStatus 		= 0;				// Set game to OFF
	scoreCount	 	= 0;				// Reset score counter
	timer			= 0;				// Reset timer
	patternMoves 	= [];				// Reset all moves
	patternSound 	= [];				// Reset all sound
	playerMoves  	= [];				// Reset all player moves


	tl.stop();							// Stop Cloud playPattern animation
	disableClouds();
	$('.switch input').prop('disabled', false);	// Enable Strict Switch

	$('.btn').html('Start Game');		// Set HTML text
	$('.score').html('- -');			// Reset Score HTML
}

function setNewMove(clouds)						// Sets a new move to click
{
	patternMoves.push(getRandomNum(0, clouds.children().length-1));	// Sets a random number into the Pattern Moves
	patternSound.push(getRandomNum(0, soundEffects.length-1));		// Sets a random number into the Pattern Sound

	playPattern(clouds);											// Play the patten
}

function playPattern(clouds)
{
	var soundIndex = 0;							// Keeps track of the Index position of the sound array
	tl.play();									// Play animation

	$('.btn').off('click');						// Disable Buttons


	for(var x=0; x<patternMoves.length; x++)	// Loop through all the pattern INDEXES
	{
		clouds.children()[patternMoves[x]];


		if(!patternMoves[x].toString().replace(/[02456]/, ''))							// Check if the cloud is at the bottom | move up
		{																				// Play the sound effect of the pattern
			tl.to(clouds.children()[patternMoves[x]], 0.8, 
				{
					y:-30, 
					delay:1.5,
					scale:1.1,
					onComplete:function() { soundEffects[patternSound[soundIndex]].play(); soundIndex++; },
				})

			  .to(clouds.children()[patternMoves[x]], 0.5, { y:0, scale:1, delay:0.8 });
		}

		else
		{
			tl.to(clouds.children()[patternMoves[x]], 0.8, 								// Move down
				{
					y:30, 
					delay:1.5,
					scale:1.1,
					onComplete:function() { soundEffects[patternSound[soundIndex]].play(); soundIndex++;  }
					})

			  .to(clouds.children()[patternMoves[x]], 0.5, { y:0, scale:1, delay:0.8 });
		}
	}

	soundIndex = 0;								// Reset soundIndex back to 0


	timer += 3.5;								// Add seconds to timer to 'offset' timout
	setTimeout(enableClouds, ((timer * 1000)));	// After animation is done, enable clouds

	setTimeout(function() { $('.btn').on('click', buttonFunctions) }, ((timer * 1000)));	// After animation is done, enable buttons
}

function checkPattern(cloudClicked)
{
	// Animate clouds to go back to thier original spot
	TweenMax.to(cloudClicked, 0.5, { y:0 });

	playerMoves.push(cloudClicked.index());		// Add player's cloud click index

	soundEffects[patternSound[playerMoves.length-1]].play();

	for(var x=0; x<playerMoves.length; x++)		// CHeck if move was the same as the pattern
	{
		if(patternMoves[x] != playerMoves[x])
		{
			disableClouds();
			playerStatus('Lose');
			return 'Game Over!';
		}
	}

	if(patternMoves.length == playerMoves.length)	// When all patterns answered
		{	
			disableClouds();						// Disable clouds

			if(addScore(1))							// Add onto Score
				return 'Game Over!';				// If addScore Returns a value, end game

			setNewMove($('#Clickable-Clouds'));		// Set a new Move

			playerMoves = [];						// Reset PlayerMoves
		}
}

function disableClouds()
{
	var clouds = $('.st2');

	clouds.css('cursor', 'default');
	clouds.off('click');
	clouds.off('mouseenter');
	clouds.off('mouseleave');
}

function enableClouds()
{
	var clouds = $('.st2');

	/* Cloud Styles */
	clouds.css('cursor', 'pointer');
	clouds.on('click', function() { checkPattern($(this)); });

	/* Cloud Hover Animation */
	clouds.on('mouseenter', function() 	
				{ 
					if(!$(this).index().toString().replace(/[02456]/, ''))	// Bottom Clouds
						TweenMax.to($(this), 1, {scale:1.2, y:-35});

					else
						TweenMax.to($(this), 1, {scale:1.2});

				})


			 .on('mouseleave', function()  	
			 	{ 
			 		if(!$(this).index().toString().replace(/[02456]/, ''))
			 			TweenMax.to($(this), 1, {scale:1, y:0}); 

			 		else
			 			TweenMax.to($(this), 1, {scale:1}); 
			 	});
}

function playerStatus(gameStatus)
{
	var lossTL 				= new TimelineMax;

	var clouds 				= $('#Clickable-Clouds');
	var button 				= $('.btn');
	var score				= $('.score');
	var status 				= $('.status');


	/* Assign win or loss */
	if(gameStatus == 'Lose')
		status.html('You Lost!');
	else
		status.html('You Win!');


	button.prop('disabled', true);						// Disable Button

	/* Cloud Popcorn-style animation */
	clouds.children().each(function(index, el)
	{
		if(!index.toString().replace(/[02456]/, ''))	// Bottom cloud animations
			lossTL.to(el, 0.1, { y:-50, scale:1.1});

		else
			lossTL.to(el, 0.1, { y:50, scale:1.1});
	});


	/* Play LOSS Sound 3x */
	for(var x=0; x<3; x++)
		setTimeout(function() {soundEffects[3].play();}, 572*x);

	setTimeout(function() { lossTL.reverse(); }, ((lossTL._duration * 1000) + 1000));


	if(strictModeStatus || scoreCount == 20)				// If strict mode status was OFF
	{
		/* Score Blinking Then Resetting Values */
		TweenMax.fromTo(score, 0.5, { opacity:0.2 }, 
			{ 
				opacity: 1, 
				repeat:7, 
				onComplete:function()
				{
					resetClouds(clouds);					// Reset Cloud Colors
					resetValues();
				}
			});

		/* Show status and Blink */
		TweenMax.fromTo(status, 0.5, { opacity:0},
		{
			opacity: 1,
			repeat: 7,
			onComplete:function()
			{
				TweenMax.to(status, 0.5, {opacity:0});
			}
		});
	}

	else
	{
		setTimeout(function() { playPattern(clouds); }, ((lossTL._duration * 1000) + 1500));
		playerMoves = [];
	}




	setTimeout(function() { button.prop('disabled', false); }, 7000);		// Enable button after x seconds
}

function addScore(n)							// Adds n to score
{
	var score = $('.score');

	scoreCount += n;

	if(scoreCount >= 10)
		score.html('- '+ scoreCount +' -');
	else
		score.html('- 0'+ scoreCount +' -');


	/* Check if Player reached 20 Score */
	if(scoreCount == 20)
	{
		playerStatus('Win');
		return 'Game Over!';
	}
}

function strictMode(status)
{
	var skyColor = $('.st0');					// SVG Sky Color
	var clouds   = $('.st1');					// NOn-Clickable clouds

	if(status)
	{
		// Animation to change background color
		TweenMax.to(skyColor, 1, { ease:Power1.easeInOut, fill:'#0F1320' });

		// Animation to change cloud color
		TweenMax.to(clouds, 1, { ease:Power1.easeInOut, fill:'#979595' });

		// Set Body's BG to change
		$('body').css('background-color', '#0F1320');
	}

	else
	{
		TweenMax.to(skyColor, 1, { ease:Power1.easeInOut, fill:'#131829' });
		TweenMax.to(clouds, 1, { ease:Power1.easeInOut, fill:'#D8D6D5' });

		$('body').css('background-color', '#131829');
	}


	strictModeStatus = status;					// Set status
}

function displayEasterEgg()
{
	var tl = new TimelineMax();
	var easterEgg = $('.easteregg');
	var THESTAR = $($('#Stars').children()[26]);

	console.log('Pickle RIIICK!!');				// Display this in CONSOLE

	/* Display HIM */
	tl 	.fromTo(easterEgg, 1, { opacity:0.9, x:-250, y:100 }, { ease:Power1.easeInOut, opacity:1, x:-100, y:100 })

		.to(easterEgg, 1, { ease:Power1.easeInOut, opacity:0.9, x:-250, delay:1, onStart:function()
			{
				THESTAR.css('display', 'none');
			}});
}


/* Useful Functions */

function shuffle(array) 						// Shuffles array
{
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomNum(min, max)					// Returns a random number between min and max
{
	return Math.round(Math.random() * (max - min) + min);
}