// checkers by dave hemmer

$(function() {

	var currentPlayer = 'W';
	var currentDirection = '';  // '+' Down the board, '-' Up, 'K' King Up or Down, '' not set
 
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

    var gpIDtoSpotID = function(gpID) {
    	return "r" + gpID[3] + "c" + gpID[4];
    }
    var gpIDtoPlayer = function(gpID) {
    	return gpID[2]
    }
    var isKing = function(gpID) {
    	// console.log('isKing',gpID[5]);
    	return (gpID[5]==='K');
    }
    var setDirection = function(gpID) {
    	if (isKing(gpID)) {
    		return 'K';
    	} else if (gpIDtoPlayer(gpID)==="B") {
    		return '+';
    	} else {
    		return '-';
    	}
    }
    var spotXY = function(spotID) {
    	var xy = [];
    	xy[0] = parseInt(spotID[1]);
    	xy[1] = parseInt(spotID[3]);
    	return xy;
    }
    var xyToSpotID = function(xy) {
    	return 'r' + xy[0] + 'c' + xy[1];
    }
    var setAdj = function(spotID,x,y) {
    	var adjXY = [];
    	var xy = spotXY(spotID);
    	console.log('setAdj : xy',xy);

    	adjXY[0] = xy[0] + x;
    	adjXY[1] = xy[1] + y;
    	console.log('setAdj : adjXY',adjXY)
    	if ((adjXY[0]<0||adjXY>7)||adjXY[1]<0||adjXY[1]>7) {
    		return "offBoard"
    	} else {
	    	return xyToSpotID(adjXY);
    	}
    }
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
    }

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
	}

});
// end of page load