const gameContainer = document.querySelector(".game-container");
const inputContainer = document.querySelector(".input-container");
const form = document.getElementById("setupForm");
const rows = document.querySelectorAll(".game-row");
const cells = document.querySelectorAll(".game-cell");
const resetButton = document.querySelector("#resetButton");
const message = document.querySelector("#message");
const overlay = document.querySelector("#overlay");
const modal = document.querySelector("#modal");

const gameBoard = (() => {
  let _board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  const getBoard = () => _board;
  const resetBoard = () => {
    _board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  };
  const registerMove = (row, cell, symbol) => {
    if (!_board[row][cell]) {
      _board[row][cell] = symbol;
      return true;
    } else {
      return false;
    }
  };
  return { getBoard, registerMove, resetBoard };
})();

const playerFactory = (symbol, name, color) => {
  const getName = () => name;
  const getSymbol = () => symbol;
  const getColor = () => color;
  const move = (row, cell) => gameBoard.registerMove(row, cell, symbol);

  return { getName, getSymbol, getColor, move };
};

const displayController = (() => {
  let player1;
  let player2;
  let round = 0;

  const startGame = (e) => {
    e.preventDefault();

    const formData = {
      player1Name: document.getElementById("playerName1").value,
      player1Color: document.getElementById("playerColor1").value,
      player2Name: document.getElementById("playerName2").value,
      player2Color: document.getElementById("playerColor2").value,
    };

    function convertToRGB(value) {
      value = value.slice(1);
      let hexSplit = value.match(/.{1,2}/g);
      var rgbArray = [
        parseInt(hexSplit[0], 16),
        parseInt(hexSplit[1], 16),
        parseInt(hexSplit[2], 16),
      ];
      console.log(rgbArray);
      return rgbArray;
    }

    if (formData.player1Name && formData.player2Name) {
      player1 = playerFactory(
        "X",
        formData.player1Name,
        convertToRGB(formData.player1Color)
      );
      player2 = playerFactory(
        "O",
        formData.player2Name,
        convertToRGB(formData.player2Color)
      );
      _toggleContainers();
    }
  };

  const _toggleContainers = () => {
    gameContainer.classList.toggle("hidden");
    inputContainer.classList.toggle("hidden");
  };

  const restartGame = () => {
    gameBoard.resetBoard();
    round = 0;
    player1 = undefined;
    player2 = undefined;
    _toggleContainers();
    _updateDisplay();
    cells.forEach((cell) => {
      cell.removeAttribute("style");
      cell.classList.remove("selected");
    });
  };

  const captureMove = (e) => {
    const row = e.target.dataset.row;
    const cell = e.target.dataset.cell;

    const playFunction = ({ getColor, move, getName, getSymbol }) => {
      const rgbArray = getColor();
      if (move(row, cell)) {
        round++;
        [red, green, blue] = rgbArray;
        e.target.classList.add("selected");
        e.target.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 0.3)`;
      }
      _updateDisplay();
      _checkVictory(getName(), getSymbol(), round, rgbArray);
    };

    if (round % 2 === 0) {
      playFunction(player1);
    } else {
      playFunction(player2);
    }
  };

  const _checkVictory = (name, symbol, round, rgbArray) => {
    const board = gameBoard.getBoard();
    let status = false;

    for (let i = 0; i < board.length; i++) {
      if (
        board[i][0] === board[i][1] &&
        board[i][1] === board[i][2] &&
        board[i][0] === symbol
      ) {
        status = true;
        break;
      }
      if (
        board[0][i] === board[1][i] &&
        board[1][i] === board[2][i] &&
        board[0][i] === symbol
      ) {
        status = true;
        break;
      }
    }
    if (
      (board[0][0] === board[1][1] &&
        board[1][1] === board[2][2] &&
        board[1][1] === symbol) ||
      (board[0][2] === board[1][1] &&
        board[1][1] === board[2][0] &&
        board[1][1] === symbol)
    ) {
      status = true;
    }

    if (status) {
      [red, green, blue] = rgbArray;
      message.textContent = `Congratulations to ${name}! You won!`;
      message.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, 1)`;
      modal.classList.remove("hidden");
      overlay.classList.remove("hidden");
      restartGame();
    }
    if (round === 9 && !status) {
      message.textContent = `Tie`;
      message.style.backgroundColor = "white";
      modal.classList.remove("hidden");
      overlay.classList.remove("hidden");
      restartGame();
    }
  };

  const _updateDisplay = () => {
    gameBoard.getBoard().forEach((row, indexOfRow) => {
      const selectedRow = rows[indexOfRow].querySelectorAll(".game-cell");
      row.forEach((cell, indexOfCell) => {
        selectedRow[indexOfCell].textContent = cell;
      });
    });
  };

  return { captureMove, startGame, restartGame };
})();

cells.forEach((cell) => {
  cell.addEventListener("click", displayController.captureMove);
});

form.addEventListener("submit", displayController.startGame);

resetButton.addEventListener("click", displayController.restartGame);

overlay.addEventListener("click", () => {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
});
