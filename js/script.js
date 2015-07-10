// checkers by dave hemmer

$(function() {

	var currentBoardPlayers = [];  // xy arr's row by col; start = 'init setup'
	var currentBoardMovable = [];
	var currentPlayer = 'W';
	var currentDirection = '';  // '+' Down the board, '-' Up, 'K' King Up or Down, '' not set
 	

	var initStartBoard = function() {
		var startBoard = []; 
    	var player = '';
	 	for (var row = 0; row < 8; row++) {
	 		startBoard[row] = [];
	 		for (var col = 0; col < 8; col++) {
	 			if (row<3 && ((row+col)%2===0)) {
	 				player = 'B';
	 			} else if (row>4 && ((row+col)%2===0)) {
	 				player = 'W';
	 			} else {
	 				player = '';
	 			}
	 			startBoard[row][col] = player;
	 			// console.log(row,col,player);
	 		}
	 	}
	 	console.log(startBoard);
	 	return startBoard;
	 };

	 var setBoardMovable = function() {
	 	currentBoardMovable = [];
 		for (var row = 0; row < 8; row++) {
	 		currentBoardMovable[row] = [];
	 		for (var col = 0; col < 8; col++) {
	 			if (currentBoardPlayers[row][col] !== '') {
	 				currentBoardMovable[row][col] = pieceIsMovable(row,col);
	 			}
	 		}
	 	}
	 };


    var gpIDtoSpotID = function(gpID) {
    	return "r" + gpID[3] + "c" + gpID[4];
    };
    var gpIDtoPlayer = function(gpID) {
    	return gpID[2]
    };
    var isKing = function(row,col) {
    	console.log('isKing',currentBoardPlayers[row][col]);
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
    	return spotID[3]+spotID[4];
    };
    var xyToSpotID = function(xy) {
    	return 'r' + xy[0] + 'c' + xy[1];
    };
    var setAdjSpots =  function(row,col) {
    	var adjSpots = [];  // array of xy elements
    	switch (currentDirection) {
    		case '':
    			break;
			case '+':    // black
				adjSpots[0] = (row + 1).toString() + (col - 1).toString();
				adjSpots[1] = (row + 1).toString() + (col + 1).toString();
				break;
			case '-':     // white
				adjSpots[0] = (row - 1).toString() + (col - 1).toString();
				adjSpots[1] = (row - 1).toString() + (col + 1).toString();
				break;
			case 'K':
				adjSpots[0] = (row + 1).toString() + (col - 1).toString();
				adjSpots[1] = (row + 1).toString() + (col + 1).toString();
				adjSpots[2] = (row - 1).toString() + (col - 1).toString();
				adjSpots[3] = (row - 1).toString() + (col + 1).toString();
				break;
    	}
    	adjSpots.forEach(function(spot) {
			if ((spot[0]<0||spot>7)||spot[1]<0||spot[1]>7) {
				return "offBoard"
			} else {
				return spot;
			}
    	});
    	return adjSpots;
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


    // pieceIsMovable(e)
    // called from  game-piece.draggable:start
    // 	check that piece is available to move: 
    // 		1) must have adjacent-diagonal.playerDirection spot available
	//   OR 2) have opponent in ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
	// 			AND have theJump +2.diag spot available
	// 
	var pieceIsMovable = function(row,col) {
		var movable = false;
		// if (currentBoardPlayers[row][col] !== currentPlayer) {
		// 	console.log('wrong player');
		// 	return false;
		// }
		currentDirection = setDirection(row,col);
		var adjSpots = setAdjSpots(row,col);
		console.log('adjSpots',adjSpots);

		// var movable = false;
		// console.log('In pieceIsMovable',gpID,currentPlayer);
		// if (gpIDtoPlayer(gpID) !== currentPlayer) {
		// 	console.log('wrong player');
		// 	return false;
		// }
		// currentDirection = setDirection(gpID);
		// console.log('currentDirection',currentDirection);
		// var OrigSpotID = gpIDtoSpotID(gpID);
		// console.log('OrigSpotID',OrigSpotID);
		// var adjSpots = setAdjSpots(OrigSpotID);
		// console.log('adjSpots',adjSpots);
		// var occupied;
		var movable = false;
		for (var i = 0;i < adjSpots.length;i++) {
			if (adjSpots[i] !== 'offBoard') {
				if (currentBoardPlayers[adjSpots[i][0]][adjSpots[i][1]]==='') {
					movable = true;
				}
			}
		}
		console.log('movable',movable);
		return movable;
	};








// 
// MAINLINE
// 
	 	currentBoardPlayers = initStartBoard();
	 	console.log('players',currentBoardPlayers);
	 	setBoardMovable();
	 	console.log('movable',currentBoardMovable);
	 	displayBoard();


    $( ".game-piece" ).draggable({ 
    	containment: "#game-board", scroll: false, grid: [ 64, 64 ],
    	start: function(event,ui) {
    		var xy = spotXY(event.target.id);
    		console.log('drag-start',event.target.id,xy);
    		pieceIsMovable(xy[0],xy[1]);
    	},
    	stop: function(event,ui) {
    		// console.log('drag-stop',event);
    	}
    });

    $( ".game-spot" ).droppable({
      drop: function( event, ui ) {
      	console.log(event.toElement.id);
      	console.log(event.target.id);
      	// console.log(event.target.id);
        // $( this )
        //   .addClass( "ui-state-highlight" )
        //   .find( "p" )
        //     .html( "Dropped!" );
      }
    });



});
// end of page load