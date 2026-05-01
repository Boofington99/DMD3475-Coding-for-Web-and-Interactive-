document.addEventListener("DOMContentLoaded", () => {

  /* =========================
      GAME SETUP
  ========================= */
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 500;
  canvas.height = 500;

  let snake = [];
  let direction = "RIGHT";
  let lastProcessedDirection = "RIGHT"; // Prevents 180-degree turn bug
  let food = {};
  let gameInterval = null;
  let score = 0;

  let players = [];

  /* =========================
      START GAME
  ========================= */
  document.getElementById("startGameBtn").addEventListener("click", startGame);

  function startGame() {
    snake = [{ x: 100, y: 100 }];
    direction = "RIGHT";
    lastProcessedDirection = "RIGHT";
    score = 0;

    document.getElementById("scoreDisplay").textContent = "Score: 0";

    spawnFood();

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 150);
  }

  /* =========================
      GAME LOOP
  ========================= */
  function gameLoop() {
    moveSnake();
    checkCollision();
    draw();
  }

  /* =========================
      MOVEMENT
  ========================= */
  function moveSnake() {
    const head = { ...snake[0] };

    // Update the "last processed" so the keydown listener knows where we actually are
    lastProcessedDirection = direction;

    if (direction === "RIGHT") head.x += 20;
    if (direction === "LEFT") head.x -= 20;
    if (direction === "UP") head.y -= 20;
    if (direction === "DOWN") head.y += 20;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      document.getElementById("scoreDisplay").textContent = "Score: " + score;
      spawnFood();
    } else {
      snake.pop();
    }
  }

  /* =========================
      DRAW GAME
  ========================= */
  function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, 20, 20);

    ctx.fillStyle = "lime";
    snake.forEach(part => {
      ctx.fillRect(part.x, part.y, 20, 20);
    });
  }

  /* =========================
      FOOD
  ========================= */
  function spawnFood() {
    food = {
      x: Math.floor(Math.random() * 25) * 20,
      y: Math.floor(Math.random() * 25) * 20
    };
  }

  /* =========================
      COLLISION
  ========================= */
  function checkCollision() {
    const head = snake[0];

    if (
      head.x < 0 || head.x >= canvas.width ||
      head.y < 0 || head.y >= canvas.height
    ) {
      gameOver();
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
      }
    }
  }

  /* =========================
      GAME OVER
  ========================= */
  function gameOver() {
    clearInterval(gameInterval);

    setTimeout(() => {
      const playerName = prompt(`Game Over! Your score: ${score}\nEnter your name:`);

      if (playerName && playerName.trim() !== "") {
        players.push({
          id: Date.now(),
          name: playerName.trim(),
          score: score
        });

        save();
        renderPlayers();
      }
    }, 100);
  }

  /* =========================
      CONTROLS (FIXED WASD)
  ========================= */
  document.addEventListener("keydown", (e) => {
    // Stop snake movement if user is typing in a text box
    if (e.target.tagName === "INPUT") return;

    const key = e.key.toLowerCase();

    // Check against lastProcessedDirection to prevent suicide-turns
    if ((key === "w" || key === "arrowup") && lastProcessedDirection !== "DOWN") direction = "UP";
    if ((key === "s" || key === "arrowdown") && lastProcessedDirection !== "UP") direction = "DOWN";
    if ((key === "a" || key === "arrowleft") && lastProcessedDirection !== "RIGHT") direction = "LEFT";
    if ((key === "d" || key === "arrowright") && lastProcessedDirection !== "LEFT") direction = "RIGHT";
  });

  /* =========================
      PLAYER SYSTEM
  ========================= */
  function save() {
    localStorage.setItem("players", JSON.stringify(players));
  }

  function renderPlayers(filter = "") {
    const list = document.getElementById("playerList");
    if (!list) return;
    list.innerHTML = "";

    players
      .filter(p => p.name.toLowerCase().includes(filter))
      .sort((a, b) => b.score - a.score)
      .forEach(player => {
        const li = document.createElement("li");

        li.innerHTML = `
          ${player.name} - Score: ${player.score}
          <button onclick="deletePlayer(${player.id})">X</button>
          <button onclick="editPlayer(${player.id})">Edit</button>
          <button onclick="addScore(${player.id})">+1</button>
        `;

        list.appendChild(li);
      });
  }

  /* =========================
      ADD PLAYER
  ========================= */
  const addBtn = document.getElementById("addPlayerBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const input = document.getElementById("playerName");

      if (!input.value.trim()) return;

      players.push({
        id: Date.now(),
        name: input.value.trim(),
        score: 0
      });

      input.value = "";

      save();
      renderPlayers();
    });
  }

  /* =========================
      EDIT / DELETE / SCORE
  ========================= */
  window.editPlayer = function (id) {
    const newName = prompt("Enter new name:");
    if (!newName || !newName.trim()) return;

    players = players.map(p =>
      p.id === id ? { ...p, name: newName.trim() } : p
    );

    save();
    renderPlayers();
  };

  window.deletePlayer = function (id) {
    players = players.filter(p => p.id !== id);
    save();
    renderPlayers();
  };

  window.addScore = function (id) {
    players = players.map(p =>
      p.id === id ? { ...p, score: p.score + 1 } : p
    );
    save();
    renderPlayers();
  };

  /* =========================
      SORTING & SEARCH
  ========================= */
  const sortHigh = document.getElementById("sortHigh");
  if (sortHigh) sortHigh.addEventListener("click", () => {
    players.sort((a, b) => b.score - a.score);
    renderPlayers();
  });

  const sortLow = document.getElementById("sortLow");
  if (sortLow) sortLow.addEventListener("click", () => {
    players.sort((a, b) => a.score - b.score);
    renderPlayers();
  });

  const searchBox = document.getElementById("searchBox");
  if (searchBox) searchBox.addEventListener("input", (e) => {
    renderPlayers(e.target.value.toLowerCase());
  });

  const nameInput = document.getElementById("playerName");
  if (nameInput) nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("addPlayerBtn").click();
    }
  });

  /* =========================
      INIT
  ========================= */
  function init() {
    const saved = localStorage.getItem("players");

    if (saved) {
      players = JSON.parse(saved);
    } else {
      loadData();
    }

    renderPlayers();
  }

  async function loadData() {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data = await res.json();

      players = data.map(u => ({
        id: u.id,
        name: u.username,
        score: Math.floor(Math.random() * 100)
      }));

      save();
      renderPlayers();
    } catch (err) {
      console.log("Failed to load external data", err);
    }
  }

  init();

});
function gameOver() {
  clearInterval(gameInterval);

  // =========================
  // SHOW GAME OVER TEXT
  // =========================
  const gameOverText = document.getElementById("gameOverText");
  if (gameOverText) {
    gameOverText.style.display = "block";
  }

  // Optional: highlight leaderboard (right side)
  const leaderboardBox = document.querySelector(".div5");
  if (leaderboardBox) {
    leaderboardBox.classList.add("game-over");
  }

  // =========================
  // DELAY PROMPT (keeps UX smooth)
  // =========================
  setTimeout(() => {
    const playerName = prompt(`Game Over! Your score: ${score}\nEnter your name:`);

    if (playerName && playerName.trim() !== "") {
      players.push({
        id: Date.now(),
        name: playerName.trim(),
        score: score
      });

      save();
      renderPlayers();
    }
  }, 100);
}