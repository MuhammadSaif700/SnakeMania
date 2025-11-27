// Game Constants & Variables
let inputDir = { x: 0, y: 0 };
const foodSound = new Audio("music/food.mp3");
const gameOverSound = new Audio("music/gameover.mp3");
const moveSound = new Audio("music/move.mp3");
const musicSound = new Audio("music/music.mp3");
let speed = 8;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{ x: 13, y: 15 }];
let food = { x: 6, y: 7 };
let hiscoreval = 0;

// Color array for food and snake segments
const foodColors = [
  { name: "red", food: "food-red", segment: "segment-red" },
  { name: "orange", food: "food-orange", segment: "segment-orange" },
  { name: "yellow", food: "food-yellow", segment: "segment-yellow" },
  { name: "lime", food: "food-lime", segment: "segment-lime" },
  { name: "green", food: "food-green", segment: "segment-green" },
  { name: "teal", food: "food-teal", segment: "segment-teal" },
  { name: "cyan", food: "food-cyan", segment: "segment-cyan" },
  { name: "skyblue", food: "food-skyblue", segment: "segment-skyblue" },
  { name: "blue", food: "food-blue", segment: "segment-blue" },
  { name: "indigo", food: "food-indigo", segment: "segment-indigo" },
  { name: "purple", food: "food-purple", segment: "segment-purple" },
  { name: "violet", food: "food-violet", segment: "segment-violet" },
  { name: "magenta", food: "food-magenta", segment: "segment-magenta" },
  { name: "pink", food: "food-pink", segment: "segment-pink" },
  { name: "hotpink", food: "food-hotpink", segment: "segment-hotpink" },
  { name: "coral", food: "food-coral", segment: "segment-coral" },
  { name: "gold", food: "food-gold", segment: "segment-gold" },
  { name: "turquoise", food: "food-turquoise", segment: "segment-turquoise" },
  { name: "mint", food: "food-mint", segment: "segment-mint" },
  { name: "lavender", food: "food-lavender", segment: "segment-lavender" },
];

// Current food color
let currentFoodColor =
  foodColors[Math.floor(Math.random() * foodColors.length)];

// Array to store colors for each snake segment
let segmentColors = [];

// Get high score from localStorage
let hiscoreFromStorage = localStorage.getItem("hiscore");
if (hiscoreFromStorage === null) {
  hiscoreval = 0;
  localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
} else {
  hiscoreval = JSON.parse(hiscoreFromStorage);
  document.getElementById("hiscoreBox").innerHTML = "HiScore: " + hiscoreval;
}

// Game Functions
function main(ctime) {
  window.requestAnimationFrame(main);
  // console.log(ctime)
  if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
    return;
  }
  lastPaintTime = ctime;
  gameEngine();
}

function isCollide(snake) {
  // If you bump into yourself
  for (let i = 1; i < snakeArr.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      return true;
    }
  }
  // If you bump into the wall
  if (
    snake[0].x >= 18 ||
    snake[0].x <= 0 ||
    snake[0].y >= 18 ||
    snake[0].y <= 0
  ) {
    return true;
  }

  return false;
}

function gameEngine() {
  // Part 1: Updating the snake array & Food
  if (isCollide(snakeArr)) {
    gameOverSound.play();
    musicSound.pause();
    inputDir = { x: 0, y: 0 };
    alert("Game Over. Press any key to play again!");
    snakeArr = [{ x: 13, y: 15 }];
    segmentColors = []; // Reset segment colors
    currentFoodColor =
      foodColors[Math.floor(Math.random() * foodColors.length)]; // New random food color
    musicSound.play();
    score = 0;
    document.getElementById("scoreBox").innerHTML = "Score: " + score;
  }

  // If you have eaten the food, increment the score and regenerate the food
  if (snakeArr[0].y === food.y && snakeArr[0].x === food.x) {
    foodSound.play();
    score += 1;
    if (score > hiscoreval) {
      hiscoreval = score;
      localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
      document.getElementById("hiscoreBox").innerHTML =
        "HiScore: " + hiscoreval;
    }
    document.getElementById("scoreBox").innerHTML = "Score: " + score;

    // Add new segment with the color of the eaten food
    snakeArr.unshift({
      x: snakeArr[0].x + inputDir.x,
      y: snakeArr[0].y + inputDir.y,
    });

    // Store the color of the eaten food for the new segment
    segmentColors.unshift(currentFoodColor.segment);

    // Generate new food position
    let a = 2;
    let b = 16;
    food = {
      x: Math.round(a + (b - a) * Math.random()),
      y: Math.round(a + (b - a) * Math.random()),
    };

    // Change food to a new random color
    currentFoodColor =
      foodColors[Math.floor(Math.random() * foodColors.length)];
  }

  // Moving the snake
  for (let i = snakeArr.length - 2; i >= 0; i--) {
    snakeArr[i + 1] = { ...snakeArr[i] };
  }

  snakeArr[0].x += inputDir.x;
  snakeArr[0].y += inputDir.y;

  // Part 2: Display the snake and Food
  // Display the snake
  const board = document.getElementById("board");
  board.innerHTML = "";
  snakeArr.forEach((e, index) => {
    let snakeElement = document.createElement("div");
    snakeElement.style.gridRowStart = e.y;
    snakeElement.style.gridColumnStart = e.x;

    if (index === 0) {
      snakeElement.classList.add("head");
    } else {
      // Add color class based on the color of food eaten
      snakeElement.classList.add("snake");
      if (segmentColors[index - 1]) {
        snakeElement.classList.add(segmentColors[index - 1]);
      } else {
        snakeElement.classList.add("segment-green"); // default color
      }
    }
    board.appendChild(snakeElement);
  });

  // Display the food with current color
  let foodElement = document.createElement("div");
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add("food");
  foodElement.classList.add(currentFoodColor.food);
  board.appendChild(foodElement);
}

// Main logic starts here
musicSound.play();

window.requestAnimationFrame(main);
window.addEventListener("keydown", (e) => {
  inputDir = { x: 0, y: 1 }; // Start the game
  moveSound.play();
  switch (e.key) {
    case "ArrowUp":
      console.log("ArrowUp");
      inputDir.x = 0;
      inputDir.y = -1;
      break;

    case "ArrowDown":
      console.log("ArrowDown");
      inputDir.x = 0;
      inputDir.y = 1;
      break;

    case "ArrowLeft":
      console.log("ArrowLeft");
      inputDir.x = -1;
      inputDir.y = 0;
      break;

    case "ArrowRight":
      console.log("ArrowRight");
      inputDir.x = 1;
      inputDir.y = 0;
      break;
    default:
      break;
  }
});
