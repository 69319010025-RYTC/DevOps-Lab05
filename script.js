const BOARD_COLUMNS = 4;
const BOARD_ROWS = 5;
const TOTAL_PIECES = BOARD_COLUMNS * BOARD_ROWS;
const IMAGE_PATH = 'velocity-ford-f-250-restomod-1-1671140013.jpg';

const board = document.getElementById('board');
const tray = document.getElementById('tray');
const statusText = document.getElementById('statusText');
const progressText = document.getElementById('progressText');
const restartBtn = document.getElementById('restartBtn');

let pieces = [];
let placedCount = 0;
let isLocked = false;
let audioContext = null;

function ensureAudio() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) {
      audioContext = new AudioCtor();
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function playTone({ frequency, duration = 0.12, type = 'sine', volume = 0.04, sweep = 0 }) {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (sweep) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + sweep), now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playSuccessSound() {
  playTone({ frequency: 540, duration: 0.18, type: 'triangle', volume: 0.06, sweep: 200 });
  setTimeout(() => playTone({ frequency: 760, duration: 0.2, type: 'triangle', volume: 0.05, sweep: 260 }), 80);
}

function playWrongSound() {
  playTone({ frequency: 180, duration: 0.18, type: 'square', volume: 0.05, sweep: -120 });
  setTimeout(() => playTone({ frequency: 110, duration: 0.22, type: 'sawtooth', volume: 0.04, sweep: -80 }), 120);
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getPieceStyle(correctIndex) {
  const col = correctIndex % BOARD_COLUMNS;
  const row = Math.floor(correctIndex / BOARD_COLUMNS);

  const xPercent = (col / (BOARD_COLUMNS - 1)) * 100;
  const yPercent = (row / (BOARD_ROWS - 1)) * 100;

  return {
    backgroundImage: `url(${IMAGE_PATH})`,
    backgroundSize: `${BOARD_COLUMNS * 100}% ${BOARD_ROWS * 100}%`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
  };
}

function positionPieceInSlot(pieceEl, slotEl) {
  slotEl.classList.add('filled');
  slotEl.innerHTML = '';
  slotEl.appendChild(pieceEl);
  pieceEl.classList.add('locked');
  pieceEl.draggable = false;
  pieceEl.style.position = 'absolute';
  pieceEl.style.inset = '0';
  pieceEl.style.width = '100%';
  pieceEl.style.height = '100%';
  pieceEl.style.maxWidth = 'none';
  pieceEl.style.aspectRatio = 'auto';
  pieceEl.style.borderRadius = '10px';
}

function renderBoardSlots() {
  board.innerHTML = '';

  for (let i = 0; i < TOTAL_PIECES; i += 1) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slotIndex = String(i);

    slot.addEventListener('dragover', (event) => {
      event.preventDefault();
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      slot.classList.remove('drag-over');

      if (isLocked) return;

      const pieceId = event.dataTransfer.getData('text/plain');
      const piece = pieces.find((item) => item.id === pieceId);

      if (!piece) return;

      const targetIndex = Number(slot.dataset.slotIndex);

      if (piece.correctIndex === targetIndex) {
        positionPieceInSlot(piece.el, slot);
        piece.isPlaced = true;
        placedCount += 1;
        statusText.textContent = 'Correct placement!';
        playSuccessSound();
        updateProgress();

        if (placedCount === TOTAL_PIECES) {
          statusText.textContent = 'Puzzle complete! You win!';
          isLocked = true;
        }
      } else {
        statusText.textContent = 'Wrong placement! Restarting...';
        playWrongSound();
        isLocked = true;
        setTimeout(() => {
          resetPuzzle();
        }, 850);
      }
    });

    board.appendChild(slot);
  }
}

function updateProgress() {
  progressText.textContent = `${placedCount} / ${TOTAL_PIECES}`;
}

function resetPuzzle() {
  const shuffled = shuffleArray([...Array(TOTAL_PIECES).keys()]);

  pieces = shuffled.map((correctIndex, index) => ({
    id: `piece-${index}-${Date.now()}`,
    correctIndex,
    el: null,
    isPlaced: false,
  }));

  tray.innerHTML = '';

  pieces.forEach((piece) => {
    const el = document.createElement('div');
    const style = getPieceStyle(piece.correctIndex);
    Object.assign(el.style, style);
    el.className = 'piece';
    el.draggable = true;
    el.dataset.pieceId = piece.id;
    el.setAttribute('aria-label', `Puzzle piece ${piece.correctIndex + 1}`);

    el.addEventListener('dragstart', (event) => {
      if (isLocked) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', piece.id);
      ensureAudio();
    });

    piece.el = el;
    tray.appendChild(el);
  });

  placedCount = 0;
  isLocked = false;
  statusText.textContent = 'Arrange all 20 pieces';
  updateProgress();
  renderBoardSlots();
}

restartBtn.addEventListener('click', () => {
  ensureAudio();
  resetPuzzle();
  playTone({ frequency: 400, duration: 0.12, type: 'square', volume: 0.04 });
});

resetPuzzle();
