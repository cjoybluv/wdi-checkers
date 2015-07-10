// checkers by dave hemmer

$(function() {

	var currentBoard = [];  // xy arr's row by col; start = 'init setup'
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




    var gpIDtoSpotID = function(gpID) {
    	return "r" + gpID[3] + "c" + gpID[4];
    };
    var gpIDtoPlayer = function(gpID) {
    	return gpID[2]
    };
    var isKing = function(gpID) {
    	// console.log('isKing',gpID[5]);
    	return (gpID[5]==='K');
    };
    var setDirection = function(gpID) {
    	if (isKing(gpID)) {
    		return 'K';
    	} else if (gpIDtoPlayer(gpID)==="B") {
    		return '+';
    	} else {
    		return '-';
    	}
    };
    var spotXY = function(spotID) {
    	var xy = [];
    	xy[0] = parseInt(spotID[1]);
    	xy[1] = parseInt(spotID[3]);
    	return xy;
    };
    var xyToSpotID = function(xy) {
    	return 'r' + xy[0] + 'c' + xy[1];
    };
    var setAdj = function(spotID,x,y) {
    	var adjXY = [];
    	var xy = spotXY(spotID);
    	// console.log('setAdj : xy',xy);

    	adjXY[0] = xy[0] + x;
    	adjXY[1] = xy[1] + y;
    	// console.log('setAdj : adjXY',adjXY)
    	if ((adjXY[0]<0||adjXY>7)||adjXY[1]<0||adjXY[1]>7) {
    		return "offBoard"
    	} else {
	    	return xyToSpotID(adjXY);
    	}
    };
    var setAdjSpots =  function(spotID) {
    	// console.log('setAdjSpots',spotID,'Dir',currentDirection);	
    	var adjSpots = [];
    	switch (currentDirection) {
    		case '':
    			break;
			case '+':    // black
				// console.log('setAdjSpots',currentDirection,spotID);
				adjSpots[0] = setAdj(spotID,1,-1);  // Fwd-Left
				adjSpots[1] = setAdj(spotID,1,1);	// Fwd-Right
				break;
			case '-':     // white
				adjSpots[0] = setAdj(spotID,-1,-1);  // Bwd-Left
				adjSpots[1] = setAdj(spotID,-1,1);	//Bkwd-Right
				break;
			case 'K':
				adjSpots[0] = setAdj(spotID,1,-1);  // Fwd-Left
				adjSpots[1] = setAdj(spotID,1,1);	// Fwd-Right
				adjSpots[2] = setAdj(spotID,-1,-1);  // Bkwd-Left
				adjSpots[3] = setAdj(spotID,-1,1);	// BKwd-Right
				break;
    	}
    	return adjSpots;
    };


	 var displayBoard = function() {
	 	// console.log(currentBoard[0][2]);
	 	for (var row = 0;row < 8;row++) {
	 		for(var col = 0;col <8;col++) {
	 			var spotID = xyToSpotID(row.toString() + col.toString());
	 			// console.log(row.toString() + col.toString());
	 			switch (currentBoard[row][col]) {
	 				case '':
	 					$('#'+spotID).find('img').remove();
	 					break;
 					case 'B':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbB'+row+col+'" class="game-piece draggable" src="black-king.png" width="50">');
	 					break;
 					case 'W':
	 					$('#'+spotID).find('img').remove();
	 					$('#'+spotID).append('<img id="gbW'+row+col+'" class="game-piece draggable" src="white-king.png" width="50">');
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
	var pieceIsMovable = function(gpID) {
		var movable = false;
		console.log('In pieceIsMovable',gpID,currentPlayer);
		if (gpIDtoPlayer(gpID) !== currentPlayer) {
			console.log('wrong player');
			return false;
		}
		currentDirection = setDirection(gpID);
		console.log('currentDirection',currentDirection);
		var OrigSpotID = gpIDtoSpotID(gpID);
		console.log('OrigSpotID',OrigSpotID);
		var adjSpots = setAdjSpots(OrigSpotID);
		console.log('adjSpots',adjSpots);
		var occupied;
		adjSpots.forEach(function(spot) {
			if (spot !== 'offBoard') {
				occupied = $('#'+spot+' img').length;
				if (!occupied) {
					movable = true;
				}
			}
		});
		console.log('movable',movable);
		return movable;
	};








// 
// MAINLINE
// 
	 	currentBoard = initStartBoard();
	 	displayBoard();


    $( ".game-piece" ).draggable({ 
    	containment: "#game-board", scroll: false, grid: [ 64, 64 ],
    	start: function(event,ui) {
    		console.log('drag-start',event.target.id);
    		pieceIsMovable(event.target.id);
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