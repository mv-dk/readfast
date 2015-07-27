function elem(id){
    return document.getElementById(id);
}

var textArea = elem("textarea");
var wordArea = elem("wordArea");
var startButton = elem("startBtn");
startButton.onclick = buttonClicked;

function getTextFromTextArea(){
    return textArea.value;
}

function put(word){
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

NORMAL_PAUSE = 400;
COMMA_PAUSE = 600;
PERIOD_PAUSE = 800;
PARA_PAUSE = 1000;

function getPausePeriod(word){
    if (word.endsWith(",")) { return COMMA_PAUSE; };
    if (word.endsWith(".")) { return PERIOD_PAUSE; };
    return NORMAL_PAUSE;
}

function buttonClicked(){
    var text = getTextFromTextArea();
    var words = getWordArray(text);
    put(words[0]);
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
})();


