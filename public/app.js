const icon_url = "https://services.runescape.com/m=itemdb_oldschool/obj_big.gif?id="
let itemsData = {};
let usedIds = new Set();
let leftItem = null;
let rightItem = null;
let score = 0;

async function getRandomItem() {
  const res = await fetch('/api/randomItem');
  const item = await res.json();
  return item;
}

function displayItems() {
  document.getElementById("left-img").src = `${icon_url}${leftItem.id}`;
  document.getElementById("left-name").textContent = leftItem.name;
  document.getElementById("left-price").textContent = `${leftItem.price.toLocaleString()} gp`;

  document.getElementById("right-img").src = `${icon_url}${rightItem.id}`;
  document.getElementById("right-name").textContent = rightItem.name;
}

async function makeGuess(guess) {
  const actual = rightItem.price > leftItem.price ? 'higher' : 'lower';

  if (guess === actual || rightItem.price === leftItem.price) {
    ++score;
    leftItem = rightItem;
    rightItem = await getRandomItem();
    displayItems();
    document.getElementById("result").textContent = "Correct!";
    document.getElementById("score").textContent = `Score: ${score}`;
  } else {
    document.getElementById("result").textContent = `Game Over! The price was ${rightItem.price.toLocaleString()} gp.`;
    document.getElementById("buttons").style.display = "none";
  }
}

async function startGame() {
  leftItem = await getRandomItem();
  rightItem = await getRandomItem();
  displayItems();
}

window.onload = startGame;
