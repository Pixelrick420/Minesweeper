const board = document.getElementById('board');
const moves = document.querySelector('.moves');
const time = document.querySelector('.time');
const overmsg = document.querySelector('.gameover');
const sizeslider = document.getElementById('gridsize');
const sizedisplay = document.getElementById('sizeval');

let grid = [], flags, timer, start, started = false, gameover = false;
let size = 8, mines = 10;

sizeslider.addEventListener('input', () => {
  size = parseInt(sizeslider.value);
  sizedisplay.textContent = `${size}x${size}`;
  mines = Math.floor(size * size * 0.14); 
  init(); 
});

function init() {
  board.innerHTML = ''; 
  grid = [];
  flags = mines; 
  moves.textContent = `Flags left: ${flags}`;
  start = new Date();
  time.textContent = `Time: 00:00:00`;
  gameover = false;
  overmsg.style.visibility = 'hidden';
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  
  started = false; 

  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) row.push(0);
    grid.push(row);
  }

  let placed = 0;
  while (placed < mines) {
    let x = Math.floor(Math.random() * size);
    let y = Math.floor(Math.random() * size);
    if (grid[x][y] !== -1) {
      grid[x][y] = -1;
      placed++;
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === -1) continue;
      let count = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (i + dx >= 0 && i + dx < size && j + dy >= 0 && j + dy < size && grid[i + dx][j + dy] === -1) {
            count++;
          }
        }
      }
      grid[i][j] = count;
    }
  }

  draw();
}

function draw() {
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`; 
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`; 
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = i;
      cell.dataset.y = j;
      cell.addEventListener('click', click);
      cell.addEventListener('contextmenu', rightclick);
      board.appendChild(cell);
    }
  }
}

function click(e) {
  if (gameover) {
    init(); 
    return;
  }

  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);

  if (!started) {
    start = new Date(); 
    starttimer();
  }

  if (e.target.classList.contains('flagged')) return;

  if (grid[x][y] === -1) {
    over(false);
    return;
  }

  reveal(x, y);
  checkwin();
}

function rightclick(e) {
  e.preventDefault();
  if (gameover) return; 

  const cell = e.target;
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if (cell.classList.contains('revealed')) return;

  if (!cell.classList.contains('flagged') && flags > 0) {
    cell.classList.add('flagged');
    cell.textContent = '🏳️';
    flags--;
  } else if (cell.classList.contains('flagged')) {
    cell.classList.remove('flagged');
    cell.textContent = '';
    flags++;
  }

  moves.textContent = `Flags left: ${flags}`;
}

function reveal(x, y) {
  const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
  if (!cell || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

  cell.classList.add('revealed');
  cell.style.color = 'aliceblue';
  cell.style.backgroundColor = color(grid[x][y]);
  cell.textContent = grid[x][y] > 0 ? grid[x][y] : '';

  if (grid[x][y] === 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (x + dx >= 0 && x + dx < size && y + dy >= 0 && y + dy < size) {
          reveal(x + dx, y + dy);
        }
      }
    }
  }
}

function color(num) {
  switch (num) {
    case 1: return '#A1C5FF';
    case 2: return '#7A9B7F';
    case 3: return '#FFC8A1';
    case 4: return '#8A6ABF';
    case 5: return '#FFA366';
    case 6: return '#00796B';
    case 7: return '#FBC02D';
    case 8: return '#C62828';
    default: return '#222222';
  }
}

function starttimer() {
  started = true;
  timer = setInterval(() => {
    let now = new Date();
    let elapsed = new Date(now - start);

    let minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
    let seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
    let milliseconds = String(Math.floor(elapsed.getMilliseconds() / 10)).padStart(2, '0');

    time.textContent = `Time: ${minutes}:${seconds}:${milliseconds}`;
  }, 10);
}

function checkwin() {  let revealed = document.querySelectorAll('.cell.revealed').length;
  if (revealed === (size * size) - mines) over(true);
}

function over(wonGame) {
  clearInterval(timer);
  overmsg.textContent = wonGame ? 'You won!' : 'Game over!';
  gameover = true;
  overmsg.style.visibility = 'visible';

  if (!wonGame) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === -1) {
          const cell = document.querySelector(`.cell[data-x='${i}'][data-y='${j}']`);
          cell.classList.add('bomb');
          cell.textContent = '💥';
        }
      }
    }
  }
}

init();