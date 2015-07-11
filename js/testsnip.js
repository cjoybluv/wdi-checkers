    var ob = function(num,dir) {
    	var ob = false;
    	if (num===0 && dir==='-') {ob=true;}
    	return ob;
    };

// console.log(ob(0,'+'));
;
var adjSpots = [];


var row = 6;
var col = 4;
if (!ob(row,'+') && !ob(col,'-')) {adjSpots.push((row + 1).toString() + (col - 1).toString())};
console.log('adjSpots',adjSpots);

var row = 7;
var col = 0;
if (!ob(row,'+') && !ob(col,'-')) {adjSpots.push((row + 1).toString() + (col - 1).toString())};
console.log('adjSpots',adjSpots);


console.log(/[0-9]/.test("1-1"));

var spot = '11';

    	if (/[0-9][0-9]/.test(spot)) {
    		console.log('hurray');
    	} else {
    		console.log('boo');
    	}
    	


