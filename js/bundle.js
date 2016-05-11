/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);
	var GameView = __webpack_require__(3);
	var MenuBar = __webpack_require__(4);
	
	document.addEventListener("DOMContentLoaded", function(){
	  var canvasEl = document.getElementsByTagName("canvas")[0];
	  canvasEl.width = GameView.DIM_X;
	  canvasEl.height = GameView.DIM_Y;
	
	  var cellSize = 20;
	  var ctx = canvasEl.getContext("2d");
	  var game = new Game(ctx, cellSize);
	  var gv = new GameView(game, ctx, canvasEl, cellSize);
	  var menu = new MenuBar(game, gv);
	  gv.start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Board = __webpack_require__(2);
	
	var Game = function(ctx, cellSize){
	  this.board = new Board(26, ctx, cellSize);
	  this.colony = [];
	  this.ctx = ctx;
	};
	Game.DIM_X = 520;
	Game.DIM_Y = 520;
	
	Game.prototype.draw = function(){
	  this.ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
	  this.ctx.fillStyle = 'grey';
	  this.ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
	};
	
	Game.prototype.drawGridLines = function() {
	  // Draw the grid
	  var bw = Game.DIM_X;
	  var bh = Game.DIM_Y;
	  //size of canvas
	  var cw = bw + 1;
	  var ch = bh + 1;
	  // Vertical lines
	  this.ctx.strokeStyle = "black";
	  this.ctx.lineWidth = 1.3;
	  for (var x = 0; x <= bw; x += this.cellSize) {
	      this.ctx.moveTo(x, 0);
	      this.ctx.lineTo(x, bh);
	      this.ctx.stroke();
	  }
	 // Horizontal lines
	  for (x = 0; x <= bh; x += this.cellSize) {
	      this.ctx.moveTo(0, x);
	      this.ctx.lineTo(bw, x);
	      this.ctx.stroke();
	  }
	  return;
	};
	
	Game.prototype.start = function () {
	  this.draw();
	  this.drawGridLines();
	};
	
	
	Game.prototype.drawColony = function(ctx, cellCoord, cellSize){
	  // Temporary function to fill a particular cell with color
	  ctx.fillStyle = "green";
	  ctx.fillRect(cellCoord[0]+1, cellCoord[1]+1, cellSize-2, cellSize-2);
	  // Swap out the hor and vertical coordinates here becuase hor => columns
	  this.board.buildColony(cellCoord[1]/ cellSize, cellCoord[0]/ cellSize);
	};
	
	Game.prototype.reset = function(){
	  this.board = new Board(26, this.ctx, this.cellsize);
	  this.start();
	};
	Game.prototype.pause = function(){};
	
	Game.prototype.step = function(){
	    this.board.step();
	};
	
	module.exports = Game;
	window.Game = Game;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var Board = function(numCells, ctx, cellSize){
	  this.colony = [];
	  this.numCells = numCells;
	  this.ctx = ctx;
	  this.cellSize = cellSize;
	  this.generation = 0;
	  this.grid = this.populate();
	};
	
	Board.DIM_X = 520;
	Board.DIM_Y = 520;
	
	Board.prototype.populate = function(){
	  var grid = [];
	  for(var i = 0; i < this.numCells; i++){
	    grid.push([]);
	    for(var j = 0; j < this.numCells; j++){
	    grid[i].push(null);
	    }
	  }
	  return grid;
	};
	
	Board.prototype.buildColony = function(x, y){
	  this.colony.push([x,y]);
	  this.grid[x][y] = 1;
	};
	
	Board.NEIGHBORS = [[0,-1],[0,1],[1,0],[-1,0],[-1,-1],[-1,1],[1,-1],[1,1]];
	
	Board.prototype.reset = function(){
	  this.grid = [];
	};
	
	Board.prototype.step = function(){
	  var newGrid = this.populate();
	  for(var i = 0; i < this.numCells; i++){
	    for(var j = 0; j < this.numCells; j++){
	      var aliveNeighbors = 0;
	
	      for(var k = 0; k < Board.NEIGHBORS.length; k++){
	        var delta = Board.NEIGHBORS[k];
	        var gridVal =
	          this.grid[i+delta[0]] ? this.grid[i+delta[0]][j+delta[1]] || 0 : 0;
	        aliveNeighbors += gridVal;
	      }
	        //If cell is alive, it dies if aliveNeighbors > 4 || aliveNeighbors < 1
	        // else it lives;
	        if (this.grid[i][j] === 1){
	          if (aliveNeighbors >= 4 || aliveNeighbors <= 1){
	            newGrid[i][j] = null;
	          }
	          else{
	            newGrid[i][j] = this.grid[i][j];
	          }
	        }
	        // If cell is dead and it has aliveNeighbors == 3, it becomes alive
	        else if (!this.grid[i][j] && aliveNeighbors === 3){
	          newGrid[i][j] = 1;
	        }
	        else{
	          newGrid[i][j] = this.grid[i][j];
	         }
	    }//for j
	  }//for i
	  this.grid = newGrid;
	  this.generation += 1;
	  this.draw();
	};//step
	
	Board.prototype.draw = function(){
	  var sz = this.cellSize;
	  // Clear up the board
	  this.ctx.clearRect(0, 0, Board.DIM_X, Board.DIM_Y);
	  this.ctx.fillStyle = 'grey';
	  this.ctx.fillRect(0, 0, Board.DIM_X, Board.DIM_Y);
	  // Redraw the board
	  var self = this;
	  this.ctx.fillStyle = "yellow";
	  for(var i = 0; i < this.grid.length; i++){
	    var row = this.grid[i];
	    for(var j = 0; j < row.length; j++){
	      if(this.grid[i][j] === 1){
	        this.ctx.fillRect(j*sz, i*sz, sz-2, sz-2);
	      }
	    }
	  }
	this.drawGridLines();
	};
	
	Board.prototype.drawGridLines = function() {
	  // Draw the grid
	  //padding around grid
	  var bw = Board.DIM_X;
	  var bh = Board.DIM_Y;
	  //size of canvas
	  var cw = bw + 1;
	  var ch = bh + 1;
	  // Vertical lines
	  this.ctx.strokeStyle = "black";
	  this.ctx.lineWidth = 1.3;
	  for (var x = 0; x <= bw; x += this.cellSize) {
	      this.ctx.moveTo(x, 0);
	      this.ctx.lineTo(x, bh);
	      this.ctx.stroke();
	  }
	 // Horizontal lines
	  for (x = 0; x <= bh; x += this.cellSize) {
	      this.ctx.moveTo(0, x);
	      this.ctx.lineTo(bw, x);
	      this.ctx.stroke();
	  }
	  return;
	};
	module.exports = Board;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var GameView = function (game, ctx, canvasEl, cellSize) {
	  this.canvas = canvasEl;
	  this.ctx = ctx;
	  this.game = game;
	  this.cellSize = cellSize;
	  this.horCells = GameView.DIM_X/ this.cellSize;
	  this.verCells = GameView.DIM_Y/ this.cellSize;
	  this.bindListener();
	};
	
	GameView.DIM_X = 520;
	GameView.DIM_Y = 520;
	
	GameView.prototype.bindListener = function(){
	  this.canvas.addEventListener('click', this.handleClick.bind(this));
	};
	
	GameView.prototype.handleClick = function(e){
	  // Get the canvas coordinates
	  var canvasDim = this.canvas.getBoundingClientRect();
	  //Distance from left of canvas
	  var horCellNum = Math.floor((e.pageX - canvasDim.left)/ this.cellSize);
	  //Distance from top of canvas
	  var verCellNum = Math.floor((e.pageY - canvasDim.top)/ this.cellSize);
	  var cellCoord = [horCellNum* this.cellSize, verCellNum * this.cellSize];
	  this.game.drawColony(this.ctx, cellCoord ,this.cellSize);
	};
	
	GameView.prototype.draw = function(){
	  this.ctx.clearRect(0, 0, GameView.DIM_X, GameView.DIM_Y);
	  this.ctx.fillStyle = 'grey';
	  this.ctx.fillRect(0, 0, GameView.DIM_X, GameView.DIM_Y);
	};
	
	GameView.prototype.drawGridLines = function() {
	  // Draw the grid
	  //padding around grid
	  var bw = GameView.DIM_X;
	  var bh = GameView.DIM_Y;
	  //size of canvas
	  var cw = bw + 1;
	  var ch = bh + 1;
	  // Vertical lines
	  this.ctx.strokeStyle = "black";
	  this.ctx.lineWidth = 1.3;
	  for (var x = 0; x <= bw; x += this.cellSize) {
	      this.ctx.moveTo(x, 0);
	      this.ctx.lineTo(x, bh);
	      this.ctx.stroke();
	  }
	 // Horizontal lines
	  for (x = 0; x <= bh; x += this.cellSize) {
	      this.ctx.moveTo(0, x);
	      this.ctx.lineTo(bw, x);
	      this.ctx.stroke();
	  }
	  return;
	};
	
	GameView.prototype.start = function () {
	  this.draw();
	  this.drawGridLines();
	};
	
	module.exports = GameView;
	window.GameView = GameView;


/***/ },
/* 4 */
/***/ function(module, exports) {

	
	var MenuBar = function(game, gv){
	  this.game = game;
	  this.gameView = gv;
	  this.getButtonRefs();
	  this.addButtonListeners();
	};
	MenuBar.prototype.getButtonRefs = function(){
	  this.startGOL = document.getElementById('start-button');
	  this.stopGOL = document.getElementById('stop-button');
	  this.resetGOL = document.getElementById('reset-button');
	  this.stepGOL = document.getElementById('step-button');
	};
	
	MenuBar.prototype.addButtonListeners = function(){
	  this.startGOL.addEventListener('click', this.startGame.bind(this));
	  this.stopGOL.addEventListener('click', this.stopGame.bind(this));
	  this.resetGOL.addEventListener('click', this.resetGame.bind(this));
	  this.stepGOL.addEventListener('click', this.stepGame.bind(this));
	};
	
	MenuBar.prototype.startGame = function(){
	    this.gameRun = setInterval(this.game.step.bind(this.game), 300);
	};
	MenuBar.prototype.stopGame = function(){
	  clearInterval(this.gameRun);
	};
	
	MenuBar.prototype.resetGame = function(){
	  if (this.gameRun){
	    console.log("stoppping the asynchronous callback");
	    clearInterval(this.gameRun);
	  }
	  this.game.reset();
	};
	MenuBar.prototype.stepGame = function(){
	  this.game.step();
	};
	module.exports = MenuBar;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map