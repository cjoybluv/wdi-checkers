// checkers by dave hemmer

$(function() {

 
    $( ".game-piece" ).draggable({ containment: "#game-board", scroll: false });

    $('#game-board').addEventListener('mouseup',function(e){
    	console.log('wrap mouse up!!',e)
	  });



});
// end of page load