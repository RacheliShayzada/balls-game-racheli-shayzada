var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var countCollectedBalls;
var countExistingBalls;
var timer;

// Initialize the game and render the board on the page
function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	countCollectedBalls = 0;
	countExistingBalls = 2;
	renderBoard(gBoard);
}


function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	//add holls to the game board
    board[4][0].type = FLOOR;
    board[4][11].type = FLOOR;
    board[0][6].type = FLOOR;
    board[9][6].type = FLOOR;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			//Done
			cellClass += currCell.type === FLOOR ? ' floor' : currCell.type === WALL ? ' wall' : '';

			//Done
			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">\n`;

			// Done
			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			countCollectedBalls++;
			countExistingBalls--;
			renderBallCounters();
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:

        // Check if the player is moving into a hole
        switch (`${i},${j}`) {
            case '4,0': // Left hole
                gGamerPos.i = 4;
                gGamerPos.j = 10; // Move to the right side
                break;
            case '4,11': // Right hole
                gGamerPos.i = 4;
                gGamerPos.j = 1; // Move to the left side
                break;
            case '0,6': // Top hole
                gGamerPos.i = 8; // Move to the bottom
                gGamerPos.j = 6; // Same column
                break;
            case '9,6': // Bottom hole
                gGamerPos.i = 1; // Move to the top
                gGamerPos.j = 6; // Same column
                break;
            default:
                // Update the position normally
                gGamerPos.i = i;
                gGamerPos.j = j;
                break;
        }
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	console.log('cellClass:', cellClass);
	return cellClass;
}

// Add a new ball to the board in empty place (not cell or floor or wall)

function addBall() {

    var emptyCells = [];

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (cell.gameElement === null && cell.type === FLOOR) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        var randomEmptyCell = emptyCells[getRandomInt(0, emptyCells.length - 1)];
        gBoard[randomEmptyCell.i][randomEmptyCell.j].gameElement = BALL;
        renderCell(randomEmptyCell, BALL_IMG);
		countExistingBalls++;
		renderBallCounters();
    }

}

//Return a random integer between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//setInterval to add a new ball every 3 seconds
function setTimeoutAddBall() {
	timer = setInterval(addBall, 3000);
}

setTimeoutAddBall();


//render the ball counters
function renderBallCounters() {
    var elCounterExistingBalls = document.getElementById('existing-balls');
    elCounterExistingBalls.innerText = 'Existing Balls:'+ countExistingBalls;

    var elCounterCollectedBalls = document.getElementById('collcted-balls');
    elCounterCollectedBalls.innerText = 'Collected Balls:'+ countCollectedBalls;

	if(checkWinningConditions())
		winningFunction();
}

//check winning conditions
function checkWinningConditions() {
    return (countExistingBalls === 0);
}

//winning function
function winningFunction() {
	clearInterval(timer);
	alert('Congratulations, You Win!');
}

// restart the game
function restartGame() {
    initGame();
	setTimeoutAddBall();
}







