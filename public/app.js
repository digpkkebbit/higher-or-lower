const HIGHSCORE_KEY = "highscore";
const getWikiFileURL = (id) => `https://chisel.weirdgloop.org/static/img/osrs-dii/${id}.png`

const waitForEvent = (element, event) => {
  return new Promise(resolve => {
    element.addEventListener(event, resolve, { once: true });
  });
}

//const waitForTransition = element => waitForEvent(element, "transitionend");
const waitForAnimation = element => waitForEvent(element, "animationend");

// Wait for an <img> element to finish loading
function waitForImage(img) {
  return new Promise(resolve => {
    if (img.complete && img.naturalWidth !== 0) {
      resolve();
    } else {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    }
  });
}

const getHighscore = () => Number(localStorage.getItem(HIGHSCORE_KEY)) || 0;
const setHighscore = value => localStorage.setItem(HIGHSCORE_KEY, value);
const updateHighscore = (score) => {
  const highscore = getHighscore();
  if (score > highscore) {
    setHighscore(score);
    return score;
  }
  return highscore;
}

const leftItemElem = document.getElementById("left-item");
const leftImgElem = document.getElementById("left-img");
const leftNameElem = document.getElementById("left-name");
const leftPriceElem = document.getElementById("left-price");

const rightItemElem = document.getElementById("right-item");
const rightImgElem = document.getElementById("right-img");
const rightNameElem = document.getElementById("right-name");

const resultElem = document.getElementById("result");
const scoreElem = document.getElementById("score");
const highscoreElem = document.getElementById("highscore");
const buttonsElem = document.getElementById("buttons");

const higherBtn = document.getElementById("higher-btn");
const lowerBtn = document.getElementById("lower-btn");

const overlay = document.getElementById("gameover-overlay");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

restartBtn.addEventListener("click", restartGame);
higherBtn.addEventListener("click", () => makeGuess("higher"));
lowerBtn.addEventListener("click", () => makeGuess("lower"));

let leftItem = null;
let rightItem = null;

const score = (() => {
  let value = 0;
  return {
    increment() {
      return ++value;
    },
    get() {
      return value;
    },
    reset() {
      value = 0;
      return value;
    }
  };
})();

async function getRandomItem() {
  const res = await fetch('/api/randomItem');
  if (!res.ok) throw new Error("Failed to fetch item");
  return await res.json();
}

async function displayItems() {
  leftImgElem.src = "";
  leftImgElem.src = getWikiFileURL(leftItem.id);
  leftNameElem.textContent = leftItem.name;
  leftPriceElem.textContent = `${leftItem.price.toLocaleString()} gp`;

  rightItemElem.classList.add("hidden");
  rightImgElem.src = "";
  rightImgElem.src = getWikiFileURL(rightItem.id);
  rightNameElem.textContent = rightItem.name;
  await waitForImage(rightImgElem);
  rightItemElem.classList.remove("hidden");

  // Remove pop-in animation after first load
  if (score.get() === 0) {
    await waitForAnimation(leftItemElem);
    leftItemElem.classList.remove("animate");
  }
}

function displayScores(score) {
  scoreElem.textContent = `Score: ${score}`;
  highscoreElem.textContent = `Highscore: ${getHighscore()}`;
}

async function makeGuess(guess) {
  const actual = rightItem.price > leftItem.price ? 'higher' : 'lower';

  if (guess === actual || rightItem.price === leftItem.price) {
    const currentScore = score.increment();
    updateHighscore(currentScore);
    displayScores(currentScore);

    buttonsElem.classList.add("no-display");
    resultElem.textContent = `${rightItem.price.toLocaleString()} gp`;
    resultElem.classList.remove("no-display");
    resultElem.classList.add("animate");

    await waitForAnimation(resultElem);

    // Slide items
    leftItemElem.classList.add("slide-left");
    rightItemElem.classList.add("slide-right");

    await Promise.all([
      waitForAnimation(leftItemElem),
      waitForAnimation(rightItemElem)
    ]);

    // Swap items
    leftItem = rightItem;
    rightItem = await getRandomItem();

    leftItemElem.classList.remove("slide-left");
    rightItemElem.classList.remove("slide-right");

    // Wait for next animation frame
    await new Promise(requestAnimationFrame);
    await displayItems();

    resultElem.classList.add("no-display");
    buttonsElem.classList.remove("no-display");
  } else {
    resultElem.textContent = `${rightItem.price.toLocaleString()} gp`;
    buttonsElem.classList.add("no-display");
    resultElem.classList.remove("no-display");
    resultElem.classList.add("animate");
    await waitForAnimation(resultElem);
    showGameOver(score.get());
  }
}

function showGameOver(score) {
  finalScore.textContent = score;
  overlay.classList.remove("hidden");
}

function restartGame() {
  overlay.classList.add("hidden");
  buttonsElem.classList.remove("no-display");
  resultElem.classList.add("no-display");
  resultElem.classList.remove("animate");
  score.reset();
  startGame();
}

async function startGame() {
  leftItem = await getRandomItem();
  rightItem = await getRandomItem();
  displayItems();
  displayScores(0);
}

window.onload = startGame;
