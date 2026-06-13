// ══════════════════════════════════
//   WORD DATA
// ══════════════════════════════════
const SPELL_WORDS = {
  easy: [
    {word:'cat', hint:'A furry pet that meows'},
    {word:'dog', hint:'Man\'s best friend'},
    {word:'sun', hint:'Gives us light and warmth'},
    {word:'rain', hint:'Falls from clouds'},
    {word:'book', hint:'Has pages and stories'},
    {word:'fish', hint:'Lives in water'},
    {word:'bird', hint:'Has wings and feathers'},
    {word:'jump', hint:'To leap off the ground'},
    {word:'blue', hint:'Color of the sky'},
    {word:'tree', hint:'Has roots, trunk, and leaves'},
  ],
  medium: [
    {word:'bridge', hint:'Crosses over water or a gap'},
    {word:'castle', hint:'Where kings and queens live'},
    {word:'frozen', hint:'Turned to ice'},
    {word:'planet', hint:'Orbits a star'},
    {word:'jungle', hint:'Dense tropical forest'},
    {word:'mirror', hint:'Shows your reflection'},
    {word:'walrus', hint:'Arctic animal with tusks'},
    {word:'zipper', hint:'Opens and closes clothing'},
    {word:'cactus', hint:'Desert plant with spines'},
    {word:'falcon', hint:'Fast hunting bird'},
  ],
  hard: [
    {word:'chrysanthemum', hint:'A flowering plant (13 letters!)'},
    {word:'phenomenon', hint:'An observable event or fact'},
    {word:'entrepreneur', hint:'Someone who starts businesses'},
    {word:'Mediterranean', hint:'Large sea between Europe and Africa'},
    {word:'conscientious', hint:'Very careful and diligent'},
    {word:'onomatopoeia', hint:'Word that sounds like what it means'},
    {word:'kaleidoscope', hint:'Tube with colorful changing patterns'},
    {word:'miscellaneous', hint:'Various mixed items'},
    {word:'rhododendron', hint:'Large flowering shrub'},
    {word:'extraordinary', hint:'Beyond the ordinary'},
  ]
};

const WORDLE_WORDS = [
  'CRANE','SLATE','TRACE','BASIC','CLEAN','DREAM','FLAME','GRAPE','HEART','IMAGE',
  'JOINT','KNIFE','LEMON','MIGHT','NIGHT','OCEAN','PAINT','QUIET','RIVER','STONE',
  'TIGER','UNDER','VAULT','WATER','XENON','YOUTH','ZEBRA','HOUSE','LIGHT','MUSIC',
  'BRAIN','CHAIR','DANCE','EARLY','FROST','GIANT','HONEY','INNER','JUDGE','KARMA',
  'LASER','MAGIC','NURSE','OLIVE','PIANO','QUEEN','RAISE','SMART','TRUST','UNITY'
];

const PHRASES = {
  easy: [
    {phrase:'THE CAT SAT ON THE MAT', hint:'Classic nursery rhyme line'},
    {phrase:'TIME FLIES WHEN YOU HAVE FUN', hint:'Shortened famous saying'},
    {phrase:'THE EARLY BIRD GETS THE WORM', hint:'Famous proverb about waking up'},
    {phrase:'ALL THAT GLITTERS IS NOT GOLD', hint:'Shakespeare quote'},
  ],
  medium: [
    {phrase:'ACTIONS SPEAK LOUDER THAN WORDS', hint:'A popular saying about behavior'},
    {phrase:'PRACTICE MAKES PERFECT', hint:'Advice for improving skills'},
    {phrase:'EVERY CLOUD HAS A SILVER LINING', hint:'Optimistic proverb'},
    {phrase:'WHERE THERE IS A WILL THERE IS A WAY', hint:'Proverb about determination'},
  ],
  hard: [
    {phrase:'THE ROAD TO HELL IS PAVED WITH GOOD INTENTIONS', hint:'Famous saying about intentions'},
    {phrase:'YOU CANNOT STEP IN THE SAME RIVER TWICE', hint:'Ancient Greek philosopher Heraclitus'},
    {phrase:'IT DOES NOT MATTER HOW SLOWLY YOU GO AS LONG AS YOU DO NOT STOP', hint:'Confucius quote'},
    {phrase:'THE GREATEST GLORY IN LIVING LIES NOT IN NEVER FALLING', hint:'Part of Nelson Mandela quote'},
  ]
};

const MEMORY_PAIRS = [
  {word:'SWIFT',def:'Very fast'},
  {word:'BRAVE',def:'Courageous'},
  {word:'DUSK',def:'Evening twilight'},
  {word:'ARID',def:'Very dry'},
  {word:'ZEN',def:'Peaceful calm'},
  {word:'FLORA',def:'Plant life'},
  {word:'EPOCH',def:'A long period'},
  {word:'VIVID',def:'Bright, lively'},
];

const TYPE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly. Jackdaws love my big sphinx of quartz.",
  "A wizard's job is to vex chumps quickly in fog. Puzzled women bequeath jerks very exotic gifts.",
  "We promptly judged antique ivory buckles for the next prize. Sixty zippers were quickly picked from the woven jute bag.",
];

const HANG_WORDS = {
  easy:['CAT','DOG','SUN','BEE','HAT','JAR','MAP','PEN','SKY','TOY'],
  medium:['BRIDGE','CASTLE','PLANET','JUNGLE','MIRROR','FOREST','ROCKET','SILVER','GARDEN','WIZARD'],
  hard:['SAXOPHONE','ALGORITHM','LABYRINTH','CHRYSALIS','RHOMBUS','SYMPHONY','TELESCOPE','AVALANCHE','MYSTIQUE','ARCHITECT'],
};

// ══════════════════════════════════
//   MECHANICAL KEYBOARD SOUND ENGINE
//   Uses filtered noise bursts — the way real key clicks actually sound.
//   A real keyclick = sharp attack noise transient (the "click" of actuation)
//   + short body resonance (the keycap thud).
// ══════════════════════════════════
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Build a short buffer of white noise
function makeNoiseBuffer(ctx, durationSec) {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function playClick(type = 'normal') {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (type === 'normal') {
      // ── Mechanical key down: sharp noise click ──
      // Layer 1: very short high-freq noise burst = the "click" of actuation
      const clickBuf = makeNoiseBuffer(ctx, 0.025);
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = clickBuf;

      const clickHp = ctx.createBiquadFilter();
      clickHp.type = 'highpass';
      clickHp.frequency.value = 3500;
      clickHp.Q.value = 1.2;

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.55, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      clickSrc.connect(clickHp);
      clickHp.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickSrc.start(now);
      clickSrc.stop(now + 0.025);

      // Layer 2: short body thud = keycap hitting bottom
      const thudBuf = makeNoiseBuffer(ctx, 0.04);
      const thudSrc = ctx.createBufferSource();
      thudSrc.buffer = thudBuf;

      const thudBp = ctx.createBiquadFilter();
      thudBp.type = 'bandpass';
      thudBp.frequency.value = 900;
      thudBp.Q.value = 0.8;

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.3, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      thudSrc.connect(thudBp);
      thudBp.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudSrc.start(now + 0.004); // slight delay after click
      thudSrc.stop(now + 0.05);

    } else if (type === 'backspace') {
      // Slightly duller, softer — backspace key is wider, feels different
      const buf = makeNoiseBuffer(ctx, 0.04);
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      bp.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.04);

      // Light thud underneath
      const thudBuf = makeNoiseBuffer(ctx, 0.05);
      const thudSrc = ctx.createBufferSource();
      thudSrc.buffer = thudBuf;
      const thudLp = ctx.createBiquadFilter();
      thudLp.type = 'lowpass';
      thudLp.frequency.value = 600;
      const thudG = ctx.createGain();
      thudG.gain.setValueAtTime(0.2, now + 0.005);
      thudG.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      thudSrc.connect(thudLp); thudLp.connect(thudG); thudG.connect(ctx.destination);
      thudSrc.start(now + 0.005);
      thudSrc.stop(now + 0.055);

    } else if (type === 'enter') {
      // Enter is a big spacebar-like THUNK — low and satisfying
      // Click transient
      const cBuf = makeNoiseBuffer(ctx, 0.03);
      const cSrc = ctx.createBufferSource();
      cSrc.buffer = cBuf;
      const cHp = ctx.createBiquadFilter();
      cHp.type = 'highpass';
      cHp.frequency.value = 2500;
      const cG = ctx.createGain();
      cG.gain.setValueAtTime(0.5, now);
      cG.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      cSrc.connect(cHp); cHp.connect(cG); cG.connect(ctx.destination);
      cSrc.start(now); cSrc.stop(now + 0.03);

      // Deep body resonance
      const tBuf = makeNoiseBuffer(ctx, 0.09);
      const tSrc = ctx.createBufferSource();
      tSrc.buffer = tBuf;
      const tBp = ctx.createBiquadFilter();
      tBp.type = 'bandpass';
      tBp.frequency.value = 420;
      tBp.Q.value = 0.6;
      const tG = ctx.createGain();
      tG.gain.setValueAtTime(0.5, now + 0.005);
      tG.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      tSrc.connect(tBp); tBp.connect(tG); tG.connect(ctx.destination);
      tSrc.start(now + 0.005); tSrc.stop(now + 0.1);

    } else if (type === 'correct') {
      // Cheerful three-note ding (kept as tones — this is feedback, not a keyclick)
      [0, 0.1, 0.2].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime([523, 659, 784][i], now + t);
        g.gain.setValueAtTime(0.18, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25);
        osc.start(now + t);
        osc.stop(now + t + 0.25);
      });

    } else if (type === 'wrong') {
      // Low thud + descending tone for error feedback
      const eBuf = makeNoiseBuffer(ctx, 0.08);
      const eSrc = ctx.createBufferSource();
      eSrc.buffer = eBuf;
      const eLp = ctx.createBiquadFilter();
      eLp.type = 'lowpass';
      eLp.frequency.value = 400;
      const eG = ctx.createGain();
      eG.gain.setValueAtTime(0.4, now);
      eG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      eSrc.connect(eLp); eLp.connect(eG); eG.connect(ctx.destination);
      eSrc.start(now); eSrc.stop(now + 0.12);

      const osc = ctx.createOscillator();
      const oG = ctx.createGain();
      osc.connect(oG); oG.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now + 0.02);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      oG.gain.setValueAtTime(0.12, now + 0.02);
      oG.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now + 0.02);
      osc.stop(now + 0.18);
    }

  } catch(e) { /* audio blocked — silently ignore */ }
}

// ── Global keydown: play click sounds for EVERY keypress in every game ──
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.key.startsWith('F') && e.key.length > 1) return;
  if (['Tab','CapsLock','Shift','Control','Alt','Meta',
       'ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
  if (e.key === 'Enter') playClick('enter');
  else if (e.key === 'Backspace' || e.key === 'Delete') playClick('backspace');
  else playClick('normal');
});


let currentGame = '';
let currentDiff = 'easy';
let spellIdx = 0, spellScore = 0, spellStreak = 0;
let wordleWord = '', wordleRow = 0, wordleCol = 0, wordleGuess = '', wordleStreak = 0;
let wordleGrid = [], wordleKeyMap = {};
let unscPhrase = null, unscScore = 0;
let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0, memLock = false;
let trStartTime = null, trTimerInt = null, trText = '', trPos = 0, trWpm = 0, trTimeLeft = 60;
let hangWord = '', hangGuessed = [], hangWrong = 0, hangScore = 0;
const HANG_PARTS = ['hHead','hBody','hLArm','hRArm','hLLeg','hRLeg'];

// ══════════════════════════════════
//   NAVIGATION
// ══════════════════════════════════
function goHome() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('home').classList.add('active');
  stopTypeRace();
  hideResult();
}

function startGame(name) {
  currentGame = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  currentDiff = 'easy';
  document.querySelectorAll(`#${name} .diff-btn`).forEach(b => b.classList.toggle('active', b.dataset.diff==='easy'));

  if (name==='spelling') initSpelling();
  if (name==='wordle') initWordle();
  if (name==='unscramble') initUnscramble();
  if (name==='memory') initMemory();
  if (name==='typerace') initTypeRace();
  if (name==='hangman') initHangman();
}

function setDiff(btn, diff) {
  currentDiff = diff;
  btn.closest('.game-screen').querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // reinit current game
  if (currentGame==='spelling') initSpelling();
  if (currentGame==='unscramble') initUnscramble();
  if (currentGame==='memory') initMemory();
  if (currentGame==='hangman') initHangman();
}

function showToast(msg, duration=2000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function showResult(win, title, sub, stats=[]) {
  const ov = document.getElementById('resultOverlay');
  document.getElementById('resultEmoji').textContent = win ? '🎉' : '💀';
  const rt = document.getElementById('resultTitle');
  rt.textContent = title;
  rt.className = 'result-title ' + (win ? 'win' : 'lose');
  document.getElementById('resultSub').textContent = sub;
  const statsEl = document.getElementById('resultStats');
  statsEl.innerHTML = stats.map(s => `<div class="result-stat"><div class="result-stat-num">${s.num}</div><div class="result-stat-label">${s.label}</div></div>`).join('');
  ov.classList.add('show');
}

function hideResult() { document.getElementById('resultOverlay').classList.remove('show'); }

function playAgain() {
  hideResult();
  if (currentGame==='spelling') initSpelling();
  if (currentGame==='wordle') initWordle();
  if (currentGame==='unscramble') initUnscramble();
  if (currentGame==='memory') initMemory();
  if (currentGame==='typerace') initTypeRace();
  if (currentGame==='hangman') initHangman();
}

// ══════════════════════════════════
//   FLOATING LETTERS BG
// ══════════════════════════════════
(function buildBg() {
  const container = document.getElementById('floatingBg');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let i=0;i<22;i++){
    const el = document.createElement('div');
    el.className = 'float-letter';
    el.textContent = letters[Math.floor(Math.random()*26)];
    el.style.left = Math.random()*100 + 'vw';
    el.style.animationDuration = (15+Math.random()*20) + 's';
    el.style.animationDelay = (Math.random()*20) + 's';
    el.style.fontSize = (1.5+Math.random()*2) + 'rem';
    container.appendChild(el);
  }
})();

// ══════════════════════════════════
//   SPELLING BEE
// ══════════════════════════════════
let spellWords = [];
let spellWpmStart = null, spellKeyCount = 0, spellWpmInterval = null;

function initSpelling() {
  spellWords = [...SPELL_WORDS[currentDiff]].sort(() => Math.random()-0.5);
  spellIdx = 0;
  spellScore = 0;
  spellKeyCount = 0;
  spellWpmStart = null;
  clearInterval(spellWpmInterval);
  document.getElementById('spellScore').textContent = 0;
  document.getElementById('spellWpm').textContent = '0';
  document.getElementById('spellKeys').textContent = '0';

  // Wire up keyboard - remove old listener first by cloning the element
  const inp = document.getElementById('spellInput');
  const newInp = inp.cloneNode(true);
  inp.parentNode.replaceChild(newInp, inp);
  newInp.addEventListener('keydown', e => { if(e.key==='Enter') checkSpelling(); });
  newInp.addEventListener('input', trackSpellWpm);

  loadSpellWord();
  buildStreak();
}

function trackSpellWpm() {
  spellKeyCount++;
  document.getElementById('spellKeys').textContent = spellKeyCount;
  if (!spellWpmStart) {
    spellWpmStart = Date.now();
    spellWpmInterval = setInterval(() => {
      if (!spellWpmStart) return;
      const mins = (Date.now() - spellWpmStart) / 60000;
      const wpm = mins > 0 ? Math.round((spellKeyCount / 5) / mins) : 0;
      document.getElementById('spellWpm').textContent = wpm;
    }, 500);
  }
}


function loadSpellWord() {
  if(spellIdx >= spellWords.length) {
    clearInterval(spellWpmInterval);
    showResult(true, 'Spelling Champion!', `You spelled all ${spellWords.length} words correctly!`,
      [{num:spellScore, label:'Score'},{num:spellWords.length, label:'Words'}]);
    return;
  }
  const inp = document.getElementById('spellInput');
  inp.value = '';
  inp.className = 'text-input';
  document.getElementById('spellFeedback').textContent = '';
  document.getElementById('spellFeedback').className = 'feedback-msg';
  document.getElementById('spellHint').textContent = spellWords[spellIdx].hint;
  // Reset WPM for this word
  spellWpmStart = null;
  spellKeyCount = 0;
  document.getElementById('spellWpm').textContent = '0';
  document.getElementById('spellKeys').textContent = '0';
  buildStreak();
  // auto speak
  setTimeout(speakWord, 400);
}

function speakWord() {
  const w = spellWords[spellIdx]?.word;
  if (!w) return;
  if (!('speechSynthesis' in window)) {
    showToast('⚠️ Speech not supported in this browser');
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(w);
  utt.rate = 0.8;
  utt.pitch = 1;
  const btn = document.getElementById('speakBtn');
  btn.classList.add('speaking');
  utt.onend = () => btn.classList.remove('speaking');
  window.speechSynthesis.speak(utt);
}

function checkSpelling() {
  if (spellIdx >= spellWords.length) return;
  const inp = document.getElementById('spellInput');
  const answer = inp.value.trim().toLowerCase();
  const correct = spellWords[spellIdx].word.toLowerCase();
  const fb = document.getElementById('spellFeedback');

  if (!answer) { showToast('Type something first! 😅'); return; }

  if (answer === correct) {
    inp.className = 'text-input correct';
    fb.textContent = '✓ Correct! Well done!';
    fb.className = 'feedback-msg good';
    playClick('correct');
    spellScore += currentDiff==='easy'?10:currentDiff==='medium'?20:30;
    document.getElementById('spellScore').textContent = spellScore;
    spellIdx++;
    setTimeout(loadSpellWord, 900);
  } else {
    inp.className = 'text-input wrong';
    fb.textContent = `✗ Wrong! The answer was "${correct.toUpperCase()}" — Starting over!`;
    fb.className = 'feedback-msg bad';
    playClick('wrong');
    showToast(`💔 The word was: ${correct.toUpperCase()}`);
    clearInterval(spellWpmInterval);
    setTimeout(() => {
      showResult(false, 'Keep Practicing!', `You got to word ${spellIdx+1} of ${spellWords.length}`,
        [{num:spellScore, label:'Score'},{num:spellIdx, label:'Correct'}]);
    }, 1200);
  }
}

function buildStreak() {
  const bar = document.getElementById('spellStreak');
  bar.innerHTML = '';
  spellWords.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'streak-dot' + (i<spellIdx?' done':i===spellIdx?' current':'');
    bar.appendChild(d);
  });
}

// ══════════════════════════════════
//   WORDLE
// ══════════════════════════════════
function initWordle() {
  wordleWord = WORDLE_WORDS[Math.floor(Math.random()*WORDLE_WORDS.length)];
  wordleRow = 0; wordleCol = 0; wordleGuess = '';
  wordleGrid = [];
  wordleKeyMap = {};
  buildWordleGrid();
  buildWordleKeyboard();
  document.getElementById('wordleFeedback').textContent = 'Type a 5-letter word and press Enter!';
  // keyboard events
  document.onkeydown = null;
  if (currentGame === 'wordle') {
    document.onkeydown = handleWordleKey;
  }
}

function buildWordleGrid() {
  const grid = document.getElementById('wordleGrid');
  grid.innerHTML = '';
  for(let r=0;r<6;r++){
    const row = document.createElement('div');
    row.className = 'wordle-row';
    const rowCells = [];
    for(let c=0;c<5;c++){
      const cell = document.createElement('div');
      cell.className = 'wordle-cell';
      cell.id = `wc_${r}_${c}`;
      row.appendChild(cell);
      rowCells.push(cell);
    }
    grid.appendChild(row);
    wordleGrid.push(rowCells);
  }
}

function buildWordleKeyboard() {
  const rows = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];
  const kb = document.getElementById('wordleKeyboard');
  kb.innerHTML = '';
  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'kb-row';
    r.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'kb-key' + (k.length>1?' wide':'');
      btn.textContent = k;
      btn.id = 'wk_' + k;
      btn.onclick = () => {
        const syntheticKey = k==='⌫'?'Backspace':k==='ENTER'?'Enter':k;
        if (syntheticKey === 'Enter') playClick('enter');
        else if (syntheticKey === 'Backspace') playClick('backspace');
        else playClick('normal');
        handleWordleKey({key: syntheticKey});
      };
      row.appendChild(btn);
    });
    kb.appendChild(row);
  });
}

function handleWordleKey(e) {
  if (currentGame !== 'wordle') return;
  if (wordleRow >= 6) return;

  const key = e.key.toUpperCase();
  if (key === 'ENTER') {
    if (wordleGuess.length < 5) { shakeRow(wordleRow); showToast('Need 5 letters!'); return; }
    submitWordleGuess();
  } else if (key === 'BACKSPACE') {
    if (wordleGuess.length > 0) {
      wordleGuess = wordleGuess.slice(0,-1);
      wordleCol--;
      const cell = wordleGrid[wordleRow][wordleCol];
      cell.textContent = '';
      cell.className = 'wordle-cell';
    }
  } else if (/^[A-Z]$/.test(key) && wordleGuess.length < 5) {
    wordleGrid[wordleRow][wordleCol].textContent = key;
    wordleGrid[wordleRow][wordleCol].className = 'wordle-cell filled';
    wordleGuess += key;
    wordleCol++;
  }
}

function submitWordleGuess() {
  const guess = wordleGuess;
  const target = wordleWord;
  const result = getWordleResult(guess, target);
  const currentRow = wordleRow; // capture before increment

  const FLIP_MS = 500;
  const STAGGER = 120;

  result.forEach((r, i) => {
    const cell = wordleGrid[currentRow][i];
    setTimeout(() => {
      // Set color class BEFORE starting animation so it's already applied at the reveal phase
      cell.className = 'wordle-cell ' + r;
      cell.classList.add('flip-reveal');
      // Remove animation class once done so it doesn't replay
      cell.addEventListener('animationend', () => cell.classList.remove('flip-reveal'), { once: true });
    }, i * STAGGER);
  });

  // Update keyboard after all flips complete
  const allDone = result.length * STAGGER + FLIP_MS;
  setTimeout(() => {
    result.forEach((r, i) => {
      const k = guess[i];
      const cur = wordleKeyMap[k] || '';
      const priority = { correct: 3, present: 2, absent: 1 };
      if ((priority[r] || 0) > (priority[cur] || 0)) wordleKeyMap[k] = r;
      const kb = document.getElementById('wk_' + k);
      if (kb) kb.className = `kb-key${k.length > 1 ? ' wide' : ''} k-${wordleKeyMap[k]}`;
    });

    wordleRow++;
    wordleGuess = '';
    wordleCol = 0;

    const isWin = result.every(r => r === 'correct');
    if (isWin) {
      wordleStreak++;
      document.getElementById('wordleStreak').textContent = wordleStreak;
      const msgs = ['Genius! 🧠', 'Magnificent! ✨', 'Impressive! 💪', 'Splendid! 🌟', 'Great! 👍', 'Phew! 😅'];
      document.getElementById('wordleFeedback').textContent = msgs[currentRow] || 'Yes!';
      setTimeout(() => showResult(true, 'You got it!', `The word was ${target}!`,
        [{ num: currentRow + 1, label: 'Guesses' }, { num: wordleStreak, label: 'Streak' }]), 800);
    } else if (wordleRow >= 6) {
      wordleStreak = 0;
      document.getElementById('wordleStreak').textContent = 0;
      document.getElementById('wordleFeedback').textContent = `The word was ${target}`;
      setTimeout(() => showResult(false, 'Out of guesses!', `The word was ${target}`,
        [{ num: 6, label: 'Guesses Used' }, { num: 0, label: 'Streak' }]), 800);
    } else {
      const left = 6 - wordleRow;
      document.getElementById('wordleFeedback').textContent = `${left} guess${left !== 1 ? 'es' : ''} remaining`;
    }
  }, allDone);
}

function getWordleResult(guess, target) {
  const result = Array(5).fill('absent');
  const tArr = target.split('');
  const gArr = guess.split('');
  const used = Array(5).fill(false);

  // correct first
  gArr.forEach((l,i) => { if(l===tArr[i]) { result[i]='correct'; used[i]=true; } });
  // present
  gArr.forEach((l,i) => {
    if(result[i]==='correct') return;
    const j = tArr.findIndex((t,ti) => t===l && !used[ti] && result[ti]!=='correct');
    if(j!==-1) { result[i]='present'; used[j]=true; }
  });
  return result;
}

function shakeRow(row) {
  const rowEl = document.getElementById('wordleGrid').children[row];
  rowEl.classList.add('shake');
  setTimeout(() => rowEl.classList.remove('shake'), 400);
}

// ══════════════════════════════════
//   UNSCRAMBLE
// ══════════════════════════════════
let unscHintsUsed = 0;
function initUnscramble() {
  const list = PHRASES[currentDiff];
  unscPhrase = list[Math.floor(Math.random()*list.length)];
  unscHintsUsed = 0;
  document.getElementById('unscFeedback').textContent = '';
  document.getElementById('unscFeedback').className = 'feedback-msg';
  buildUnscramble();
}

function buildUnscramble() {
  const words = unscPhrase.phrase.split(' ');
  const shuffled = [...words].sort(() => Math.random()-0.5);

  const pool = document.getElementById('unscPool');
  const ans = document.getElementById('unscAnswer');
  pool.innerHTML = '';
  ans.innerHTML = '';

  shuffled.forEach((w, i) => {
    const chip = document.createElement('div');
    chip.className = 'word-chip';
    chip.textContent = w;
    chip.dataset.word = w;
    chip.onclick = () => moveChip(chip, 'pool');
    pool.appendChild(chip);
  });
}

function moveChip(chip, from) {
  const pool = document.getElementById('unscPool');
  const ans = document.getElementById('unscAnswer');
  if (from === 'pool') {
    chip.onclick = () => moveChip(chip, 'ans');
    ans.appendChild(chip);
  } else {
    chip.onclick = () => moveChip(chip, 'pool');
    pool.appendChild(chip);
  }
}

function clearUnscramble() {
  const pool = document.getElementById('unscPool');
  const ans = document.getElementById('unscAnswer');
  [...ans.children].forEach(c => {
    c.onclick = () => moveChip(c, 'pool');
    pool.appendChild(c);
  });
  document.getElementById('unscFeedback').textContent = '';
}

function checkUnscramble() {
  const ans = document.getElementById('unscAnswer');
  const words = [...ans.children].map(c => c.dataset.word);
  const answer = words.join(' ');
  const fb = document.getElementById('unscFeedback');

  if (words.length === 0) { showToast('Drag words to the answer box!'); return; }

  if (answer === unscPhrase.phrase) {
    fb.textContent = '✓ Correct! Brilliant!';
    fb.className = 'feedback-msg good';
    unscScore += currentDiff==='easy'?10:currentDiff==='medium'?20:30;
    document.getElementById('unscScore').textContent = unscScore;
    setTimeout(() => showResult(true, 'Phrase Solved!', `"${unscPhrase.phrase}"`,
      [{num:unscScore, label:'Score'},{num:unscHintsUsed, label:'Hints Used'}]), 800);
  } else {
    fb.textContent = '✗ Not quite right — try again!';
    fb.className = 'feedback-msg bad';
    ans.classList.add('shake');
    setTimeout(() => ans.classList.remove('shake'), 400);
  }
}

function hintUnscramble() {
  const phrase = unscPhrase.phrase.split(' ');
  const ans = [...document.getElementById('unscAnswer').children].map(c=>c.dataset.word);
  // find first wrong position
  let hintIdx = ans.length; // next word to place
  if (hintIdx >= phrase.length) { showToast('All words placed!'); return; }
  const nextWord = phrase[hintIdx];
  // find it in pool and move it
  const pool = document.getElementById('unscPool');
  const chip = [...pool.children].find(c => c.dataset.word === nextWord);
  if (chip) {
    moveChip(chip, 'pool');
    unscHintsUsed++;
    showToast(`💡 Hint: "${nextWord}" is word #${hintIdx+1}`);
  }
}

// ══════════════════════════════════
//   MEMORY MATCH
// ══════════════════════════════════
function initMemory() {
  const count = currentDiff === 'easy' ? 6 : 8;
  const pairs = [...MEMORY_PAIRS].sort(()=>Math.random()-0.5).slice(0,count);
  const cards = [];
  pairs.forEach(p => {
    cards.push({id:Math.random(), type:'word', text:p.word, pair:p.word});
    cards.push({id:Math.random(), type:'def', text:p.def, pair:p.word});
  });
  cards.sort(()=>Math.random()-0.5);
  memCards = cards; memFlipped = []; memMatched = 0; memMoves = 0; memLock = false;
  document.getElementById('memMoves').textContent = 0;
  document.getElementById('memFeedback').textContent = 'Flip cards to find matching pairs!';

  const cols = currentDiff === 'easy' ? 4 : 4;
  const grid = document.getElementById('memoryGrid');
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  cards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'memory-card';
    el.innerHTML = `<div class="back">❓</div><div class="front">${card.text}</div>`;
    el.dataset.idx = i;
    el.onclick = () => flipMemoryCard(i, el);
    grid.appendChild(el);
  });
}

function flipMemoryCard(idx, el) {
  if (memLock) return;
  if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

  el.classList.add('flipped');
  memFlipped.push({idx, el});

  if (memFlipped.length === 2) {
    memLock = true;
    memMoves++;
    document.getElementById('memMoves').textContent = memMoves;
    const [a, b] = memFlipped;
    if (memCards[a.idx].pair === memCards[b.idx].pair && a.idx !== b.idx) {
      // match
      setTimeout(() => {
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        memFlipped = []; memLock = false;
        memMatched++;
        const total = currentDiff==='easy'?6:8;
        document.getElementById('memFeedback').textContent = `${memMatched}/${total} pairs found!`;
        if (memMatched === total) {
          setTimeout(() => showResult(true,'All Pairs Matched!','Great memory!',
            [{num:memMoves, label:'Moves'},{num:memMatched, label:'Pairs'}]), 600);
        }
      }, 600);
    } else {
      setTimeout(() => {
        a.el.classList.remove('flipped');
        b.el.classList.remove('flipped');
        memFlipped = []; memLock = false;
      }, 1000);
    }
  }
}

// ══════════════════════════════════
//   TYPE RACE
// ══════════════════════════════════
function initTypeRace() {
  stopTypeRace();
  trText = TYPE_TEXTS[Math.floor(Math.random()*TYPE_TEXTS.length)];
  trPos = 0; trWpm = 0; trStartTime = null; trTimeLeft = 60;
  document.getElementById('trWpm').textContent = 0;
  document.getElementById('trTimer').textContent = 60;
  document.getElementById('trProgress').style.width = '0%';
  renderTypeRace();
  const inp = document.getElementById('trInput');
  inp.value = '';
  inp.disabled = false;
  inp.onkeydown = null;
  inp.oninput = handleTypeRaceInput;
  inp.focus();
}

function renderTypeRace() {
  const disp = document.getElementById('trDisplay');
  let html = '';
  for(let i=0; i<trText.length; i++) {
    const ch = trText[i]==' ' ? '&nbsp;' : trText[i];
    if(i < trPos) html += `<span class="done">${ch}</span>`;
    else if(i === trPos) html += `<span class="cursor">${ch}</span>`;
    else html += `<span>${ch}</span>`;
  }
  disp.innerHTML = html;
}

function handleTypeRaceInput(e) {
  if (!trStartTime) {
    trStartTime = Date.now();
    trTimerInt = setInterval(tickTypeRace, 1000);
  }
  const val = e.target.value;
  if (!val.length) return;
  const lastChar = val[val.length-1];
  const expected = trText[trPos];
  if (lastChar === expected) {
    trPos++;
    e.target.value = '';
    const elapsed = (Date.now()-trStartTime)/60000;
    const words = trPos/5;
    trWpm = Math.round(words/elapsed) || 0;
    document.getElementById('trWpm').textContent = trWpm;
    document.getElementById('trProgress').style.width = (trPos/trText.length*100) + '%';
    renderTypeRace();
    if (trPos >= trText.length) {
      stopTypeRace();
      showResult(true,'Finished!',`You typed the full text!`,
        [{num:trWpm, label:'WPM'},{num:Math.round((Date.now()-trStartTime)/1000), label:'Seconds'}]);
    }
  } else {
    e.target.value = '';
    const cell = document.getElementById('trDisplay').children[trPos];
    if(cell) { cell.classList.add('error'); setTimeout(()=>cell.classList.remove('error'),200); }
  }
}

function tickTypeRace() {
  trTimeLeft--;
  document.getElementById('trTimer').textContent = trTimeLeft;
  if (trTimeLeft <= 0) {
    stopTypeRace();
    showResult(false,'Time\'s Up!',`You reached position ${trPos}/${trText.length}`,
      [{num:trWpm, label:'WPM'},{num:trPos, label:'Chars Typed'}]);
  }
}

function stopTypeRace() {
  if (trTimerInt) { clearInterval(trTimerInt); trTimerInt = null; }
}

// ══════════════════════════════════
//   HANGMAN
// ══════════════════════════════════
function initHangman() {
  const words = HANG_WORDS[currentDiff];
  hangWord = words[Math.floor(Math.random()*words.length)];
  hangGuessed = []; hangWrong = 0;
  HANG_PARTS.forEach(p => document.getElementById(p).style.display='none');
  document.getElementById('hangWrong').textContent = '';
  document.getElementById('hangScore').textContent = hangScore;
  renderHangWord();
  buildHangKeyboard();
  document.getElementById('hangHint').textContent = `Category: ${currentDiff.charAt(0).toUpperCase()+currentDiff.slice(1)} (${hangWord.length} letters)`;
}

function renderHangWord() {
  const el = document.getElementById('hangWord');
  el.innerHTML = hangWord.split('').map(l =>
    `<div style="width:32px;height:40px;border-bottom:3px solid #c3b1e1;display:flex;align-items:center;justify-content:center;font-family:'Fredoka One',cursive;font-size:1.6rem;color:${hangGuessed.includes(l)?'#c3b1e1':'transparent'};">${l}</div>`
  ).join('');
}

function buildHangKeyboard() {
  const kb = document.getElementById('hangKeyboard');
  kb.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'kb-key';
    btn.textContent = l;
    btn.id = 'hk_' + l;
    btn.style.minWidth = '38px';
    btn.onclick = () => { playClick('normal'); guessHang(l, btn); };
    kb.appendChild(btn);
  });
}

function guessHang(letter, btn) {
  if (hangGuessed.includes(letter)) return;
  hangGuessed.push(letter);
  btn.disabled = true;
  btn.style.opacity = '0.3';

  if (hangWord.includes(letter)) {
    btn.className = 'kb-key k-correct';
    playClick('correct');
    renderHangWord();
    if (hangWord.split('').every(l => hangGuessed.includes(l))) {
      hangScore += currentDiff==='easy'?10:currentDiff==='medium'?20:30;
      document.getElementById('hangScore').textContent = hangScore;
      setTimeout(() => showResult(true,'You Win!',`The word was ${hangWord}!`,
        [{num:hangScore, label:'Score'},{num:hangWrong, label:'Wrong Guesses'}]), 600);
    }
  } else {
    btn.className = 'kb-key k-absent';
    playClick('wrong');
    document.getElementById('hangWrong').textContent += letter + ' ';
    if (hangWrong < HANG_PARTS.length) {
      document.getElementById(HANG_PARTS[hangWrong]).style.display = '';
    }
    hangWrong++;
    if (hangWrong >= HANG_PARTS.length) {
      setTimeout(() => showResult(false,'Game Over!',`The word was ${hangWord}`,
        [{num:hangScore, label:'Score'},{num:hangWrong, label:'Wrong Guesses'}]), 600);
    }
  }
}
