function HTMLActuator() {
 this.tileContainer    = document.querySelector(".tile-container");
 this.scoreContainer   = document.querySelector(".score-container");
 this.bestContainer    = document.querySelector(".best-container");
 this.messageContainer = document.querySelector(".game-message");
 this.sharingContainer = document.querySelector(".score-sharing");

 this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
 var self = this;

 window.requestAnimationFrame(function () {
   self.clearContainer(self.tileContainer);

   grid.cells.forEach(function (column) {
     column.forEach(function (cell) {
       if (cell) {
         self.addTile(cell);
       }
     });
   });

   self.updateScore(metadata.score);
   self.updateBestScore(metadata.bestScore);

   if (metadata.terminated) {
     if (metadata.over) {
       self.message(false); // You lose
     } else if (metadata.won) {
       self.message(true); // You win!
     }
   }

 });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
 if (typeof ga !== "undefined") {
   ga("send", "event", "game", "restart");
 }

 this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
 while (container.firstChild) {
   container.removeChild(container.firstChild);
 }
};

HTMLActuator.prototype.addTile = function (tile) {
 var text=new Array(22);
 text[0] = " ";
 text[1] = "Euclid";
 text[2] = "Fermat";
 text[3] = "Newton";
 text[4] = "Euler";
 text[5] = "Gauss";
 text[6] = "Galois";
 text[7] = "Cantor";
 text[8] = "Hilbert";
 text[9] = "Noether";
 text[10] = "Erdos";
 text[11] = "Tao";
 text[12] = "Erdos";
 text[13] = "Noether";
 text[14] = "Hilbert";
 text[15] = "Cantor";
 text[16] = "Galois";
 text[17] = "Gauss";
 text[18] = "Euler";
 text[19] = "Newton";
 text[20] = "Fermat";
 text[21] = "Euclid";
 var self = this;
 var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }
 var wrapper   = document.createElement("div");
 var inner     = document.createElement("div");
 var position  = tile.previousPosition || { x: tile.x, y: tile.y };
 var positionClass = this.positionClass(position);

 // We can't use classlist because it somehow glitches when replacing classes
 var classes = ["tile", "tile-" + tile.value, positionClass];

 if (tile.value > 524288) classes.push("tile-super");

 this.applyClasses(wrapper, classes);

 inner.classList.add("tile-inner");
 inner.innerHTML = text[text2(tile.value)];

 if (tile.previousPosition) {
   // Make sure that the tile gets rendered in the previous position first
   window.requestAnimationFrame(function () {
     classes[2] = self.positionClass({ x: tile.x, y: tile.y });
     self.applyClasses(wrapper, classes); // Update the position
   });
 } else if (tile.mergedFrom) {
   classes.push("tile-merged");
   this.applyClasses(wrapper, classes);

   // Render the tiles that merged
   tile.mergedFrom.forEach(function (merged) {
     self.addTile(merged);
   });
 } else {
   classes.push("tile-new");
   this.applyClasses(wrapper, classes);
 }

 // Add the inner part of the tile to the wrapper
 wrapper.appendChild(inner);

 // Put the tile on the board
 this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
 element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
 return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
 position = this.normalizePosition(position);
 return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
 this.clearContainer(this.scoreContainer);

 var difference = score - this.score;
 this.score = score;

 this.scoreContainer.textContent = this.score;

 if (difference > 0) {
   var addition = document.createElement("div");
   addition.classList.add("score-addition");
   addition.textContent = "+" + difference;

   this.scoreContainer.appendChild(addition);
 }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
 this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
 var random1 = Math.floor((Math.random() * ((2 + 1) - 0)) + 0);
 var random2 = Math.floor((Math.random() * ((1 + 1) - 0)) + 0);

 var mytxt1=new Array(3);
 mytxt1[0]="Maybe you'll become the next great mathematician!";
 mytxt1[1]="You may be the next great mathematician!";
 mytxt1[2]="Congratulations! Even Gauss couldn't win this game!";

 var mytxt2=new Array(2);
 mytxt2[0]="Great mathematicians often fail many times before succeeding!";
 mytxt2[1]="Great mathematicians don't easily give up!";

 var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
 var type    = won ? "game-won" : "game-over";
 var message = won ? mytxt1[random1] : mytxt2[random2];

 if (typeof ga !== "undefined") {
   ga("send", "event", "game", "end", type, this.score);
 }

 this.messageContainer.classList.add(type);
 this.messageContainer.getElementsByTagName("p")[0].textContent = message;

 this.clearContainer(this.sharingContainer);
 this.sharingContainer.appendChild(this.scoreTweetButton());
 twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
 // IE only takes one value to remove at a time.
 this.messageContainer.classList.remove("game-won");
 this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
 var tweet = document.createElement("a");
 tweet.classList.add("twitter-share-button");
 tweet.setAttribute("href", "https://twitter.com/share");
 tweet.setAttribute("data-via", "imo2016");
 tweet.setAttribute("data-url", " http://goo.gl/cHklbr");
 tweet.setAttribute("data-counturl", " http://goo.gl/cHklbr");
 tweet.textContent = "Tweet";

 var text = "I scored " + this.score + " points in 2048 Mathematicians edition, a game where you " +
            "join numbers to score high! #imo2016";
 tweet.setAttribute("data-text", text);

 return tweet;
};
