// checkers by dave hemmer

//   spotID = id of spot div;   = r#c# format  ex:  r4c5
//   gpID   = id of game-piece img;  = gp[B|W]<xy>[K]  ex:  gpB45K, blck on 45 king


$(function() {

	var currentBoardPlayers = [];  // xy arr's row by col; start = 'init setup'
									// values: B, W, BK, WK
	var currentBoardMovable = [];
	var currentPlayer = 'B';
   	var currentOpponent = currentPlayer==='B' ? 'W' : 'B';
	var currentDirection = '';  // '+' Down the board, '-' Up, 'K' King Up or Down, '' not set
 	var currentAvailableMoves = [];
 	var jumpingPieceXY = '';

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
    	} else if (currentBoardPlayers[row][col]==="B") {
    		return '+';
    	} else {
    		return '-';
    	}
    };
    var spotXY = function(spotID) {
    	return spotID[1]+spotID[3];   //  return xy in string
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
    // var xyToGpID = function(xy,player) {
    // 	var king = '';
    // 	if (player.length > 1) {
    // 		king = 'K';
    // 	}
    // 	return 'gp' + player + xy + king;
    // };

    var whoseSpot = function(xy) {
    	console.log('whoseSpot! xy',xy);
    	if (xy)
    	return currentBoardPlayers[parseInt(xy[0])][parseInt(xy[1])];
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
    	if (d1 >= 0 && d1 <= 7 && d2 >= 0 && d2 <= 7) {
		// if ((spot.lenghth>2||spot[0]<'0'||spot'7')||spot[1]<'0'||spot[1]>'7') {
			rtnVal = spot;
		} else {
			rtnVal = 'offBoard';
		}
		console.log('checkOffBoard',rtnVal);
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
    	var cdist = Math.abs(parseInt(spotA[1])-parseInt(spotB[1]));
    	return (rdist>cdist) ? rdist : cdist;
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

	 	var jr = '';
	 	var jc = '';
	 	if (jumpingPieceXY !== '') {
	 		jr = parseInt(jumpingPieceXY[0]);
	 		jc = parseInt(jumpingPieceXY[1]);
	 	}
	 	var gp = '';
 		for (var row = 0; row < 8; row++) {
	 		currentBoardMovable[row] = [];
	 		for (var col = 0; col < 8; col++) {
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
	 		};
	 	};
	 };

	var switchPlayer = function() {
		currentPlayer = currentPlayer === 'B' ? 'W' : 'B';
    	currentOpponent = currentPlayer==='B' ? 'W' : 'B';
		console.log('player switched to',currentPlayer);
	};






// 
// MAINLINE
// 
	 	currentBoardPlayers = initStartBoard();
	 	// console.log('players',currentBoardPlayers);
	 	setBoardMovable();
	 	// console.log('movable',currentBoardMovable);
	 	displayBoard();




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
      	console.log("drop: toElement.id", gpID,originXY);  
      	console.log("drop: target.id", spotID);		
      	if (currentBoardMovable[gpID[3]][gpID[4]] && currentPlayer===gpID[2]) {
      		if (currentAvailableMoves[gpID[3]][gpID[4]].indexOf(targetXY)>-1) {
      			// kingMe??
      			var kingMe = '';
      			if (currentPlayer==='B' && parseInt(targetXY[0])===7) {
      				kingMe = 'K';
      			}
      			if (currentPlayer==='W' && parseInt(targetXY[0])===0) {
      				kingMe = 'K';
      			}
      			if (kingMe !== '') {
      				console.log('KING ME!');
      			}
			// console.log('KING ME!',kingMe,'spotID',spotID);
      			// reset jumpingPieceXY
		      	if (jumpingPieceXY !=='') {jumpingPieceXY = '';}
      			// check for jump here; if so; 1) pick-up jumped piece; 
    			// 2) if another.jumpAvailable DO> same.player, only.that.piece
    		    //   provide for stop-turn-buton?
    		    // console.log('distanceBetween',distanceBetween(originXY,targetXY));
    		    if (distanceBetween(originXY,targetXY)===2) {
    		    	// jump
    		    	console.log('JUMP,JUMP,JUMP');
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
			      		jumpingPieceXY = targetXY;
			      	}
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
	    }
      	// console.log('DROP: player',gpIDtoPlayer(gpID));
      	setBoardMovable();
      	displayBoard();
      	console.log('DROP: new board:',currentBoardPlayers);
      	console.log('DROP: new board movable:',currentBoardMovable);
      	console.log('DROP: currentAvailableMoves',currentAvailableMoves);
		// $(".game-piece").draggable('enable');
      }
    });



});
// end of page load