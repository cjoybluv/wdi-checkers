var mapFx = function(row) {
	if (row[6].length === 0) {
		row[6][6] = 'Dave';
	}
	return row;
};

var arr = [];
console.log('arr',arr,arr.length);
for (var r=0;r<8;r++) {
	arr[r] = [];
	for (var c=0;c<8;c++) {
		arr[r][c] = [];
	}
	console.log('arr['+r+'].length',arr[r].length);
}

console.log('postinit',arr);

if (arr[3][3].length === 0) {
	arr[4][4] = 'hello';
}

console.log('post test & set',arr);

console.log('arr[1][1].length',arr[1][1].length);

// arr[2][4].push('35'); 

if (arr[1][1].length === 0) {
	arr[1][1].push("hell yeah");
}
arr[2][4].push('43');
arr[2][4].push('23');	

console.log('arr = null:',arr);

console.log('PRE: map');

var temp = arr.map(mapFx);


console.log('temp',temp);
console.log('arr',arr);

if (arr[6][5] === '') {
	arr[6][5] = 'alan';
}

// arr[2][4].splice(1,1);
// console.log('arr,length',arr,arr.length);
// console.log(arr[2][4][1]);


var a = 5;
var b = ''
var c = b = a;
console.log('a',a,'b',b,'c',c);
