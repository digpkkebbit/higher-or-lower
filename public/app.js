const HIGHSCORE_KEY = "highscore";
const getWikiFileURL = (id) => `https://chisel.weirdgloop.org/static/img/osrs-dii/${id}.png`

const waitForEvent = (element, event) => {
  return new Promise(resolve => {
    element.addEventListener(event, resolve, { once: true });
  });
}

const waitForTransition = element => waitForEvent(element, "transitionend");
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

let leftItem = null;
let rightItem = null;

const score = (() => {
  let value = 0;
  return () => ++value;
})();

async function getRandomItem() {
  const res = await fetch('/api/randomItem');
  return await res.json();
}

function displayItems() {
  leftImgElem.src = getWikiFileURL(leftItem.id);
  leftNameElem.textContent = leftItem.name;
  leftPriceElem.textContent = `${leftItem.price.toLocaleString()} gp`;

  rightImgElem.src = getWikiFileURL(rightItem.id);
  rightNameElem.textContent = rightItem.name;
}

function displayScores(score) {
  scoreElem.textContent = `Score: ${score}`;
  highscoreElem.textContent = `Highscore: ${getHighscore()}`;
}

async function makeGuess(guess) {
  const actual = rightItem.price > leftItem.price ? 'higher' : 'lower';

  if (guess === actual || rightItem.price === leftItem.price) {
    const currentScore = score();
    updateHighscore(currentScore);
    displayScores(currentScore);

    resultElem.textContent = rightItem.price.toLocaleString();
    resultElem.classList.remove("hidden");
    resultElem.classList.add("animate");
    buttonsElem.classList.add("hidden");

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
    displayItems();
    await waitForImage(rightImgElem);

    leftItemElem.classList.remove("slide-left");
    rightItemElem.classList.remove("slide-right");

    resultElem.classList.add("hidden");
    buttonsElem.classList.remove("hidden");
  } else {
    buttonsElem.classList.add("hidden");
    resultElem.classList.remove("hidden");
    resultElem.classList.add("animate");
    resultElem.textContent = `Game Over! The price was ${rightItem.price.toLocaleString()} gp.`;
  }
}

async function startGame() {
  leftItem = await getRandomItem();
  rightItem = await getRandomItem();
  displayItems();
  highscoreElem.textContent = `Highscore: ${getHighscore()}`;
}

window.onload = startGame;
