// Updated script.js - level progression system with increasing grid size and monsters

let gridSize = 5;
let robotPosition = [4, 0];
let lives = 3;
let challengeTiles = [];
let goalTile = [];
let monsters = [];

const levels = [
  { gridSize: 5, matrixSize: 2, monsters: 3 },
  { gridSize: 6, matrixSize: 3, monsters: 3 },
  { gridSize: 10, matrixSize: 4, monsters: 6 }
];
let currentLevel = 0;

const matrixChallenges = [
  { a: 2, b: 3, c: 1, d: 4, det: 5 },
  { a: 5, b: 2, c: 3, d: 1, det: -1 },
  { a: 6, b: 1, c: 2, d: 2, det: 10 },
  { a: 4, b: 5, c: 2, d: 3, det: 2 },
  { a: 1, b: 2, c: 3, d: 4, det: -2 },
  { a: 3, b: 3, c: 2, d: 1, det: -3 },
  { a: 7, b: 5, c: 4, d: 6, det: 22 }
];

function assignChallengeTiles() {
  challengeTiles = [];
  for (let i = 0; i < 7; i++) {
    challengeTiles.push(getRandomTile(challengeTiles));
  }
}

function assignMonsters(count) {
  monsters = [];
  for (let i = 0; i < count; i++) {
    monsters.push(getRandomTile([...challengeTiles, robotPosition, goalTile, ...monsters]));
  }
}

function getRandomTile(exclude = [], fixedRow = null) {
  let row, col;
  do {
    row = fixedRow !== null ? fixedRow : Math.floor(Math.random() * gridSize);
    col = Math.floor(Math.random() * gridSize);
  } while ((row === robotPosition[0] && col === robotPosition[1]) || exclude.some(pos => pos[0] === row && pos[1] === col));
  return [row, col];
}

function assignGoalTile() {
  goalTile = getRandomTile(challengeTiles, 0);
}

function createGrid() {
  const grid = document.getElementById("grid");
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 70px)`;
  grid.innerHTML = "";

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.id = `tile-${row}-${col}`;

      if (row === robotPosition[0] && col === robotPosition[1]) {
        tile.classList.add("robot");
        tile.innerText = "🤖";
      }

      for (let [mRow, mCol] of monsters) {
        if (row === mRow && col === mCol) {
          tile.innerText = "👾";
        }
      }

      for (let [tileR, tileC] of challengeTiles) {
        if (tileR === row && tileC === col && row === robotPosition[0] && col === robotPosition[1]) {
          tile.classList.add("glow");
        }
      }

      if (row === goalTile[0] && col === goalTile[1]) {
        tile.style.backgroundColor = "#00BFFF";
        tile.style.boxShadow = "0 0 10px #00BFFF";
      }

      grid.appendChild(tile);
    }
  }
}

function updateLives() {
  document.getElementById("lives").innerText = `Lives: ${"❤️".repeat(lives)}`;
}

function checkGameOver() {
  for (let [mRow, mCol] of monsters) {
    if (mRow === robotPosition[0] && mCol === robotPosition[1]) {
      setTimeout(() => {
        alert("👾 A monster caught you! Game over.");
        location.reload();
      }, 300);
      return;
    }
  }
  if (lives <= 0) {
    setTimeout(() => {
      alert("Game Over! You've run out of lives.");
      location.reload();
    }, 300);
  }
}

function moveMonstersTowardRobot() {
  for (let i = 0; i < monsters.length; i++) {
    let [mRow, mCol] = monsters[i];
    const [rRow, rCol] = robotPosition;
    if (mRow < rRow) mRow++;
    else if (mRow > rRow) mRow--;
    if (mCol < rCol) mCol++;
    else if (mCol > rCol) mCol--;
    monsters[i] = [mRow, mCol];
  }
}

function showModal(matrix, index) {
  const modal = document.getElementById("matrix-modal");
  const content = document.getElementById("matrix-content");
  const submitBtn = document.getElementById("submit-answer");
  content.innerHTML = `
    <div class="matrix-display">
      <div>[ ${matrix.a}  ${matrix.b} ]</div>
      <div>[ ${matrix.c}  ${matrix.d} ]</div>
    </div>
    <input type="number" id="matrix-answer" placeholder="Enter determinant" />
    <div id="result-message" style="margin-top: 10px;"></div>
  `;
  submitBtn.onclick = function () {
    const userInput = document.getElementById("matrix-answer").value;
    const resultMsg = document.getElementById("result-message");
    if (parseInt(userInput) === matrix.det) {
      resultMsg.textContent = "✅ Correct!";
      resultMsg.style.color = "green";
    } else {
      resultMsg.textContent = "❌ Incorrect. You lost a life.";
      resultMsg.style.color = "red";
      lives--;
      moveMonstersTowardRobot();
      updateLives();
      checkGameOver();
    }
    setTimeout(() => {
      modal.style.display = "none";
      createGrid();
    }, 2000);
  };
  modal.style.display = "block";
}

function advanceLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) {
    alert("🏆 You finished all levels! Game complete.");
    location.reload();
    return;
  }
  gridSize = levels[currentLevel].gridSize;
  robotPosition = [gridSize - 1, 0];
  lives = 3;
  assignChallengeTiles();
  assignGoalTile();
  if (levels[currentLevel].gridSize === 10) {
    assignMonsters(6);
  } else {
    const monsterCount = levels[currentLevel].gridSize === 10 ? 6 : levels[currentLevel].monsters;
  assignMonsters(monsterCount);
  }
  updateLives();
  createGrid();
}

function handleMove(rowOffset, colOffset) {
  const [r, c] = robotPosition;
  const newR = r + rowOffset;
  const newC = c + colOffset;
  if (newR >= 0 && newR < gridSize && newC >= 0 && newC < gridSize) {
    robotPosition = [newR, newC];
    createGrid();
    for (let i = 0; i < challengeTiles.length; i++) {
      const [tileR, tileC] = challengeTiles[i];
      if (tileR === newR && tileC === newC) {
        showModal(matrixChallenges[i], i);
        return;
      }
    }
    if (goalTile[0] === newR && goalTile[1] === newC) {
      const goalMessage = document.createElement("div");
      goalMessage.innerText = "🎉 Level Complete!";
      goalMessage.style.position = "fixed";
      goalMessage.style.top = "40%";
      goalMessage.style.left = "50%";
      goalMessage.style.transform = "translate(-50%, -50%)";
      goalMessage.style.backgroundColor = "white";
      goalMessage.style.border = "2px solid #00BFFF";
      goalMessage.style.padding = "20px";
      goalMessage.style.fontSize = "1.2em";
      goalMessage.style.zIndex = "1001";
      goalMessage.style.borderRadius = "10px";
      document.body.appendChild(goalMessage);
      setTimeout(() => {
        goalMessage.remove();
        advanceLevel();
      }, 2500);
    }
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": handleMove(-1, 0); break;
    case "ArrowDown": handleMove(1, 0); break;
    case "ArrowLeft": handleMove(0, -1); break;
    case "ArrowRight": handleMove(0, 1); break;
  }
});

assignChallengeTiles();
assignGoalTile();
const monsterCount = levels[currentLevel].gridSize === 10 ? 6 : levels[currentLevel].monsters;
  assignMonsters(monsterCount);
updateLives();
createGrid();
