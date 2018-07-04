var theUniverse = null;
var frame1 = null,
	frame2 = null,
	currentFrame = null,
	backFrame = null;

var numRows = 8,
	numCols = 8;

var start_timer = null, end_timer = null, countdown_label = 3, countdown_timer = null;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.ceil(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

window.addEventListener('load', function() {
	theUniverse = document.getElementById("universe");
	frame1 = new Array(numRows);
	frame2 = new Array(numRows);

	for (var i=0; i<numRows; i++) {
		frame1[i] = new Array(numCols);
		frame2[i] = new Array(numCols);
		

		console.log(frame2);
		for (var j=0; j<numCols; j++) {
			frame1[i][j] = false;
		}	

		
	}

	

	// Adding start button

	document.getElementById("controls").innerHTML = "<input type='button' value='Start Game' id='start-button'> <input type='button' value='Restart' id='restart-button'>";
	var start_button = document.getElementById("start-button");
	start_button.onclick = startCountdown;
	var restart_button = document.getElementById("restart-button");
	restart_button.onclick = function() { location.reload(); }
	
} );

function startCountdown(e) {
	
	countdown_label = 3;
	countdown();
	countdown_timer = setInterval(countdown, 1000);
}

function countdown() {
	document.getElementById("universe").innerHTML = '<div class="countdown_label">' + countdown_label + '</div>';
	countdown_label--;
	
	//if (countdown_label==2){
	//	playSound("sound2");
	//}
	
	if (countdown_label==-1){
		clearInterval(countdown_timer);
		startGame();
	}
}

function startGame(e) {

	console.log("test start");

	// Clear universe
	document.getElementById("universe").innerHTML = '';
	frame1 = new Array(numRows);

	for (var i=0; i<numRows; i++) {
		frame1[i] = new Array(numCols);
		frame2[i] = new Array(numCols);
		

		console.log(frame2);
		for (var j=0; j<numCols; j++) {
			frame1[i][j] = false;
		}	

		
	}

	// Calculating starting coordinates
	var num_coords = 0;
	while (num_coords < 10){
		rand_x = getRandomInt(0, 7);
		rand_y = getRandomInt(0, 7);
		if(frame1[rand_x][rand_y] != true) {
			frame1[rand_x][rand_y] = true;
			num_coords++;
		}
	}

	console.dir(frame1);

	for (var i=0; i<numRows; i++) {
		var rowElem = document.createElement("div");
		rowElem.className = "row";
		rowElem.row = i;
		for (var j=0; j<numCols; j++) {
			var cellElem = document.createElement("div");
			cellElem.row = i;
			cellElem.col = j;
			cellElem.onmousedown = flipHandler;
			
			cellElem.onclick = flipHandler;
			cellElem.className = "cell";
			if (frame1[i][j])
				cellElem.classList.add("live");
			rowElem.appendChild(cellElem);
		}
		theUniverse.appendChild(rowElem);
	}

	document.onmousedown = docOnMousedown;
	document.onmouseup = docOnMouseup;

	currentFrame = frame1;
	backFrame = frame2;
	navigator.requestMIDIAccess({}).then( onMIDIInit, onMIDIFail );

	// Start your engines
	start_timer = new Date();

}


function docOnMousedown(e)
{
	mouseIsDown = true;

}

//function playSound(soundObj) {
	//var sound = document.getElementById(soundObj);
	//sound.play();
//}


function docOnMouseup(e)
{
	mouseIsDown = false;

}
var selectMIDIIn = null;
var mouseIsDown = false;
var selectMIDIOut = null;
var midiAccess = null;
var midiIn = null;
var midiOut = null;
var launchpadFound = false;

function changeMIDIIn( ev ) {
  if (midiIn)
    midiIn.onmidimessage = null;
  var selectedID = selectMIDIIn[selectMIDIIn.selectedIndex].value;

  for (var input of midiAccess.inputs.values()) {
    if (selectedID == input.id)
      midiIn = input;
  }
  midiIn.onmidimessage = midiProc;
}

function changeMIDIOut( ev ) {
  var selectedID = selectMIDIOut[selectMIDIOut.selectedIndex].value;

  for (var output of midiAccess.outputs.values()) {
    if (selectedID == output.id) {
      midiOut = output;
	  midiOut.send( [0xB0,0x00,0x00] ); // Reset Launchpad
	  midiOut.send( [0xB0,0x00,0x01] ); // Select XY mode
	  drawFullBoardToMIDI();
	}
  }
}

function onMIDIFail( err ) {
	alert("MIDI initialization failed.");
}

function onMIDIInit( midi ) {
  midiAccess = midi;
  selectMIDIIn=document.getElementById("midiIn");
  selectMIDIOut=document.getElementById("midiOut");

  // clear the MIDI input select
  selectMIDIIn.options.length = 0;

  for (var input of midiAccess.inputs.values()) {
    if ((input.name.toString().indexOf("Launchpad") != -1)||(input.name.toString().indexOf("QUNEO") != -1)) {
      launchpadFound = true;
      selectMIDIIn.add(new Option(input.name,input.id,true,true));
      midiIn=input;
	  midiIn.onmidimessage = midiProc;
    }
    else
    	selectMIDIIn.add(new Option(input.name,input.id,false,false));
  }
  selectMIDIIn.onchange = changeMIDIIn;

  // clear the MIDI output select
  selectMIDIOut.options.length = 0;
  for (var output of midiAccess.outputs.values()) {
    if ((output.name.toString().indexOf("Launchpad") != -1)||(output.name.toString().indexOf("QUNEO") != -1)) {
      selectMIDIOut.add(new Option(output.name,output.id,true,true));
      midiOut=output;
    }
    else
    	selectMIDIOut.add(new Option(output.name,output.id,false,false));
  }
  selectMIDIOut.onchange = changeMIDIOut;

  if (midiOut && launchpadFound) {  
	midiOut.send( [0xB0,0x00,0x00] ); // Reset Launchpad
	midiOut.send( [0xB0,0x00,0x01] ); // Select XY mode
	drawFullBoardToMIDI();
  }
}







function flipHandler(e) {
	flip( e.target );
}

function isBoardClear() {
	var num_lit = document.getElementsByClassName("live").length;
	console.log("Number lit: " + num_lit);
	if (num_lit==0){
		return true;
	}
	return false;
}

function flip(elem) {
	currentFrame[elem.row][elem.col] = !currentFrame[elem.row][elem.col];
	if (elem.className == "cell")  // dead
		elem.className = "cell live";
	else
		elem.className = "cell";
	var key = elem.row*16 + elem.col;
	console.log(key); // key defines which button to light/off
	midiOut.send( [0x90, key, elem.classList.contains("live") ? (elem.classList.contains("mature")?0x13:0x30) : 0x00]);
}

function findElemByXY( x, y ) {
	var e, i, j, c;

	for (i in theUniverse.children) {
		e = theUniverse.children[i];
		if (e.row == y) {
			for (j in e.children) {
				if (e.children[j].col == x)
					return e.children[j];
			}
		}
	}
	return null;
}

function flipXY( x, y ) {
	var elem = findElemByXY( x, y );
	if (elem) {
		flip( elem );
	}
	console.log(isBoardClear());
	if (isBoardClear()){
		var end_timer = new Date();
		var interval = end_timer.getTime() - start_timer.getTime();
		var interval_sec = interval / 1000;
		console.log("'Interval' " + interval_sec);	

		document.getElementById("result").innerHTML = "You finished in " + interval_sec + " seconds!";
	}
}

function countLiveNeighbors(frame,x,y) {
	var c=0;

	for (var i=x-1; i<x+2; i++) {
		for (var j=y-1; j<y+2; j++) {
			if ((i!=x)||(j!=y)) {	// skip the cell itself
				if (frame[((i+numRows)%numRows)][((j+numCols)%numCols)])
					c++;
			}
		}
	}
	return c;
}

function drawFullBoardToMIDI() {
//	var t = window.performance.webkitNow();

	if (!launchpadFound)
		return;
	for (var i=0; i<numRows; i++) {
		for (var j=0; j<numCols; j++) {
			var key = i*16 + j;
			if (midiOut)
				midiOut.send( [0x90, key, currentFrame[i][j] ? (findElemByXY(j,i).classList.contains("mature")?0x13:0x30) : 0x00]);
		}	
	}

//	console.log( "draw took " + (window.performance.webkitNow() - t) + " ms.");
}

function drawFullBoardToQUNEO() {
	if (!quneoFound)
		return;
	for (var i=0; i<numRows; i++) {
		for (var j=0; j<numCols; j++) {
			var key = i*32 + j*2;
			if (midiOut)
				midiOut.send( [0x90, key, currentFrame[i][j] ? (findElemByXY(j,i).classList.contains("mature")?0x13:0x30) : 0x00]);
		}	
	}

//	console.log( "draw took " + (window.performance.webkitNow() - t) + " ms.");
}


function updateMIDIFromLastFrame() {
	for (var i=0; i<numRows; i++) {
		for (var j=0; j<numCols; j++) {
			var key = i*16 + j;
			if (currentFrame[i][j] || backFrame[i][j])
				if (midiOut)
					midiOut.send( [0x90, key, currentFrame[i][j] ? (findElemByXY(j,i).classList.contains("mature")?0x13:0x30) : 0x00]);
		}	
	}
}


function midiProc(event) {
  data = event.data;
  var cmd = data[0] >> 4;
  var channel = data[0] & 0xf;
  var noteNumber = data[1];
  var velocity = data[2];

  if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
    // note off
    //noteOff(b);
  } else if (cmd == 9) {  // Note on
    if ((noteNumber&0x0f)==8)
      tick();
    else {
      var x = noteNumber & 0x0f;
      var y = (noteNumber & 0xf0) >> 4;
      flipXY( x, y );
    }
  } else if (cmd == 11) { // Continuous Controller message
    switch (noteNumber) {
    }
  }
}
