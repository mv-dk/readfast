function elem(id){
    return document.getElementById(id);
}

var textArea = elem("textarea");
var wordArea = elem("wordArea");
var speedInput = elem("speedInput");
var textAreaIsDirty = true;
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

startBtn.onclick = startBtnClicked;
clearBtn.onclick = clearBtnClicked;
loadBtn.onclick = loadBtnClicked;
rewindToBeginningBtn.onclick = rewindToBeginningBtnClicked;
prevParagraphBtn.onclick = prevParagraphBtnClicked;
pauseBtn.onclick = pauseBtnClicked;
nextParagraphBtn.onclick = nextParagraphBtnClicked;
decreaseSpeedBtn.onclick = decreaseSpeedBtnClicked;
increaseSpeedBtn.onclick = increaseSpeedBtnClicked;

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
	    if (word.endsWith(".")) {
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
	while (!word.endsWith(".")) {
	    word = this.next();
	}
    }
};

function clearBtnClicked(){
    textArea.textContent = "";
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
}

function startBtnClicked() {
    if (textAreaIsDirty) {
	load();
    }
    pause = false;
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
}

function prevParagraphBtnClicked() {
    state.prevSentence();
    put(wordArea, state.current());
}

var pause = false;

function pauseBtnClicked() {
    pause = true;
}

function nextParagraphBtnClicked() {
    state.nextSentence();
    put(wordArea, state.current());
}
function decreaseSpeedBtnClicked() {
    var n = Number(speedInput.value);
    if (n > 10) {
	speedInput.value = n - 10;
    }
}
function increaseSpeedBtnClicked() {
    var n = Number(speedInput.value);
    speedInput.value = n + 10;
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

function getPausePeriod(word){
    var f = 1;
    if (word.endsWith(",") ||
        (word.length > 8 && word.length <= 12)) f = 1.5;
    if (word.endsWith(".") ||
	word.endsWith("!") ||
	word.endsWith("?") ||
        word.endsWith(")") || 
        word.endsWith("(") ||
        word.length > 12) f = 1.8;
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


