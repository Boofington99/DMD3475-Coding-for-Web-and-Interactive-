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
     GAME OVER (IMPROVED UX)
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
     WASD CONTROLS
  ========================= */
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "w" && direction !== "DOWN") direction = "UP";
    if (key === "s" && direction !== "UP") direction = "DOWN";
    if (key === "a" && direction !== "RIGHT") direction = "LEFT";
    if (key === "d" && direction !== "LEFT") direction = "RIGHT";
  });

  /* =========================
     PLAYER SYSTEM
  ========================= */
  function save() {
    localStorage.setItem("players", JSON.stringify(players));
  }

  function renderPlayers(filter = "") {
    const list = document.getElementById("playerList");
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
     ADD PLAYER (CLEANED)
  ========================= */
  document.getElementById("addPlayerBtn").addEventListener("click", () => {
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
     SORTING
  ========================= */
  document.getElementById("sortHigh").addEventListener("click", () => {
    players.sort((a, b) => b.score - a.score);
    renderPlayers();
  });

  document.getElementById("sortLow").addEventListener("click", () => {
    players.sort((a, b) => a.score - b.score);
    renderPlayers();
  });

  /* =========================
     SEARCH
  ========================= */
  document.getElementById("searchBox").addEventListener("input", (e) => {
    renderPlayers(e.target.value.toLowerCase());
  });

  /* =========================
     ENTER KEY SUPPORT
  ========================= */
  document.getElementById("playerName").addEventListener("keydown", (e) => {
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
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await res.json();

    players = data.map(u => ({
      id: u.id,
      name: u.username,
      score: Math.floor(Math.random() * 100)
    }));

    save();
    renderPlayers();
  }

  init();

});