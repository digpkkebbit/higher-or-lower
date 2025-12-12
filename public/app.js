const getWikiFileURL = (id) => `https://chisel.weirdgloop.org/static/img/osrs-dii/${id}.png`

const leftImgElem = document.getElementById("left-img");
const leftNameElem = document.getElementById("left-name");
const leftPriceElem = document.getElementById("left-price");

const rightImgElem = document.getElementById("right-img");
const rightNameElem = document.getElementById("right-name");

const resultElem = document.getElementById("result");
const scoreElem = document.getElementById("score");
const buttonsElem = document.getElementById("buttons");

let leftItem = null;
let rightItem = null;

const scoreCounter = () => {
  let score = 0;
  return () => ++score;
};

const score = scoreCounter();

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

async function makeGuess(guess) {
  const actual = rightItem.price > leftItem.price ? 'higher' : 'lower';

  if (guess === actual || rightItem.price === leftItem.price) {
    leftItem = rightItem;
    rightItem = await getRandomItem();
    displayItems();
    resultElem.textContent = "Correct!";
    scoreElem.textContent = `Score: ${score()}`;
  } else {
    resultElem.textContent = `Game Over! The price was ${rightItem.price.toLocaleString()} gp.`;
    buttonsElem.style.display = "none";
  }
}

async function startGame() {
  leftItem = await getRandomItem();
  rightItem = await getRandomItem();
  displayItems();
}

window.onload = startGame;
