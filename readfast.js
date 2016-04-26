function elem(id){
    return document.getElementById(id);
}

var textArea = elem("textarea");
var wordArea = elem("wordArea");
var speedInput = elem("speedInput");
var textAreaIsDirty = true;
var totalTimeSpan = elem("totalTime");

textArea.onkeyup = function(){
    textAreaIsDirty = true;
}

var startBtn = elem("startBtn");
var clearBtn = elem("clearBtn");
var loadBtn = elem("loadBtn");
var rewindToBeginningBtn = elem("rewindToBeginningBtn");
var prevParagraphBtn = elem("prevParagraphBtn");
var pauseBtn = elem("pauseBtn");
var nextParagraphBtn = elem("nextParagraphBtn");
var decreaseSpeedBtn = elem("decreaseSpeedBtn");
var increaseSpeedBtn = elem("increaseSpeedBtn");
var progressBar = elem("progressBar");
var pause = true;

startBtn.onclick = startBtnClicked;
clearBtn.onclick = clearBtnClicked;
loadBtn.onclick = loadBtnClicked;
rewindToBeginningBtn.onclick = rewindToBeginningBtnClicked;
prevParagraphBtn.onclick = prevParagraphBtnClicked;
pauseBtn.onclick = pauseBtnClicked;
nextParagraphBtn.onclick = nextParagraphBtnClicked;
decreaseSpeedBtn.onclick = decreaseSpeedBtnClicked;
increaseSpeedBtn.onclick = increaseSpeedBtnClicked;

document.onkeydown = function(e) {
	if (document.activeElement === textArea) return;

	if (e.keyCode == 32) { //space
		if (pause) {
			startBtnClicked();
		} else {
			pauseBtnClicked();
		}
	}
	else if (e.keyCode == 37) { // left
		prevParagraphBtnClicked();
	}
	else if (e.keyCode == 39) { // right
		nextParagraphBtnClicked();
	}
	else if (e.keyCode == 38) { // up
		increaseSpeedBtnClicked();
	}
	else if (e.keyCode == 40) { // down
		decreaseSpeedBtnClicked();
	}
}

pauseBtn.style.display = "none";

NORMAL_PAUSE = 400;
COMMA_PAUSE = 600;
PERIOD_PAUSE = 800;
PARA_PAUSE = 1000;

var state = {
    wordArray: undefined,
    idx: 0,
    current: function(){ 
		return this.wordArray[this.idx]; 
    },
    next: function() {
		if (this.wordArray == undefined || this.idx >= this.wordArray.length) return undefined;
		return this.wordArray[this.idx++];
    },
    nextWord: function() {
		if (this.idx+1 >= this.wordArray.length) { return undefined; }
		return this.wordArray[this.idx+1];
    },
    prevSentence: function(){
		var i = this.idx-2;
		while (i > 0) {
			var word = wordArray[i];
			if (endsWithStop(word)) {
				this.idx = i + 1;
				break;
			}
			i--;
		}
		if (i == 0) this.idx = 0;
    },
    nextSentence: function(){
		var i = this.idx;
		var word = this.next();
		if (word == undefined) return;
		while (!endsWithStop(word)) {
			word = this.next();
		}
    }
};

function updateProgressBar(){
	var p = 0;
	if (state.wordArray != undefined) { 
		p = 100.0 * (state.idx / state.wordArray.length);
	}
	setProgressBarPct(p);
}

function setProgressBarPct(percentage){
	progressBar.style.width = percentage+"%";
}

function updateTotalTime(){
	var totalTimeSeconds = 0;
	if (state.wordArray != undefined) {
		var numWords = state.wordArray.length;
		var wordTime = wpmToMs(speedInput.value);
		totalTimeSeconds = (numWords * wordTime)/1000;
	}

	totalTimeSpan.innerText = secondsToString(totalTimeSeconds);
}

function secondsToString(seconds){
	var mm = Math.round(seconds/60);
	if (mm < 10) mm = "0"+mm;
	var ss = Math.round(seconds % 60);
	if (ss < 10) ss = "0"+ss;
	return mm + ":" + ss;
}

function clearBtnClicked(){
    textArea.value = "";
}

function loadBtnClicked(){
    load();
}

function load(){
    var text = getTextFromTextArea();
    wordArray = getWordArray(text);
    state.wordArray = wordArray;
    state.idx = 0;
    put(wordArea, state.wordArray[state.idx]);
    textAreaIsDirty = false;
	
	updateProgressBar();
	updateTotalTime();
}

function startBtnClicked() {
    if (textAreaIsDirty) {
		load();
    }
    pause = false;
	
	startBtn.style.display="none";
	pauseBtn.style.display="inline-block";

    play();
}

function wpmToMs(wpm){
    /*
      var wps = wpm / 60;
      var wpms = wps / 1000;
      var msBreak= 1 / wpms;
      return msBreak;
    */
    return 60000 / wpm;
}

function play(){
    if (pause) { return; }
	updateProgressBar();
    var word = state.next();
    if (word == undefined) return;
    var t = getPausePeriod(word);
    
    put(wordArea, word);
    setTimeout(function (){
		play();
    }, t);
}

function rewindToBeginningBtnClicked() {
    state.idx = 0;
    put(wordArea, state.current());
	updateProgressBar();
}

function prevParagraphBtnClicked() {
    state.prevSentence();
    put(wordArea, state.current());
	updateProgressBar();
}

function pauseBtnClicked() {
    pause = true;
	
	startBtn.style.display="inline-block";
	pauseBtn.style.display="none";
}

function nextParagraphBtnClicked() {
    state.nextSentence();
    put(wordArea, state.current());
	updateProgressBar();
}
function decreaseSpeedBtnClicked() {
    var n = Number(speedInput.value);
    if (n > 10) {
		speedInput.value = n - 10;
    }

	updateTotalTime();
}
function increaseSpeedBtnClicked() {
    var n = Number(speedInput.value);
    speedInput.value = n + 10;

	updateTotalTime();
}

function getTextFromTextArea(){
    return textArea.value;
}

function put(wordArea, word){
    wordArea.textContent = word;
}

function getWordArray(fullText){
    var spaceSplit = fullText.split(" ");
    var fullArr = [];
    spaceSplit.forEach(function (x) {
		var nSplit = x.split("\n");
		nSplit.forEach(function (y) {
			var rSplit = y.split("\r");
			rSplit.forEach(function (elem){
				if (elem != "") { fullArr.push(elem); }
			});
		});
    });
    return fullArr;
}

function endsWithStop(word) {
	return word.endsWith(".") ||
		word.endsWith("!") ||
		word.endsWith("?") ||
		word.endsWith(".\"") ||
		word.endsWith("!\"") ||
		word.endsWith("?\"") ||
		word.endsWith("...");
}

function getPausePeriod(word){
    var f = 1;
    if (word.endsWith(",") ||
        (word.length > 8 && word.length <= 12)) f = 1.5;
	if (endsWithStop(word) ||
        word.endsWith(")") || 
        word.endsWith("(")) 
	{
		f = 1.8;
	}
    return wpmToMs(speedInput.value) * f;
    /*
      if (word.endsWith(",")) { return COMMA_PAUSE; };
      if (word.endsWith(".")) { return PERIOD_PAUSE; };
      return NORMAL_PAUSE;
    */
}


(function test(){
    var assertEquals = function(actual, expected){
		if (actual != expected){
			var caller = arguments.callee.caller.name;
			throw "FAIL, expected '"+expected+"', actual '"+actual+"' at "+caller;
		}
    }
    var assertNotUndefined = function(val){
		if (val == undefined) {
			var caller = arguments.callee.caller.name;
			throw "FAIL, value was undefined at "+caller;
		}
    }
    
    !function test_canSplitWords (){
		var wordArray = getWordArray("abc def");
		assertNotUndefined(wordArray);
		assertEquals(wordArray[0], "abc");
		assertEquals(wordArray[1], "def");
    }();

    !function test_canSplitWordsOnLineBreak(){
		var wordArray = getWordArray("abc\ndef");
		assertNotUndefined(wordArray);
		assertEquals(wordArray[0], "abc");
		assertEquals(wordArray[1], "def");
    }();

    !function test_canSplitWordsOnReturn(){
		var wordArray = getWordArray("abc\rdef");
		assertNotUndefined(wordArray);
		assertEquals(wordArray[0], "abc");
		assertEquals(wordArray[1], "def");
    }();

    !function test_noEmptyElements(){
		var wordArray = getWordArray("abc  def");
		assertNotUndefined(wordArray);
		assertEquals(2, wordArray.length);
		assertEquals(wordArray[0], "abc");
		assertEquals(wordArray[1], "def");
    }();

    !function test_noEmptyElements2(){
		var wordArray = getWordArray("abc\r\ndef");
		assertNotUndefined(wordArray);
		assertEquals(2, wordArray.length);
		assertEquals(wordArray[0], "abc");
		assertEquals(wordArray[1], "def");
    }();

    /*
      !function test_pauseNormalWord(){
	  var p = getPausePeriod("huba");
	  assertEquals(p, NORMAL_PAUSE);
      }();

      !function test_pauseCommaWord(){
	  var p = getPausePeriod("huba,");
	  assertEquals(p, COMMA_PAUSE);
      }();

      !function test_pausePeriodWord(){
	  var p = getPausePeriod("huba.");
	  assertEquals(p, PERIOD_PAUSE);
      }();
    */
})();


