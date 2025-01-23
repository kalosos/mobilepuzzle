const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficulty");
const imageSelect = document.getElementById("imageSelect");

let ROWS = 4, COLS = 4;
let pieces = [];
let pieceWidth, pieceHeight;
let draggingPiece = null;
let offsetX, offsetY;
let snapTolerance = 10;
let highlightedPiece = null;
let timerInterval;
let timeLeft = 60;

const images = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg"
];
let currentImageIndex = 0;
const image = new Image();

image.src = images[currentImageIndex];

image.onload = () => {
  canvas.width = Math.min(window.innerWidth*0.9, image.width);
  canvas.height = canvas.width * (image.height / image.width);
  drawPlaceholder();
};

startBtn.addEventListener("click", () => {
  const difficulty = parseInt(difficultySelect.value);
  ROWS = COLS = difficulty;
  setupGame();
  startTimer();
});

imageSelect.addEventListener("change", () => {
  currentImageIndex = parseInt(imageSelect.value);
  image.src = images[currentImageIndex];
});

function setupGame() {
  pieces = [];
  pieceWidth = canvas.width / COLS;
  pieceHeight = canvas.height / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const correctX = col * pieceWidth;
      const correctY = row * pieceHeight;
      const currentX = Math.random() * (canvas.width - pieceWidth);
      const currentY = Math.random() * (canvas.height - pieceHeight);

      pieces.push({
        x: correctX,
        y: correctY,
        correctX: correctX,
        correctY: correctY,
        currentX: currentX,
        currentY: currentY,
      });
    }
  }

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("mousemove", dragPiece);
  canvas.addEventListener("mouseup", dropPiece);

  canvas.addEventListener("touchstart", startDrag, { passive: false });
  canvas.addEventListener("touchmove", dragPiece, { passive: false });
  canvas.addEventListener("touchend", dropPiece);

  drawPieces();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  updateTimer();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('время вышло!');
      resetGame();
    }
  }, 1000);
}

function updateTimer() {
  document.getElementById('timer').textContent = `время: ${timeLeft}`;
}

function resetGame() {
  document.getElementById('canvas').innerHTML = '';
}

function drawPlaceholder() {
  ctx.fillStyle = "#ddd";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#333";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
}

function drawPieces() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(piece => {
    ctx.strokeStyle = highlightedPiece === piece ? "#ff0000" : "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(piece.currentX, piece.currentY, pieceWidth, pieceHeight);
    ctx.drawImage(
      image,
      piece.correctX,
      piece.correctY,
      pieceWidth,
      pieceHeight,
      piece.currentX,
      piece.currentY,
      pieceWidth,
      pieceHeight
    );
  });
}

function startDrag(e) {
  const { offsetX: mouseX, offsetY: mouseY } = getMousePosition(e);

  highlightedPiece = pieces.find(piece =>
    mouseX > piece.currentX &&
    mouseX < piece.currentX + pieceWidth &&
    mouseY > piece.currentY &&
    mouseY < piece.currentY + pieceHeight
  );

  if (highlightedPiece) {
    draggingPiece = highlightedPiece;
    offsetX = mouseX - draggingPiece.currentX;
    offsetY = mouseY - draggingPiece.currentY;
  }

  e.preventDefault();
}

function dragPiece(e) {
  if (draggingPiece) {
    const { offsetX: mouseX, offsetY: mouseY } = getMousePosition(e);
    draggingPiece.currentX = mouseX - offsetX;
    draggingPiece.currentY = mouseY - offsetY;
    drawPieces();
  }

  e.preventDefault();
}

function dropPiece() {
  if (draggingPiece) {
    const snapX = Math.round(draggingPiece.currentX / pieceWidth) * pieceWidth;
    const snapY = Math.round(draggingPiece.currentY / pieceHeight) * pieceHeight;

    if (Math.abs(draggingPiece.currentX - snapX) < snapTolerance &&
        Math.abs(draggingPiece.currentY - snapY) < snapTolerance) {
      draggingPiece.currentX = snapX;
      draggingPiece.currentY = snapY;
    }

    draggingPiece = null;
    highlightedPiece = null;
    drawPieces();
    checkWin();
  }
}

function checkWin() {
  const isWin = pieces.every(piece => {
    return piece.currentX === piece.correctX && piece.currentY === piece.correctY;
  });

  if (isWin) {
    clearInterval(timerInterval);
    alert("Поздравляем! Вы собрали пазл!");
  }
}

function getMousePosition(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : null;
  const x = touch ? touch.clientX - rect.left : e.clientX - rect.left;
  const y = touch ? touch.clientY - rect.top : e.clientY - rect.top;
  return { offsetX: x, offsetY: y };
}