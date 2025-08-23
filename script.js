const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 70;

let drawing = false;
let brushColor = localStorage.getItem('drawColor') || '#000000';
let brushSize = parseInt(localStorage.getItem('drawSize')) || 5;

ctx.strokeStyle = brushColor;
ctx.lineWidth = brushSize;
ctx.lineCap = 'round';

let paths = [];
let currentPath = [];
let undonePaths = [];

// Get position for both mouse & touch
function getPos(e) {
  if (e.touches && e.touches.length > 0) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY - 70
    };
  }
  return {
    x: e.clientX,
    y: e.clientY - 70
  };
}

function start(e) {
  drawing = true;
  currentPath = [];
  draw(e);
  e.preventDefault();
}

function draw(e) {
  if (!drawing) return;

  const { x, y } = getPos(e);
  ctx.lineTo(x, y);
  ctx.stroke();

  currentPath.push({ x, y, color: ctx.strokeStyle, size: ctx.lineWidth });
  e.preventDefault();
}

function end() {
  if (!drawing) return;
  drawing = false;
  ctx.beginPath();
  if (currentPath.length > 0) {
    paths.push([...currentPath]);
    undonePaths = [];
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(path => {
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const point = path[i];
      ctx.strokeStyle = point.color;
      ctx.lineWidth = point.size;
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
    ctx.beginPath();
  });
}

function undo() {
  if (paths.length === 0) return;
  undonePaths.push(paths.pop());
  redraw();
}

function redo() {
  if (undonePaths.length === 0) return;
  paths.push(undonePaths.pop());
  redraw();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths = [];
  undonePaths = [];
}

document.getElementById('colorPicker').value = brushColor;
document.getElementById('colorPicker').oninput = (e) => {
  ctx.strokeStyle = e.target.value;
};

document.getElementById('brushSize').value = brushSize;
document.getElementById('brushSize').oninput = (e) => {
  ctx.lineWidth = e.target.value;
  document.getElementById('sizeDisplay').textContent = e.target.value;
};

// Personalized Title
const name = localStorage.getItem('drawName');
document.getElementById('drawTitle').textContent = name ? `${name}'s Drawing Time` : "Drawing Time";

// Apply Dark Mode
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Mouse events
canvas.addEventListener('mousedown', start);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', end);
canvas.addEventListener('mouseout', end);

// Touch events for mobile
canvas.addEventListener('touchstart', start, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', end);
