// checkers by dave hemmer

//   spotID = id of spot div;   = r#c# format  ex:  r4c5
//   gpID   = id of game-piece img;  = gp[B|W]<xy>[K]  ex:  gpB45K, blck on 45 king


$(function() {

	$('#accordion').accordion({
		collapsible: true,
		heightStyle: "fill",
		active: 0
	});


	// disable select so works on mobile
	// document.querySelector('body').onselectstart = function(){ return false };

	var currentBoardPlayers = [];  // xy arr's row by col; start = 'init setup'
									// values: B, W, BK, WK
	var currentBoardMovable = [];
	var currentPlayer = 'B';
   	var currentOpponent = currentPlayer==='B' ? 'W' : 'B';
	var currentDirection = '';  // '+' Down the board, '-' Up, 'K' King Up or Down, '' not set
 	var currentAvailableMoves = [];
 	var jumpingPieceXY = '';
 	var gameOver = false;

	var initStartBoard = function() {
		var startBoard = []; 
    	var player = '';
	 	for (var row = 0; row < 8; row++) {
	 		startBoard[row] = [];
	 		currentBoardMovable[row] = [];
	 		currentAvailableMoves[row] = [];
	 		for (var col = 0; col < 8; col++) {
	 			if (row<3 && ((row+col)%2===0)) {
	 				player = 'B';
	 			} else if (row>4 && ((row+col)%2===0)) {
	 				player = 'W';
	 			} else {
	 				player = '';
	 			}
	 			startBoard[row][col] = player;
	 			currentAvailableMoves[row][col] = '';
	 			currentBoardMovable[row][col] = false;
	 		}
	 	}
	 	return startBoard;
	 };


// CONVERSION UTILITES
    // var gpIDtoSpotID = function(gpID) {
    // 	return "r" + gpID[3] + "c" + gpID[4];
    // };
    var gpIDtoPlayer = function(gpID) {
    	// console.log('gpIDtoPlayer',gpID);
    	var player = gpID[2];
    	if (gpID.length>5) {
    		player += "K";
    	}
    	return player;
    };
    var gpIDtoXY = function(gpID) {
    	return gpID[3] + gpID[4]
    };
    var isKing = function(row,col) {
    	// console.log('isKing',currentBoardPlayers[row][col]);
    	return (currentBoardPlayers[row][col][1]==='K');
    };
    var setDirection = function(row,col) {
    	if (isKing(row,col)) {
    		return 'K';
    	} else if (currentBoardPlayers[row][col][0]==="B") {
    		return '+';
    	} else {
    		return '-';
    	}
    };
    var spotXY = function(spotID) {
    	if (/r[0-7]c[0-7]/.test(spotID)) {
    		return spotID[1]+spotID[3];   //  return xy in string	
    	} else {
    		return 'offBoard'
    	}
    	
    };

    var xyToSpotID = function(xy) {
    	return 'r' + xy[0] + 'c' + xy[1];  // xy in string > spotID
    };
    var ob = function(num,dir) {
    	var obFlag = false;
    	if (num===0 && dir==='-') {obFlag=true;}
    	if (num===7 && dir==='+') {obFlag=true;}
    	return obFlag;
    };

    var whoseSpot = function(xy) {
    	// console.log('whoseSpot! xy',xy); only return B || W
    	var boardPlayer = currentBoardPlayers[parseInt(xy[0])][parseInt(xy[1])];
    	if (boardPlayer.length>1) {
    		boardPlayer = boardPlayer[0];
    	}
    	return boardPlayer;
    	// return currentBoardPlayers[parseInt(xy[0])][parseInt(xy[1])];
    };

    var setAdjSpots =  function(row,col) {
    	// take num row/col returns  array[] of adjSpots incl. JumpSpots
    	var originXY = row.toString() + col.toString();
    	var adjSpots = [];  // array of xy str elements ['51','53']
    	switch (currentDirection) {
    		case '':
    			break;
			case '+':    // black
				if (!ob(row,'+') && !ob(col,'+')) {adjSpots.push((row + 1).toString() + (col + 1).toString())};
				if (!ob(row,'+') && !ob(col,'-')) {adjSpots.push((row + 1).toString() + (col - 1).toString())};
				break;
			case '-':     // white
				if (!ob(row,'-') && !ob(col,'+')) {adjSpots.push((row - 1).toString() + (col + 1).toString())};
				if (!ob(row,'-') && !ob(col,'-')) {adjSpots.push((row - 1).toString() + (col - 1).toString())};
				break;
			case 'K':
				if (!ob(row,'+') && !ob(col,'+')) {adjSpots.push((row + 1).toString() + (col + 1).toString())};
				if (!ob(row,'+') && !ob(col,'-')) {adjSpots.push((row + 1).toString() + (col - 1).toString())};
				if (!ob(row,'-') && !ob(col,'+')) {adjSpots.push((row - 1).toString() + (col + 1).toString())};
				if (!ob(row,'-') && !ob(col,'-')) {adjSpots.push((row - 1).toString() + (col - 1).toString())};
				break;
    	}


    	// console.log('PRE-checkOffBoard: adjSpots',adjSpots,row,col,currentDirection);

    	var temp = adjSpots.map(checkOffBoard);
    	adjSpots = temp;

    	// console.log('PRE-JUMP: adjSpots',adjSpots);

     	// check for JUMP possibilites here
     	var jumpSpots = [];
     	var jumpSpot = '';
     	var spot = '';
     	for (var i=0;i<adjSpots.length;i++) {
     		jumpSpot='';
     		spot = checkOffBoard(adjSpots[i]);
     		if (spot !=='' && spot !== 'offBoard') {
     			if (whoseSpot(spot)===currentOpponent) {
     				jumpSpot = jumpSpotXY(originXY,spot);
     			}
     		}
     		if (jumpSpot !=='' && checkOffBoard(jumpSpot) !== 'offBoard' && whoseSpot(jumpSpot) === '')  {
     			jumpSpots.push(jumpSpot);
     		}
     	}
     	// END OF JUMP LOGIC
     	if (jumpSpots) {
     		adjSpots = adjSpots.concat(jumpSpots);
     	}
    	temp = adjSpots.map(checkOffBoard);
    	adjSpots = temp;

    	// console.log('POST Jump: adjSpots,row,col,dir',adjSpots,row,col,currentPlayer)
    	return adjSpots;
    };

    var checkOffBoard = function(spot) {
    	var rtnVal='';
    	var d1 = parseInt(spot[0]);
    	var d2 = parseInt(spot[1]);
    	if (!(isNaN(spot)) && d1 >= 0 && d1 <= 7 && d2 >= 0 && d2 <= 7) {
		// if ((spot.lenghth>2||spot[0]<'0'||spot'7')||spot[1]<'0'||spot[1]>'7') {
			rtnVal = spot;
		} else {
			rtnVal = 'offBoard';
		}
		// console.log('checkOffBoard',rtnVal);
		return rtnVal;
	};

    var jumpSpotXY = function(originXY,targetXY) {
    	// returns spot between originXY & target in XY fmt
    	var jumpX = targetXY[0]<originXY[0] ? parseInt(targetXY[0])-1 : parseInt(targetXY[0])+1;
    	var jumpY = targetXY[[1]]<originXY[1] ? parseInt(targetXY[1])-1 : parseInt(targetXY[1])+1;
   		return jumpX.toString() + jumpY.toString();
    };

    var distanceBetween = function(spotA,spotB) {
    	var rdist = Math.abs(parseInt(spotA[0])-parseInt(spotB[0]));
    	// var cdist = Math.abs(parseInt(spotA[1])-parseInt(spotB[1]));
    	// return (rdist>cdist) ? rdist : cdist;
    	return rdist;
    };

    var spotBetweenXY = function(spotA,spotB) {
    	var ar = parseInt(spotA[0]);
    	var ac = parseInt(spotA[1]);
    	var br = parseInt(spotB[0]);
    	var bc = parseInt(spotB[1]);
    	var r = ar > br ? ar-1 : br-1;
    	var c = ac > bc ? ac-1 : bc-1;
    	return r.toString() + c.toString();
    }

	var pieceIsMovable = function(row,col) {
		var movable = false;
		var moves = [];
		currentDirection = setDirection(parseInt(row),parseInt(col));
		var adjSpots = setAdjSpots(row,col);
		// console.log('back from setAdjSpots',adjSpots,row,col);
		for (var i = 0;i < adjSpots.length;i++) {
			var adjSpot = adjSpots[i].toString();
			if (adjSpot !== 'offBoard') {
				if (currentBoardPlayers[adjSpot[0]][adjSpot[1]]==='') {
					movable = true;
					moves.push(adjSpots[i]);
				}
			}
		}
		currentAvailableMoves[row][col] = moves;
		return movable;
	};

	 var setBoardMovable = function() {
	 	currentBoardMovable = [];
	 	currentAvailableMoves = [];

	 	var jr = '';
	 	var jc = '';
	 	if (jumpingPieceXY !== '') {
	 		jr = parseInt(jumpingPieceXY[0]);
	 		jc = parseInt(jumpingPieceXY[1]);
	 	}
	 	var gp = '';
 		for (var row = 0; row < 8; row++) {
	 		currentBoardMovable[row] = [];
	 		currentAvailableMoves[row] = [];
	 		for (var col = 0; col < 8; col++) {
	 			// if jumpingPieceXY exists > only make that piece movable
	 			if (jumpingPieceXY !=='') {
	 				if (row===jr && col===jc) {
	 					currentBoardMovable[row][col] = pieceIsMovable(row,col);	
	 				}
	 			} else {
	 				gp = currentBoardPlayers[row][col];
		 			if (gp !== '' && gp[0]===currentPlayer) {
		 				currentBoardMovable[row][col] = pieceIsMovable(row,col);
		 			}
	 			}
	 		}
	 	}
	 };

	 var displayBoard = function() {
	 	// console.log(currentBoardPlayers[0][2]);
	 	// clear class on game-spots
	 	for (var row = 0;row < 8;row++) {
	 		for(var col = 0;col <8;col++) {
 				$('#r'+row+'c'+col).removeClass('movable good-move');
 			}
 		}
 		// set game piece images && chk for game-spot class(movable,good-move)
	 	for (var row = 0;row < 8;row++) {
	 		for(var col = 0;col <8;col++) {
	 			var spotID = xyToSpotID(row.toString() + col.toString());
	 			// console.log(row.toString() + col.toString());
	 			switch (currentBoardPlayers[row][col]) {
	 				case '':
	 					$('#'+spotID).find('img').remove();
	 					break;
 					case 'B':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbB'+row+col+'" class="game-piece draggable" src="black.png" width="50">');
	 					break;
 					case 'W':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbW'+row+col+'" class="game-piece draggable" src="white.png" width="50">');
	 					break;
 					case 'BK':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbB'+row+col+'K" class="game-piece draggable" src="black-king.png" width="50">');
	 					break;
 					case 'WK':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbW'+row+col+'K" class="game-piece draggable" src="white-king.png" width="50">');
	 					break;
	 			}
	 			// set game-spot class for cursor control
	 			if (typeof currentBoardMovable[row][col] !=='undefined' && currentBoardMovable[row][col]===true) {
	 				$('#r'+row+'c'+col).addClass('movable');
	 				var temp = currentAvailableMoves[row][col].forEach(function(spot) {
	 					$('#r'+spot[0]+'c'+spot[1]).addClass('good-move');
	 				});
	 			}
	 		};
	 	};
	 };

	var playerName = function(player) {
		if (currentPlayer==='B') {
			return 'Black';
		} else {
			return 'Gold';
		}
	};

	var switchPlayer = function() {
		currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
    	currentOpponent = currentPlayer === 'B' ? 'W' : 'B';
    	var player = currentPlayer === 'B' ? 'Black' : 'Gold';
		console.log(player + "'s Move");
		var result = updateBlog('game-blog','>>> '+playerName(player) + "'s Move");
	};

	var pieceCount = function(player) {
		var pCnt = 0;
		for (var row=0;row<8;row++) {
			for (var col=0;col<8;col++) {
				if (currentBoardPlayers[row][col][0]===player) {
					pCnt += 1;
				}
			}
		}
		return pCnt;
	};

	var availableMoveCount = function() {
		// console.log('availableMoveCount');

		var mCnt = 0;
		for (var row=0;row<8;row++) {
			for (var col=0;col<8;col++) {
				if (typeof currentAvailableMoves[row][col] !== 'undefined') {
					mCnt += currentAvailableMoves[row][col].length;
				}
			}
		}
		console.log('You have',mCnt,'moves available');
		var result = updateBlog('game-blog',playerName(currentPlayer)+' has '+mCnt+' moves available');
		return mCnt;
	};

	var updateBlog = function(blog,msg) {
		$('#'+blog).prepend('<li>'+msg+'</li>');
		return true;
	}

	var gameOverAct = function() {
		console.log('gameOverAct');
      	for (var t=0;t<1;t++) {
      		$('#game-board').toggle('explode');	
      	}
      	// interact with player here
      	// reset board & state
		currentBoardPlayers = [];  // xy arr's row by col; start = 'init setup'
										// values: B, W, BK, WK
		currentBoardMovable = [];
		currentPlayer = 'B';
	   	currentOpponent = currentPlayer==='B' ? 'W' : 'B';
		currentDirection = '';  // '+' Down the board, '-' Up, 'K' King Up or Down, '' not set
	 	currentAvailableMoves = [];
	 	jumpingPieceXY = '';
	 	gameOver = false;

  	 	currentBoardPlayers = initStartBoard();
	 	setBoardMovable();
	 	displayBoard();
	 	return true;
	};

// 
// MAINLINE
// 
 	currentBoardPlayers = initStartBoard();
 	// console.log('players',currentBoardPlayers);
 	setBoardMovable();
 	// console.log('movable',currentBoardMovable);
 	displayBoard();


 	$('#do-button').on('click', function(e) {

 		var buttonText = $('#do-button').html();
 		
 		// SURRENDER
 		if (buttonText==='surrender?') {
 			gameOver = true;
 			var result = gameOverAct();
 		}


 		// START GAME 
 		if (buttonText==='Start Game') {
			console.log('<<< Game Started >>>');
			var result = updateBlog('game-blog','<<< Game Started >>>');
		 	console.log("Black's Move!");
			var result = updateBlog('game-blog',">>> Black's Move");
	 		$('#do-button').html('now playing');
	 		$('#do-button').switchClass("ribbon","arrow");
 		}
	
 
	    $( ".game-spot" ).on('mouseenter','.game-piece', function(){
	    	$('.game-piece').draggable({
		    	containment: "#game-board", scroll: false, grid: [ 70, 70 ]
	    	});
	    });

	    $( ".game-spot" ).droppable({
	      drop: function( event, ui ) {
	      	// update currentBoardPlayers
			var gpID = event.toElement.id;			// gbID
			var originXY = gpIDtoXY(gpID);  				// gpID as XY
			var spotID = event.target.id;			// target spot id
			var targetXY = spotXY(spotID);
	      	console.log("drop: toElement.id, in(XY), target.id", gpID,originXY,spotID);  
			var result = updateBlog('game-blog',playerName(gpID[2])+' has moved from spot '+originXY+' to spot '+targetXY);
	      	if (currentBoardMovable[gpID[3]][gpID[4]] && currentPlayer===gpID[2]) {
	      		if (currentAvailableMoves[gpID[3]][gpID[4]].indexOf(targetXY)>-1) {
	      			// kingMe??
	      			var kingMe = '';
	      			if (gpID[5] !=='K' && currentPlayer==='B' && parseInt(targetXY[0])===7) {
	      				kingMe = 'K';
	      			}
	      			if (gpID[5] !=='K' && currentPlayer==='W' && parseInt(targetXY[0])===0) {
	      				kingMe = 'K';
	      			}
	      			if (kingMe !== '') {
	      				console.log('KING ME!');
						var result = updateBlog('game-blog','!!! KING ME !!!');
	      			}
	      			// reset jumpingPieceXY
			      	if (jumpingPieceXY !=='') {
			      		jumpingPieceXY = '';
			      	}
	      			// check for jump here; if so; 1) pick-up jumped piece; 
	    			// 2) if another.jumpAvailable DO> same.player, only.that.piece
	    		    //   provide for stop-turn-buton?
	    		    // console.log('distanceBetween',distanceBetween(originXY,targetXY));
	    		    if (distanceBetween(originXY,targetXY)===2) {
	    		    	// jump
	    		    	console.log('JUMP,JUMP,JUMP');
						var result = updateBlog('game-blog','JUMP !!!');
	    		    	var xy = '';
	    		    	var captureXY = spotBetweenXY(originXY,targetXY);
	    		    	// console.log('spotBetweenXY',spot);
	    		    	xy = originXY;
	    		    	currentBoardPlayers[xy[0]][xy[1]] = '';   // clear origin
				      	currentBoardMovable[xy[0]][xy[1]] = '';
				      	currentAvailableMoves[xy[0]][xy[1]] = '';
				      	xy = captureXY;
	    		    	currentBoardPlayers[xy[0]][xy[1]] = '';   // capture piece	
				      	currentBoardMovable[xy[0]][xy[1]] = '';
				      	currentAvailableMoves[xy[0]][xy[1]] = '';
				      	xy = spotXY(spotID);
				      	currentBoardPlayers[xy[0]][xy[1]] = gpIDtoPlayer(gpID)+kingMe; // set new spot

				      	// WIN ???
				      	var oCnt = pieceCount(currentOpponent);
				      	console.log('currentOpponent, oCnt',currentOpponent,oCnt);
						var result = updateBlog('game-blog','Player '+playerName(currentOpponent)+' has '+oCnt+' pieces left.');
				      	if (oCnt===0) {
				      		// GAME OVER
				      		gameOver = true;
				      		console.log('GAME OVER !!!',currentPlayer,'has won!');
							var result = updateBlog('game-blog','>>> GAME OVER <<<');
							var result = updateBlog('game-blog',playerName(currentPlayer)+' has won!');
				      	}
				      	if (!gameOver) {
					      	// see if another jump available
					      	var jumpAvailable = false;
					      	var adjSpots = setAdjSpots(parseInt(xy[0]),parseInt(xy[1]));
					      	for (var i=0;i<adjSpots.length;i++) {
					      	    if (distanceBetween(xy,adjSpots[i])===2) {
					      	    	jumpAvailable = true;
					      	    }
					      	}
					      	if (!jumpAvailable) {
					      		switchPlayer();
					      	} else {
					      		console.log('DOUBLE JUMP TIME!!!');
								var result = updateBlog('game-blog','DOUBLE JUMP TIME !!!');
					      		jumpingPieceXY = targetXY;
					      	}
					      	if (oCnt<12) {
					      		$('#do-button').html('surrender?');
		      			 		$('#do-button').switchClass("arrow","diamond");
					      	}
					      }   // gameOver?
	    		    } else {
				      	xy = originXY;
				      	currentBoardPlayers[xy[0]][xy[1]] = '';   // clear orig spot
				      	currentBoardMovable[xy[0]][xy[1]] = '';
				      	currentAvailableMoves[xy[0]][xy[1]] = '';
				      	xy = spotXY(spotID);
				      	currentBoardPlayers[xy[0]][xy[1]] = gpIDtoPlayer(gpID)+kingMe; // set new spot
				      	switchPlayer();
				    	}
	      		}
		    } else {
		    	console.log('Invalid Move');
				var result = updateBlog('game-blog','>>>invalid move<<<');
		    }
	      	// console.log('DROP: player',gpIDtoPlayer(gpID));
	      	setBoardMovable();
	      	displayBoard();
	      	// check for stymied
	      	if (availableMoveCount()===0) {
	      		gameOver = true;
	      		console.log('GAME OVER !!! currentPlayer: ',currentPlayer,'STYMIED!!');
				var result = updateBlog('game-blog','!!! GAME OVER !!!');
				var result = updateBlog('game-blog', playerName(currentPlayer)+' STYMIED!!');
	      	}
	      	// console.log('DROP: new board:',currentBoardPlayers);
	      	// console.log('DROP: new board movable:',currentBoardMovable);
	      	// console.log('DROP: currentAvailableMoves',currentAvailableMoves);
			// $(".game-piece").draggable('enable');
		      if (gameOver) {
		      	var result = gameOverAct();
		      }
	      }  // end of DROP:
	    });
		// END OF game-spot:DROP

 	});
 	// END OF START GAME





});
// end of page load