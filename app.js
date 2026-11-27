// ===== لمّة — ألعاب جماعية أونلاين =====
// تطوير: المهدي وهبي

// ---------- أدوات ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function norm(s) {
  return String(s || '').trim().toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/\s+/g, ' ');
}
const stripAl = s => (s.startsWith('ال') && s.length > 3 ? s.slice(2) : s);
function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
// نسخ النص (مع حل احتياطي إلا ماخدمش clipboard)
function copyText(text, msg) {
  const fallback = () => {
    const t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    t.remove();
    ok ? toast(msg) : prompt('نسخ من هنا:', text);
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => toast(msg), fallback);
  else fallback();
}
let AC;
function beep(f = 660, d = 0.12, type = 'sine', v = 0.12) {
  try {
    AC = AC || new AudioContext();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
    o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch {}
}
const ding = () => { beep(880, 0.1); setTimeout(() => beep(1320, 0.15), 90); };
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}

// ---------- الحالة ----------
const MAX_PLAYERS = 24;
let db;
let myId = sessionStorage.getItem('lamma_id');
if (!myId) { myId = makeId(); sessionStorage.setItem('lamma_id', myId); }
let prof = {};
try { prof = JSON.parse(localStorage.getItem('lamma_prof') || '{}'); } catch {}
if (!prof.avatar) prof.avatar = pick(AVATARS);
if (!prof.color) prof.color = pick(COLORS);

const S = {
  code: null, meta: null, players: {}, scores: {}, state: null, secret: null, inputs: {},
  chat: [], segs: new Map(), unsub: [], view: null, key: null, joinedAt: null, present: false
};
const R = () => 'rooms/' + S.code;

function onlineIds() {
  return Object.keys(S.players || {}).sort((a, b) => (S.players[a].j || 0) - (S.players[b].j || 0));
}
function ctx() {
  return {
    me: myId, meta: S.meta || {}, players: S.players || {}, ids: onlineIds(), scores: S.scores || {},
    state: S.state || {}, secret: S.secret || {}, inputs: S.inputs || {},
    isHost: !!S.meta && S.meta.host === myId, now: db.now()
  };
}
const pName = (c, id) => (c.players[id] ? c.players[id].n : 'شي واحد');
const pTag = (c, id) => { const p = c.players[id] || {}; return `<span class="ptag" style="--pc:${p.c || '#aaa'}">${p.a || '🙂'} ${esc(p.n || 'شي واحد')}</span>`; };

// ---------- كتابة الهوست ----------
const H = {
  up(obj) { return db.update(R(), obj); },
  gains(map) {
    const o = {};
    for (const [id, p] of Object.entries(map || {})) if (p) o['scores/' + id] = (S.scores?.[id] || 0) + p;
    return o;
  },
  sys(text, k = 'sys') { db.push(R() + '/chat', { n: '', t: text, k, ts: db.now() }); },
  msg(c, id, text) { const p = c.players[id] || {}; db.push(R() + '/chat', { id, n: p.n || '؟', a: p.a || '', t: text, k: 'msg', ts: db.now() }); },
  final() { return H.up({ 'state/phase': 'final', 'state/endsAt': null }); }
};
function nextOnline(c, order, t) {
  for (let i = 0; i < order.length; i++) { const id = order[(t + i) % order.length]; if (c.players[id]) return id; }
  return c.ids[0];
}

// =====================================================================
// 🎨 رسم وتخمين
// =====================================================================
const CHOOSE_MS = 12000;
const Canvas = {
  cv: null, x: null, color: '#222222', size: 8,
  attach(cv, canDraw) {
    this.cv = cv; this.x = cv.getContext('2d');
    this.redraw();
    if (canDraw) this.enable();
  },
  live() { return this.cv && this.cv.isConnected; },
  redraw() {
    if (!this.live()) return;
    this.x.fillStyle = '#fff'; this.x.fillRect(0, 0, 1000, 750);
    for (const s of S.segs.values()) this.seg(s);
  },
  redrawSoon() { if (this._r) return; this._r = requestAnimationFrame(() => { this._r = 0; this.redraw(); }); },
  seg(s) {
    if (!this.live() || !s || !s.p) return;
    const x = this.x, p = s.p;
    x.strokeStyle = x.fillStyle = s.c; x.lineWidth = s.w; x.lineCap = x.lineJoin = 'round';
    if (p.length <= 2) { x.beginPath(); x.arc(p[0], p[1], s.w / 2, 0, 7); x.fill(); return; }
    x.beginPath(); x.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]);
    x.stroke();
  },
  enable() {
    const cv = this.cv;
    let buf = null, sent = false, timer = null;
    const pt = e => {
      const r = cv.getBoundingClientRect();
      return [Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 1000),
              Math.round(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) * 750)];
    };
    const flush = force => {
      if (!buf) return;
      if (buf.length >= 4 || (force && !sent)) {
        db.push(R() + '/strokes', { c: this.color, w: this.size, p: buf });
        sent = true; buf = buf.slice(-2);
      }
    };
    cv.onpointerdown = e => {
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch {}
      buf = pt(e); sent = false;
      clearInterval(timer); timer = setInterval(() => flush(false), 60);
    };
    cv.onpointermove = e => {
      if (!buf) return;
      const [x, y] = pt(e), lx = buf[buf.length - 2], ly = buf[buf.length - 1];
      if (Math.abs(x - lx) + Math.abs(y - ly) < 3) return;
      buf.push(x, y);
    };
    const up = () => { if (!buf) return; clearInterval(timer); flush(true); buf = null; };
    cv.onpointerup = up; cv.onpointercancel = up; cv.onpointerleave = up;
  }
};

const Draw = {
  id: 'draw', title: 'رسم وتخمين', icon: '🎨', desc: 'واحد كيرسم والباقي كيخمنو الكلمة', min: 2,
  settings: [
    { k: 'turns', label: 'شحال من دور', opts: [[0, 'كل واحد مرة'], [4, '4'], [6, '6'], [10, '10']], def: 0 },
    { k: 'time', label: 'الوقت ديال الرسم', opts: [[60, '60 ثانية'], [80, '80 ثانية'], [100, '100 ثانية']], def: 80 }
  ],
  init(c, o) {
    const order = shuffle(c.ids);
    const total = +o.turns ? +o.turns : order.length;
    return { state: Draw.turn(c, { order, total, time: +o.time * 1000, used: [] }, 0) };
  },
  turn(c, b, t) {
    const used = b.used || [];
    const avail = DRAW_WORDS.filter(w => !used.includes(w));
    return {
      order: b.order, total: b.total, time: b.time, used,
      phase: 'choose', turn: t, drawer: nextOnline(c, b.order, t),
      choices: shuffle(avail.length >= 3 ? avail : DRAW_WORDS).slice(0, 3), endsAt: c.now + CHOOSE_MS
    };
  },
  key: c => c.state.phase + ':' + c.state.turn,
  badge(c, id) {
    const st = c.state;
    if (id === st.drawer) return '✏️';
    if (st.guessed && st.guessed[id]) return '✅';
    return '';
  },
  next(c) {
    const st = c.state, t = st.turn + 1;
    if (t >= st.total) return H.final();
    H.up({ state: Draw.turn(c, st, t), strokes: null, secret: null, inputs: null });
  },
  tick(c) {
    const st = c.state, now = c.now;
    if (st.phase === 'choose') {
      if (!c.players[st.drawer]) return Draw.next(c);
      const ch = c.inputs.choice;
      if (ch != null || now >= st.endsAt) {
        const word = st.choices[ch != null ? ch : rnd(3)] || st.choices[0];
        const main = word.split('|')[0];
        H.up({
          'state/phase': 'draw', 'state/startAt': now, 'state/endsAt': now + st.time,
          'state/hint': main.replace(/[^\s]/g, '_'), 'state/guessed': null,
          'state/used': [...(st.used || []), word], 'secret/word': word, 'inputs/choice': null
        });
      }
    } else if (st.phase === 'draw') {
      const word = c.secret.word;
      if (!word) return;
      const alts = word.split('|').map(w => stripAl(norm(w)));
      const main = word.split('|')[0];
      const guessed = { ...(st.guessed || {}) };
      const up = {}, gains = {};
      const gs = Object.entries(c.inputs.guess || {}).sort((a, b) => (a[0] < b[0] ? -1 : 1));
      for (const [k, g] of gs) {
        up['inputs/guess/' + k] = null;
        const txt = String(g.t || '').slice(0, 120);
        const ng = stripAl(norm(txt));
        if (g.id === st.drawer || guessed[g.id]) {
          if (alts.some(a => ng.includes(a))) continue; // ماتفضحش الكلمة
          H.msg(c, g.id, txt); continue;
        }
        if (alts.includes(ng)) {
          const rem = Math.max(0, st.endsAt - now) / st.time;
          const pts = 50 + Math.round(250 * rem);
          guessed[g.id] = pts;
          gains[g.id] = (gains[g.id] || 0) + pts;
          gains[st.drawer] = (gains[st.drawer] || 0) + 30;
          up['state/guessed/' + g.id] = pts;
          H.sys(`🎉 ${pName(c, g.id)}: جواب صحيح! +${pts}`, 'ok');
        } else {
          H.msg(c, g.id, txt);
          if (alts.some(a => a.length >= 4 && lev(ng, a) === 1)) H.sys(`🔥 ${pName(c, g.id)}: قريب بزاف!`, 'close');
        }
      }
      // تلميحات: كنبينو حروف مع الوقت
      const frac = (now - st.startAt) / st.time;
      const letters = [...main].filter(ch => ch !== ' ').length;
      const want = letters <= 3 ? 0 : frac > 0.75 ? 2 : frac > 0.5 ? 1 : 0;
      const hint = [...(st.hint || '')];
      const shown = hint.filter(x => x !== '_' && x !== ' ').length;
      if (shown < want) {
        const hidden = hint.map((x, i) => (x === '_' ? i : -1)).filter(i => i >= 0);
        if (hidden.length > 1) { const i = pick(hidden); hint[i] = [...main][i]; up['state/hint'] = hint.join(''); }
      }
      const guessers = c.ids.filter(id => id !== st.drawer);
      const all = guessers.length > 0 && guessers.every(id => guessed[id]);
      if (now >= st.endsAt || all || !c.players[st.drawer]) {
        up['state/phase'] = 'reveal'; up['state/word'] = main; up['state/endsAt'] = now + 6000;
      }
      Object.assign(up, H.gains(gains));
      if (Object.keys(up).length) H.up(up);
    } else if (st.phase === 'reveal' && now >= st.endsAt) Draw.next(c);
  },
  build(el, c) {
    const st = c.state, drawer = st.drawer === c.me;
    el.innerHTML = `<div class="draw">
      <div class="topbar"><div class="round">الدور ${st.turn + 1}/${st.total}</div><div class="word" id="dw"></div><div class="timer" data-timer></div></div>
      <div class="canvas-wrap"><canvas id="cv" width="1000" height="750"></canvas><div class="overlay hidden" id="dov"></div></div>
      <div class="tools" id="tools"></div></div>`;
    Canvas.attach($('#cv', el), drawer && st.phase === 'draw');
    $('#cv', el).classList.toggle('can', drawer && st.phase === 'draw');
    const ov = $('#dov', el);
    if (st.phase === 'choose') {
      ov.classList.remove('hidden');
      if (drawer) {
        ov.innerHTML = `<div class="ovbox"><h3>ختار كلمة باش ترسمها</h3><div class="pick3">${st.choices.map((w, i) => `<button class="btn" data-i="${i}">${esc(w.split('|')[0])}</button>`).join('')}</div></div>`;
        $$('[data-i]', ov).forEach(b => b.onclick = () => { db.set(R() + '/inputs/choice', +b.dataset.i); ov.innerHTML = '<div class="ovbox"><h3>يلاه!</h3></div>'; });
        ding();
      } else ov.innerHTML = `<div class="ovbox"><h3>${pTag(c, st.drawer)} كيختار كلمة...</h3></div>`;
    } else if (st.phase === 'reveal') {
      ov.classList.remove('hidden');
      const g = Object.entries(st.guessed || {}).sort((a, b) => b[1] - a[1]);
      ov.innerHTML = `<div class="ovbox"><div class="muted">الكلمة كانت</div><div class="reveal-word">${esc(st.word)}</div>
        ${g.length ? `<div class="gainlist">${g.map(([id, p]) => `<div>${pTag(c, id)} <b>+${p}</b></div>`).join('')}</div>` : '<p>حتى واحد ماعرفها 😅</p>'}</div>`;
    }
    if (drawer && st.phase === 'draw') {
      const cols = ['#222222', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#6d4c41', '#9e9e9e'];
      const tools = $('#tools', el);
      tools.innerHTML = `<div class="colors">${cols.map(col => `<button class="col" data-c="${col}" style="background:${col}"></button>`).join('')}<button class="col eraser" data-c="#ffffff" title="گوما">🧽</button></div>
        <div class="sizes">${[4, 8, 16, 30].map(s => `<button class="sz" data-s="${s}"><i style="width:${s / 1.5 + 4}px;height:${s / 1.5 + 4}px"></i></button>`).join('')}
        <button class="btn ghost small" id="clr">🗑️ مسح</button></div>`;
      const sync = () => {
        $$('.col', tools).forEach(b => b.classList.toggle('on', b.dataset.c === Canvas.color));
        $$('.sz', tools).forEach(b => b.classList.toggle('on', +b.dataset.s === Canvas.size));
      };
      $$('.col', tools).forEach(b => b.onclick = () => { Canvas.color = b.dataset.c; if (Canvas.color === '#ffffff' && Canvas.size < 16) Canvas.size = 30; sync(); });
      $$('.sz', tools).forEach(b => b.onclick = () => { Canvas.size = +b.dataset.s; sync(); });
      $('#clr', tools).onclick = () => db.remove(R() + '/strokes');
      sync();
    }
  },
  update(el, c) {
    const st = c.state, drawer = st.drawer === c.me, w = $('#dw', el);
    if (!w) return;
    let html = '';
    if (st.phase === 'choose') html = drawer ? 'نتا اللي غادي ترسم!' : 'تسنا شوية...';
    else if (st.phase === 'draw') {
      if (drawer) html = `ارسم: <b>${esc((c.secret.word || '').split('|')[0])}</b>`;
      else if (st.guessed && st.guessed[c.me]) html = '✅ عرفتيها! تسنا الباقيين';
      else {
        const h = st.hint || '';
        html = `<span class="hint">${[...h].map(ch => (ch === ' ' ? '&nbsp;&nbsp;' : esc(ch))).join(' ')}</span> <small>(${[...h].filter(x => x !== ' ').length} حروف)</small>`;
      }
    } else html = `الكلمة: <b>${esc(st.word || '')}</b>`;
    if (w._h !== html) { w.innerHTML = html; w._h = html; }
  }
};

// =====================================================================
// 🧠 مسابقة أسئلة
// =====================================================================
const Q_MS = 15000;
const Quiz = {
  id: 'quiz', title: 'مسابقة أسئلة', icon: '🧠', desc: 'جاوب صحيح وبالزربة باش تاخد نقط كثر', min: 1,
  settings: [{ k: 'count', label: 'عدد الأسئلة', opts: [[5, '5'], [10, '10'], [15, '15'], [20, '20']], def: 10 }],
  init(c, o) {
    const qs = shuffle(QUESTIONS.map((_, i) => i)).slice(0, +o.count);
    return { state: { phase: 'q', q: 0, qs, total: qs.length, endsAt: c.now + Q_MS } };
  },
  key: c => c.state.phase + ':' + c.state.q,
  badge(c, id) { return c.state.phase === 'q' && c.inputs.ans && c.inputs.ans[id] ? '✅' : ''; },
  tick(c) {
    const st = c.state;
    if (st.phase === 'q') {
      const ans = c.inputs.ans || {};
      if ((c.ids.length && c.ids.every(id => ans[id])) || c.now >= st.endsAt) {
        const Q = QUESTIONS[st.qs[st.q]], counts = [0, 0, 0, 0], gains = {};
        for (const [id, a] of Object.entries(ans)) {
          counts[a.c] = (counts[a.c] || 0) + 1;
          if (a.c === Q.a) gains[id] = 500 + Math.round(500 * Math.max(0, Math.min(1, (st.endsAt - a.t) / Q_MS)));
        }
        H.up({ 'state/phase': 'reveal', 'state/counts': counts, 'state/gains': gains, 'state/endsAt': c.now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && c.now >= st.endsAt) {
      const q = st.q + 1;
      if (q >= st.total) H.final();
      else H.up({ state: { phase: 'q', q, qs: st.qs, total: st.total, endsAt: c.now + Q_MS }, inputs: null });
    }
  },
  build(el, c) {
    const st = c.state, Q = QUESTIONS[st.qs[st.q]];
    el.innerHTML = `<div class="quiz">
      <div class="topbar"><div class="round">سؤال ${st.q + 1}/${st.total}</div><div class="status" id="qs"></div><div class="timer" data-timer></div></div>
      <div class="qtext">${esc(Q.q)}</div>
      <div class="opts">${Q.o.map((o, i) => `<button class="opt o${i}" data-i="${i}"><span class="sh">${'▲◆●■'[i]}</span><span class="ot">${esc(o)}</span><span class="cnt"></span></button>`).join('')}</div>
      <div class="qfoot" id="qf"></div></div>`;
    $$('.opt', el).forEach(b => b.onclick = () => {
      const cc = ctx();
      if (cc.state.phase !== 'q' || (cc.inputs.ans && cc.inputs.ans[myId])) return;
      db.set(R() + '/inputs/ans/' + myId, { c: +b.dataset.i, t: db.now() });
      beep(520, 0.08);
    });
    if (st.phase === 'reveal') {
      const my = c.inputs.ans && c.inputs.ans[c.me];
      if (my && my.c === Q.a) ding(); else beep(220, 0.25, 'triangle');
    }
  },
  update(el, c) {
    const st = c.state, Q = QUESTIONS[st.qs[st.q]], ans = c.inputs.ans || {}, my = ans[c.me];
    $('#qs', el).textContent = `جاوبو ${Object.keys(ans).length}/${c.ids.length}`;
    $$('.opt', el).forEach((b, i) => {
      b.classList.toggle('mine', !!my && my.c === i);
      b.disabled = !!my || st.phase !== 'q';
      if (st.phase === 'reveal') {
        b.classList.toggle('right', i === Q.a);
        b.classList.toggle('wrong', i !== Q.a);
        $('.cnt', b).textContent = (st.counts && st.counts[i]) || 0;
      }
    });
    const f = $('#qf', el);
    if (st.phase === 'q') f.textContent = my ? '👌 جاوبتي! تسنا الباقيين...' : '';
    else {
      const g = st.gains && st.gains[c.me];
      f.innerHTML = g ? `<span class="good">صحيح! +${g}</span>` : my ? '<span class="bad">غلط 😬</span>' : '<span class="bad">ماجاوبتيش ⏰</span>';
    }
  }
};

// =====================================================================
// 🔤 حروف (ولد، بنت، حيوان...)
// =====================================================================
const LT = { round: -1, vals: {}, t: null };
function flushLetters() {
  clearTimeout(LT.t); LT.t = null;
  if (LT.dirty) { LT.dirty = false; db.set(R() + '/inputs/ans/' + myId, LT.vals); }
}
const Letters = {
  id: 'letters', title: 'حروف', icon: '🔤', desc: 'ختار حرف وكتب: ولد، بنت، حيوان، جماد، مدينة، مهنة، فاكهة', min: 1,
  settings: [
    { k: 'rounds', label: 'عدد الجولات', opts: [[3, '3'], [5, '5'], [7, '7']], def: 5 },
    { k: 'time', label: 'الوقت', opts: [[60, '60 ثانية'], [90, '90 ثانية'], [120, '120 ثانية']], def: 90 }
  ],
  init(c, o) {
    return { state: Letters.round(c, { order: shuffle(c.ids), total: +o.rounds, time: +o.time * 1000, used: [] }, 0) };
  },
  round(c, b, r) {
    return { order: b.order, total: b.total, time: b.time, used: b.used || [], phase: 'pick', round: r, picker: nextOnline(c, b.order, r), endsAt: c.now + 15000 };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge(c, id) {
    const st = c.state;
    if (st.phase === 'pick' && id === st.picker) return '👆';
    if (st.phase === 'write' && st.stopBy === id) return '✋';
    return '';
  },
  auto(a, L) {
    const n = norm(a), l = norm(L);
    if (n.length < 2) return false;
    return n.startsWith(l) || (n.startsWith('ال') && n.slice(2).startsWith(l));
  },
  isValid(c, id, i) {
    const st = c.state, k = id + '_' + i, ov = st.rej && st.rej[k];
    const a = (c.inputs.ans && c.inputs.ans[id] && c.inputs.ans[id]['c' + i]) || '';
    if (ov === true) return false;
    if (ov === false) return !!a.trim();
    return Letters.auto(a, st.letter);
  },
  score(c) {
    const ans = c.inputs.ans || {}, ids = Object.keys(ans), gains = {}, cells = {};
    CATS.forEach((_, i) => {
      const valid = ids.filter(id => Letters.isValid(c, id, i));
      const cnt = {};
      const key = id => stripAl(norm(ans[id]['c' + i]));
      valid.forEach(id => (cnt[key(id)] = (cnt[key(id)] || 0) + 1));
      valid.forEach(id => {
        const p = valid.length === 1 ? 20 : cnt[key(id)] > 1 ? 5 : 10;
        gains[id] = (gains[id] || 0) + p; cells[id + '_' + i] = p;
      });
    });
    H.up({ 'state/phase': 'scored', 'state/gains': gains, 'state/cells': cells, 'state/endsAt': c.now + 9000, ...H.gains(gains) });
  },
  tick(c) {
    const st = c.state, now = c.now;
    if (st.phase === 'pick') {
      const p = c.inputs.pick, used = st.used || [];
      const ok = p && LETTERS.includes(p) && !used.includes(p);
      if (ok || now >= st.endsAt || !c.players[st.picker]) {
        const L = ok ? p : pick(LETTERS.filter(l => !used.includes(l))) || pick(LETTERS);
        H.up({ 'state/phase': 'write', 'state/letter': L, 'state/used': [...used, L], 'state/endsAt': now + st.time, 'state/stopBy': null, 'inputs/pick': null });
      }
    } else if (st.phase === 'write') {
      const s = c.inputs.stop;
      if (s && !st.stopBy) {
        H.up({ 'state/stopBy': s, 'state/endsAt': Math.min(st.endsAt, now + 5000) });
        H.sys(`✋ ${pName(c, s)}: سالينا! باقي 5 ثواني`, 'close');
        return;
      }
      if (now >= st.endsAt) H.up({ 'state/phase': 'review', 'state/endsAt': null, 'state/rej': null });
    } else if (st.phase === 'scored' && now >= st.endsAt) {
      const r = st.round + 1;
      if (r >= st.total) H.final();
      else H.up({ state: Letters.round(c, st, r), inputs: null });
    }
  },
  build(el, c) {
    const st = c.state;
    if (st.phase !== 'write') flushLetters();
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div>${st.letter && st.phase !== 'pick' ? `<div class="bigletter">${st.letter}</div>` : '<div></div>'}<div class="timer" data-timer></div></div>`;
    if (st.phase === 'pick') {
      const used = st.used || [];
      if (st.picker === c.me) {
        el.innerHTML = `<div class="letters">${top}<h2 class="center">ختار الحرف ديال هاد الجولة</h2>
          <div class="lpick">${LETTERS.map(l => `<button class="lbtn" data-l="${l}" ${used.includes(l) ? 'disabled' : ''}>${l}</button>`).join('')}</div>
          <button class="btn ghost" id="rl">🎲 حرف عشوائي</button></div>`;
        $$('.lbtn', el).forEach(b => b.onclick = () => db.set(R() + '/inputs/pick', b.dataset.l));
        $('#rl', el).onclick = () => db.set(R() + '/inputs/pick', pick(LETTERS.filter(l => !used.includes(l))) || pick(LETTERS));
        ding();
      } else el.innerHTML = `<div class="letters">${top}<div class="waitbox">${pTag(c, st.picker)} كيختار الحرف... 🤔</div></div>`;
    } else if (st.phase === 'write') {
      if (LT.round !== st.round) { LT.round = st.round; LT.vals = {}; }
      el.innerHTML = `<div class="letters">${top}<div id="stopb" class="banner hidden"></div>
        <div class="lgrid">${CATS.map((cat, i) => `<label class="lf"><span>${cat}</span><input data-i="${i}" maxlength="24" autocomplete="off" placeholder="${st.letter}..."></label>`).join('')}</div>
        <button class="btn big" id="stop" disabled>سالينا! ✋</button></div>`;
      const stop = $('#stop', el);
      const check = () => { stop.disabled = !CATS.every((_, i) => (LT.vals['c' + i] || '').trim()); };
      $$('.lf input', el).forEach(inp => {
        inp.value = LT.vals['c' + inp.dataset.i] || '';
        inp.oninput = () => {
          LT.vals['c' + inp.dataset.i] = inp.value; LT.dirty = true; check();
          clearTimeout(LT.t); LT.t = setTimeout(flushLetters, 350);
        };
        inp.onkeydown = e => { if (e.key === 'Enter') { const n = $(`.lf input[data-i="${+inp.dataset.i + 1}"]`, el); n ? n.focus() : inp.blur(); } };
      });
      check();
      stop.onclick = () => { flushLetters(); db.set(R() + '/inputs/stop', myId); };
      beep(700, 0.2);
    } else {
      el.innerHTML = `<div class="letters">${top}<div class="tablewrap"><table class="ltable" id="lt"></table></div><div class="lfoot" id="lf"></div></div>`;
      $('#lt', el).onclick = e => {
        const td = e.target.closest('td[data-k]');
        const cc = ctx();
        if (!td || !cc.isHost || cc.state.phase !== 'review') return;
        db.set(R() + '/state/rej/' + td.dataset.k, td.dataset.ok === '1');
      };
    }
  },
  update(el, c) {
    const st = c.state;
    if (st.phase === 'write') {
      const b = $('#stopb', el), inputs = $$('.lf input', el);
      if (st.stopBy) { b.classList.remove('hidden'); b.innerHTML = `✋ ${pTag(c, st.stopBy)} سالا! كمل بالزربة`; }
      return;
    }
    if (st.phase !== 'review' && st.phase !== 'scored') return;
    const ans = c.inputs.ans || {};
    const ids = Object.keys(ans).sort((a, b) => ((c.scores[b] || 0) - (c.scores[a] || 0)));
    const review = st.phase === 'review';
    const html = `<thead><tr><th>اللاعب</th>${CATS.map(k => `<th>${k}</th>`).join('')}${review ? '' : '<th>النقط</th>'}</tr></thead><tbody>${ids.map(id => `<tr><th>${pTag(c, id)}</th>${CATS.map((_, i) => {
      const v = (ans[id] && ans[id]['c' + i]) || '';
      const ok = Letters.isValid(c, id, i);
      const pts = st.cells && st.cells[id + '_' + i];
      return `<td class="${ok ? 'ok' : 'bad'} ${review && c.isHost ? 'tap' : ''}" data-k="${id}_${i}" data-ok="${ok ? 1 : 0}">${esc(v) || '—'}${!review && pts ? `<sup>+${pts}</sup>` : ''}</td>`;
    }).join('')}${review ? '' : `<td class="tot">+${(st.gains && st.gains[id]) || 0}</td>`}</tr>`).join('')}</tbody>`;
    const t = $('#lt', el);
    if (t._h !== html) { t.innerHTML = html; t._h = html; }
    const f = $('#lf', el);
    if (review) {
      if (c.isHost) {
        if (!$('#calc', f)) {
          f.innerHTML = `<p class="muted">كليكي على شي جواب باش تقبلو ولا ترفضو (الأخضر مقبول، الأحمر مرفوض)</p><button class="btn big" id="calc">✅ حسب النقط</button>`;
          $('#calc', f).onclick = () => Letters.score(ctx());
        }
      } else f.innerHTML = '<p class="muted">⏳ الهوست كيراجع الأجوبة... (جواب فريد = 10، مكرر = 5، بوحدك فالخانة = 20)</p>';
    } else f.innerHTML = '<p class="muted">الجولة الجاية كتبدا دابا...</p>';
  }
};

// =====================================================================
// 🕵️ البراني
// =====================================================================
const Spy = {
  id: 'spy', title: 'البراني', icon: '🕵️', desc: 'كلشي عارف الكلمة غير البراني. لقاوه!', min: 3,
  settings: [{ k: 'rounds', label: 'عدد الجولات', opts: [[2, '2'], [3, '3'], [5, '5']], def: 3 }],
  init(c, o) { return Spy.round(c, +o.rounds, 0); },
  round(c, total, r) {
    const ids = shuffle(c.ids), n = ids.length >= 9 ? 2 : 1, spies = ids.slice(0, n);
    const cat = pick(Object.keys(SPY_WORDS)), word = pick(SPY_WORDS[cat]);
    const options = shuffle([word, ...shuffle(SPY_WORDS[cat].filter(w => w !== word)).slice(0, 5)]);
    return { state: { phase: 'clue', round: r, total, cat, ns: n, endsAt: c.now + 45000 }, secret: { word, spies, options } };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge(c, id) {
    const st = c.state;
    if (st.phase === 'clue' && c.inputs.clue && c.inputs.clue[id]) return '✅';
    if (st.phase === 'vote' && c.inputs.vote && c.inputs.vote[id]) return '🗳️';
    if (st.phase === 'result' && (st.spies || []).includes(id)) return '🕵️';
    return '';
  },
  tick(c) {
    const st = c.state, now = c.now, sec = c.secret;
    if (!sec.spies) return;
    if (st.phase === 'clue') {
      const cl = c.inputs.clue || {};
      if (c.ids.every(id => cl[id]) || now >= st.endsAt) H.up({ 'state/phase': 'vote', 'state/clues': cl, 'state/endsAt': now + 75000 });
    } else if (st.phase === 'vote') {
      const v = c.inputs.vote || {};
      if (c.ids.every(id => v[id]) || now >= st.endsAt) {
        const tally = {};
        Object.values(v).forEach(t => (tally[t] = (tally[t] || 0) + 1));
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        const top = sorted.length && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : null;
        const caught = !!top && sec.spies.includes(top);
        const base = { 'state/tally': tally, 'state/accused': top };
        if (caught && c.players[top]) H.up({ ...base, 'state/phase': 'guess', 'state/options': sec.options, 'state/endsAt': now + 20000 });
        else Spy.finish(c, base, top, caught, null);
      }
    } else if (st.phase === 'guess') {
      const g = c.inputs.sguess;
      if (g != null || now >= st.endsAt || !c.players[st.accused]) Spy.finish(c, {}, st.accused, true, g ?? null);
    } else if (st.phase === 'result' && now >= st.endsAt) {
      const r = st.round + 1;
      if (r >= st.total) H.final();
      else { const n = Spy.round(c, st.total, r); H.up({ state: n.state, secret: n.secret, inputs: null }); }
    }
  },
  finish(c, up, accused, caught, guess) {
    const sec = c.secret, v = c.inputs.vote || {}, gains = {};
    const non = c.ids.filter(id => !sec.spies.includes(id));
    non.forEach(id => { if (sec.spies.includes(v[id])) gains[id] = (gains[id] || 0) + 50; });
    if (caught) {
      non.forEach(id => (gains[id] = (gains[id] || 0) + 100));
      if (guess === sec.word) gains[accused] = (gains[accused] || 0) + 150;
    } else sec.spies.forEach(id => (gains[id] = (gains[id] || 0) + 200));
    H.up({
      ...up, 'state/phase': 'result', 'state/caught': caught, 'state/guess': guess, 'state/word': sec.word,
      'state/spies': sec.spies, 'state/gains': gains, 'state/endsAt': c.now + 11000, ...H.gains(gains)
    });
  },
  build(el, c) {
    const st = c.state, sec = c.secret, spy = (sec.spies || []).includes(c.me);
    const role = spy
      ? `<div class="role spy">🕵️ <b>نتا هو البراني!</b> الموضوع: <b>${esc(st.cat)}</b><small>ماعارفش الكلمة. حاول تبان بحال الباقيين</small></div>`
      : `<div class="role">الكلمة: <b>${esc(sec.word || '')}</b> <span class="muted">· الموضوع: ${esc(st.cat)}</span><small>كاين ${st.ns === 2 ? 'جوج براني' : 'براني واحد'} مابيناتكم</small></div>`;
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="ss"></div><div class="timer" data-timer></div></div>`;
    if (st.phase === 'clue') {
      el.innerHTML = `<div class="spy">${top}${role}<h3>كتب كلمة وحدة كتوصف ${spy ? 'الكلمة (اللي ماعارفهاش 😅)' : 'الكلمة بلا ماتفضحها'}</h3>
        <form class="row" id="cf"><input id="ci" maxlength="20" autocomplete="off" placeholder="تلميح ديالك..."><button class="btn">صيفط</button></form><div id="cdone" class="muted"></div></div>`;
      $('#cf', el).onsubmit = e => {
        e.preventDefault();
        const v = $('#ci', el).value.trim();
        if (v) db.set(R() + '/inputs/clue/' + myId, v.slice(0, 20));
      };
      beep(600, 0.2);
    } else if (st.phase === 'vote') {
      el.innerHTML = `<div class="spy">${top}${role}<h3>🗳️ التلميحات — ناقشو فالشات وصوتو على البراني</h3><div class="clues" id="cl"></div></div>`;
      $('#cl', el).onclick = e => {
        const b = e.target.closest('[data-v]');
        if (b && ctx().state.phase === 'vote') db.set(R() + '/inputs/vote/' + myId, b.dataset.v);
      };
    } else if (st.phase === 'guess') {
      if (st.accused === c.me) {
        el.innerHTML = `<div class="spy">${top}<div class="role spy">😱 شدوك! ولكن عندك فرصة: خمن الكلمة وتربح 150</div>
          <div class="pick3">${(st.options || []).map(o => `<button class="btn" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
        $$('[data-o]', el).forEach(b => b.onclick = () => db.set(R() + '/inputs/sguess', b.dataset.o));
      } else el.innerHTML = `<div class="spy">${top}${role}<div class="waitbox">🎯 تشد ${pTag(c, st.accused)}! دابا كيحاول يخمن الكلمة...</div></div>`;
    } else if (st.phase === 'result') {
      const g = Object.entries(st.gains || {}).sort((a, b) => b[1] - a[1]);
      const out = st.caught
        ? `🎉 لقيتو البراني!${st.guess != null ? (st.guess === st.word ? ' ولكن خمن الكلمة صحيحة 😏' : ' وماعرفش الكلمة 👏') : ''}`
        : st.accused ? `😈 غلطتو! ${pTag(c, st.accused)} ماشي براني` : '🤷 ماتفاهمتوش — البراني نجا';
      el.innerHTML = `<div class="spy">${top}<div class="result-box"><h2>${out}</h2>
        <p>البراني كان: ${(st.spies || []).map(id => pTag(c, id)).join(' و ')}</p>
        <p>الكلمة كانت: <b class="reveal-word small">${esc(st.word)}</b>${st.guess ? ` · البراني ختار: <b>${esc(st.guess)}</b>` : ''}</p>
        <div class="gainlist">${g.map(([id, p]) => `<div>${pTag(c, id)} <b>+${p}</b></div>`).join('')}</div></div></div>`;
      st.caught ? ding() : beep(200, 0.3, 'sawtooth', 0.08);
    }
  },
  update(el, c) {
    const st = c.state, s = $('#ss', el);
    if (st.phase === 'clue') {
      const cl = c.inputs.clue || {};
      s.textContent = `صيفطو ${Object.keys(cl).length}/${c.ids.length}`;
      const mine = cl[c.me];
      $('#cdone', el).textContent = mine ? `✓ صيفطتي: "${mine}" (تقدر تبدلها)` : '';
    } else if (st.phase === 'vote') {
      const v = c.inputs.vote || {}, clues = st.clues || {};
      s.textContent = `صوتو ${Object.keys(v).length}/${c.ids.length}`;
      const html = c.ids.map(id => `<div class="clue ${v[c.me] === id ? 'voted' : ''}">
        ${pTag(c, id)}<span class="ctext">${clues[id] ? esc(clues[id]) : '<i class="muted">ماكتب والو</i>'}</span>
        ${id !== c.me ? `<button class="btn small ${v[c.me] === id ? '' : 'ghost'}" data-v="${id}">${v[c.me] === id ? '✓ صوتتي' : 'هو البراني'}</button>` : '<span class="muted">نتا</span>'}</div>`).join('');
      const cl = $('#cl', el);
      if (cl._h !== html) { cl.innerHTML = html; cl._h = html; }
    } else if (s) s.textContent = '';
  }
};

const GAMES = { draw: Draw, quiz: Quiz, letters: Letters, spy: Spy };
const defaults = g => Object.fromEntries(g.settings.map(s => [s.k, s.def]));

function startGame(gid) {
  const c = ctx(), mod = GAMES[gid];
  if (c.ids.length < mod.min) return toast(`هاد اللعبة خاصها على الأقل ${mod.min} لاعبين`);
  const opts = Object.assign(defaults(mod), (c.meta.opts && c.meta.opts[gid]) || {});
  const init = mod.init(c, opts);
  const scores = {};
  c.ids.forEach(id => (scores[id] = 0));
  db.update(R(), { 'meta/game': gid, state: init.state, secret: init.secret || null, inputs: null, strokes: null, scores });
  H.sys(`🎮 بدات لعبة ${mod.title}!`);
}
function backToLobby() {
  db.update(R(), { 'meta/game': 'lobby', state: null, secret: null, inputs: null, strokes: null });
}

// ---------- الصالون ----------
const Lobby = {
  build(el, c) {
    const sel = c.meta.sel || 'draw', host = c.isHost, g = GAMES[sel];
    el.innerHTML = `<div class="lobby">
      <div class="invite card"><div><div class="muted">كود الروم</div><div class="bigcode">${S.code}</div></div>
        <div class="invbtns"><button class="btn" id="cc">🔑 نسخ الكود</button><button class="btn" id="cp">🔗 نسخ الرابط</button><button class="btn ghost" id="sh">📤 بارطاجي</button></div></div>
      <h2>${host ? 'ختار اللعبة 👇' : '⏳ الهوست كيختار اللعبة...'}</h2>
      <div class="gcards">${Object.values(GAMES).map(x => `<button class="gcard ${x.id === sel ? 'on' : ''}" data-g="${x.id}" ${host ? '' : 'disabled'}>
        <span class="gi">${x.icon}</span><b>${x.title}</b><small>${x.desc}</small><em>من ${x.min} ${x.min === 1 ? 'لاعب' : 'لاعبين'}</em></button>`).join('')}</div>
      <div class="settings card">${g.settings.map(s => `<label><span>${s.label}</span>${host
        ? `<select data-k="${s.k}">${s.opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>`
        : `<b data-k="${s.k}"></b>`}</label>`).join('')}</div>
      <div class="startrow">${host ? `<button class="btn big" id="go">يلاه نبداو! 🚀</button>` : `<div class="wait">تسنا حتى يبدا الهوست اللعبة</div>`}</div></div>`;
    const link = location.origin + location.pathname + '?room=' + S.code;
    $('#cc', el).onclick = () => copyText(S.code, 'تنسخ الكود ✅');
    $('#cp', el).onclick = () => copyText(link, 'تنسخ الرابط ✅');
    $('#sh', el).onclick = () => {
      if (navigator.share) navigator.share({ title: 'لمّة', text: 'أجي تلعب معانا ف لمّة! الكود: ' + S.code, url: link }).catch(() => {});
      else $('#cp', el).click();
    };
    if (host) {
      $$('.gcard', el).forEach(b => b.onclick = () => db.update(R() + '/meta', { sel: b.dataset.g }));
      $$('select', el).forEach(s => s.onchange = () => db.set(R() + `/meta/opts/${sel}/${s.dataset.k}`, +s.value));
      $('#go', el).onclick = () => startGame(sel);
    }
  },
  update(el, c) {
    const sel = c.meta.sel || 'draw', g = GAMES[sel];
    const o = Object.assign(defaults(g), (c.meta.opts && c.meta.opts[sel]) || {});
    g.settings.forEach(s => {
      const e = $(`[data-k="${s.k}"]`, el);
      if (!e) return;
      if (e.tagName === 'SELECT') { if (document.activeElement !== e) e.value = String(o[s.k]); }
      else e.textContent = (s.opts.find(x => +x[0] === +o[s.k]) || [, ''])[1];
    });
    const go = $('#go', el);
    if (go) go.textContent = c.ids.length < g.min ? `خاصكم ${g.min} لاعبين على الأقل` : `يلاه نبداو! 🚀 (${c.ids.length} لاعبين)`;
  }
};

// ---------- النتيجة النهائية ----------
const Final = {
  build(el, c) {
    const ids = c.ids.slice().sort((a, b) => (c.scores[b] || 0) - (c.scores[a] || 0));
    const medal = ['🥇', '🥈', '🥉'];
    const pod = [ids[1], ids[0], ids[2]];
    el.innerHTML = `<div class="final"><h1>🏆 النتيجة النهائية</h1>
      <div class="podium">${pod.map((id, k) => id ? `<div class="pod p${[2, 1, 3][k]}"><div class="pa">${(c.players[id] || {}).a || '🙂'}</div><div class="pn">${esc(pName(c, id))}</div><div class="ps">${c.scores[id] || 0}</div><div class="pb">${medal[[1, 0, 2][k]]}</div></div>` : '<div class="pod empty"></div>').join('')}</div>
      <ol class="rest" start="4">${ids.slice(3).map((id, i) => `<li><span>${i + 4}. ${pTag(c, id)}</span> <b>${c.scores[id] || 0}</b></li>`).join('')}</ol>
      ${c.isHost ? `<div class="row center"><button class="btn big" id="again">🔁 عاودو</button><button class="btn big ghost" id="lob">🏠 رجع للصالون</button></div>` : '<p class="muted center">تسنا الهوست يختار اللعبة الجاية</p>'}</div>`;
    if (c.isHost) {
      $('#again', el).onclick = () => startGame(c.meta.game);
      $('#lob', el).onclick = backToLobby;
    }
    ding(); setTimeout(ding, 250);
    confetti();
  }
};
function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = pick(COLORS);
    s.style.animationDelay = Math.random() * 1.2 + 's';
    s.style.animationDuration = 2 + Math.random() * 2 + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5000);
}

// ---------- الشات ولائحة اللاعبين ----------
function addChat(m) {
  S.chat.push(m);
  if (S.chat.length > 80) S.chat.shift();
  const box = $('#msgs');
  if (!box) return;
  box.appendChild(chatEl(m));
  while (box.children.length > 80) box.firstChild.remove();
  box.scrollTop = box.scrollHeight;
  if (m.k === 'ok') ding();
}
function chatEl(m) {
  const d = document.createElement('div');
  d.className = 'm ' + (m.k || 'msg');
  d.innerHTML = m.k === 'msg' ? `<b>${esc(m.a || '')} ${esc(m.n)}:</b> ${esc(m.t)}` : esc(m.t);
  return d;
}
function sendChat(text) {
  text = text.trim().slice(0, 120);
  if (!text) return;
  const c = ctx();
  if (c.meta.game === 'draw' && c.state.phase === 'draw') db.push(R() + '/inputs/guess', { id: myId, t: text });
  else db.push(R() + '/chat', { id: myId, n: prof.name, a: prof.avatar, t: text, k: 'msg', ts: db.now() });
}
function updateSide(c) {
  const g = GAMES[c.meta.game];
  const ids = c.ids.slice().sort((a, b) => (c.scores[b] || 0) - (c.scores[a] || 0));
  const html = ids.map((id, i) => {
    const p = c.players[id];
    return `<div class="pl ${id === c.me ? 'me' : ''}" style="--pc:${p.c}"><span class="rk">${i + 1}</span><span class="av">${p.a}</span>
      <span class="nm">${esc(p.n)}${id === c.meta.host ? ' 👑' : ''}</span><span class="bd">${g && g.badge ? g.badge(c, id) : ''}</span><span class="sc">${c.scores[id] || 0}</span></div>`;
  }).join('');
  const box = $('#plist');
  if (box._h !== html) { box.innerHTML = html; box._h = html; }
  $('#pcount').textContent = `${c.ids.length}/${MAX_PLAYERS}`;
  const inp = $('#chatin');
  const guessing = c.meta.game === 'draw' && c.state.phase === 'draw';
  inp.placeholder = guessing ? (c.state.drawer === c.me ? 'نتا كترسم... (تقدر تهضر)' : '✍️ كتب التخمين ديالك هنا...') : 'كتب شي حاجة...';
  $('#chat').classList.toggle('guess', guessing && c.state.drawer !== c.me);
}

// ---------- الواجهات ----------
function buildHome() {
  const urlRoom = new URLSearchParams(location.search).get('room') || '';
  $('#app').innerHTML = `<div class="home">
    <div class="hero"><div class="logo">لمّة<span>🎉</span></div><p>ألعاب جماعية أونلاين مع صحابك والعائلة — حتى لـ ${MAX_PLAYERS} لاعب</p>
      <div class="gicons">${Object.values(GAMES).map(g => `<span title="${g.title}">${g.icon}<small>${g.title}</small></span>`).join('')}</div></div>
    <div class="card form">
      <label>سميتك</label><input id="nm" maxlength="14" placeholder="مثلا: سعيد" value="${esc(prof.name || '')}">
      <label>ختار الأفاتار ديالك</label><div class="avatars">${AVATARS.map(a => `<button class="ava ${a === prof.avatar ? 'on' : ''}" data-a="${a}">${a}</button>`).join('')}</div>
      ${urlRoom ? `<button class="btn big" id="joinurl">🚪 دخل للروم ${esc(urlRoom.toUpperCase())}</button><div class="or">ولا</div>` : ''}
      <button class="btn big ${urlRoom ? 'ghost' : ''}" id="create">🎉 دير روم جديد</button>
      <div class="or">ولا دخل بالكود</div>
      <form class="row" id="jf"><input id="code" maxlength="4" placeholder="الكود" value="${esc(urlRoom.toUpperCase())}" dir="ltr"><button class="btn">دخل</button></form>
    </div>
    ${modeNote()}
    <footer>تطوير: المهدي وهبي</footer></div>`;
  $$('.ava').forEach(b => b.onclick = () => { prof.avatar = b.dataset.a; $$('.ava').forEach(x => x.classList.toggle('on', x === b)); saveProf(); });
  const nameOk = () => {
    const n = $('#nm').value.trim();
    if (!n) { toast('كتب سميتك عافاك ✍️'); $('#nm').focus(); return false; }
    prof.name = n.slice(0, 14); saveProf(); return true;
  };
  $('#create').onclick = () => nameOk() && createRoom();
  $('#jf').onsubmit = e => { e.preventDefault(); const code = $('#code').value.trim().toUpperCase(); if (nameOk()) code.length === 4 ? joinRoom(code) : toast('الكود فيه 4 حروف'); };
  if ($('#joinurl')) $('#joinurl').onclick = () => nameOk() && joinRoom(urlRoom.toUpperCase());
}
function modeNote() {
  if (db.mode === 'local') return '<div class="note">🧪 وضع التجربة: كيخدم غير بين التابات ديال نفس المتصفح.</div>';
  if (db.mode === 'peer') return '<div class="note">💡 اللي كيدير الروم هو "السيرفر": خليه حال الصفحة حتى تساليو (ومزيان يكون فالبيسي).</div>';
  return '';
}
function saveProf() { try { localStorage.setItem('lamma_prof', JSON.stringify(prof)); } catch {} }

function buildRoomShell() {
  $('#app').innerHTML = `<div class="room">
    <header><div class="logo sm">لمّة<span>🎉</span></div>
      <button class="codechip" id="codechip" title="نسخ الكود">🔑 <b dir="ltr">${S.code}</b></button>
      <button class="btn ghost small" id="leave">خروج 🚪</button></header>
    <main id="stage"></main>
    <aside id="side">
      <div class="card players"><div class="sidehead">اللاعبين <span id="pcount"></span></div><div id="plist"></div></div>
      <div class="card" id="chat"><div class="sidehead">الشات 💬</div><div id="msgs"></div>
        <form id="cform" class="row"><input id="chatin" maxlength="120" autocomplete="off"><button class="btn small">➤</button></form></div>
    </aside></div>`;
  $('#codechip').onclick = () => copyText(S.code, 'تنسخ الكود ✅');
  $('#leave').onclick = () => { if (confirm('واش بغيتي تخرج من الروم؟')) leaveRoom(); };
  $('#cform').onsubmit = e => { e.preventDefault(); const i = $('#chatin'); sendChat(i.value); i.value = ''; };
  const box = $('#msgs');
  S.chat.forEach(m => box.appendChild(chatEl(m)));
  box.scrollTop = box.scrollHeight;
}

let rq = false;
function sched() {
  if (rq) return;
  rq = true;
  const go = () => { if (!rq) return; rq = false; render(); };
  requestAnimationFrame(go); setTimeout(go, 60); // setTimeout باش يخدم حتى إلا كان التاب فالخلفية
}
function render() {
  if (!S.code) { if (S.view !== 'home') { S.view = 'home'; S.key = null; buildHome(); } return; }
  if (!S.meta) return;
  if (S.view !== 'room') { S.view = 'room'; S.key = null; buildRoomShell(); }
  const c = ctx();
  updateSide(c);
  const g = c.meta.game;
  let mod, key;
  if (!GAMES[g] || !c.state.phase) { mod = Lobby; key = 'lobby:' + (c.meta.sel || 'draw') + ':' + (c.isHost ? 'h' : 'p'); }
  else if (c.state.phase === 'final') { mod = Final; key = g + ':final'; }
  else { mod = GAMES[g]; key = g + ':' + mod.key(c) + ':' + (c.isHost ? 'h' : 'p'); }
  const stage = $('#stage');
  if (key !== S.key) { S.key = key; stage.innerHTML = ''; mod.build(stage, c); tickTimers(c); }
  mod.update && mod.update(stage, c);
}
function tickTimers(c) {
  $$('[data-timer]').forEach(e => {
    const end = c.state.endsAt;
    if (!end) { e.textContent = ''; e.classList.add('off'); return; }
    e.classList.remove('off');
    const s = Math.max(0, Math.ceil((end - c.now) / 1000));
    if (e.textContent !== String(s)) {
      e.textContent = s;
      e.classList.toggle('low', s <= 5);
      if (s <= 5 && s > 0 && e._s !== s && document.visibilityState === 'visible') beep(440, 0.05, 'square', 0.04);
      e._s = s;
    }
  });
}
setInterval(() => {
  if (!S.code || !S.meta || !db) return;
  const c = ctx();
  tickTimers(c);
  if (c.isHost) {
    const g = GAMES[c.meta.game];
    if (g && c.state.phase && c.state.phase !== 'final') { try { g.tick(c); } catch (e) { console.error(e); } }
  }
}, 250);

// ---------- الروم: إنشاء / دخول / خروج ----------
async function createRoom() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  busy(true);
  for (let tries = 0; tries < 6; tries++) {
    const code = Array.from({ length: 4 }, () => A[rnd(A.length)]).join('');
    const r = await db.openRoom(code, true);
    if (!r.ok) { if (r.err === 'taken') continue; busy(false); return toast('مشكل فالاتصال، عاود جرب 🙏'); }
    if (db.mode !== 'peer' && await db.get(`rooms/${code}/meta`)) continue;
    await db.set(`rooms/${code}`, { meta: { host: myId, game: 'lobby', sel: 'draw', created: db.now() } });
    busy(false);
    return enterRoom(code);
  }
  busy(false); toast('ماقدرناش نديرو روم، عاود جرب');
}
async function joinRoom(code) {
  busy(true);
  const r = await db.openRoom(code, false);
  if (!r.ok) {
    busy(false); sessionStorage.removeItem('lamma_room');
    return toast(r.err === 'nf' ? 'هاد الروم ماكايناش ولا الهوست خرج 🤔' : 'مشكل فالاتصال، عاود جرب 🙏');
  }
  const meta = await db.get(`rooms/${code}/meta`);
  if (!meta) { busy(false); db.closeRoom(); sessionStorage.removeItem('lamma_room'); return toast('هاد الروم ماكايناش 🤔'); }
  const players = (await db.get(`rooms/${code}/players`)) || {};
  if (Object.keys(players).length >= MAX_PLAYERS && !players[myId]) { busy(false); db.closeRoom(); return toast('الروم عامرة 😅'); }
  busy(false);
  enterRoom(code);
}
async function enterRoom(code) {
  S.code = code;
  sessionStorage.setItem('lamma_room', code);
  history.replaceState(null, '', '?room=' + code + (db.mode === 'local' ? '&local' : ''));
  S.joinedAt = S.joinedAt || db.now();
  await presence();
  const sc = await db.get(R() + '/scores/' + myId);
  if (sc == null) db.set(R() + '/scores/' + myId, 0);
  subscribe();
}
function presence() {
  const p = R() + '/players/' + myId;
  db.onDisconnectRemove(p);
  S.present = true;
  return db.set(p, { n: prof.name, a: prof.avatar, c: prof.color, j: S.joinedAt });
}
function subscribe() {
  S.unsub.forEach(f => f()); S.unsub = [];
  S.chat = []; S.segs.clear();
  const b = R();
  S.unsub.push(db.on(b + '/meta', v => {
    S.meta = v;
    if (!v && S.code) { toast('الروم تسدات'); return leaveRoom(true); }
    checkHost(); sched();
  }));
  S.unsub.push(db.on(b + '/players', v => {
    S.players = v || {};
    if (S.present && S.code && !S.players[myId]) { clearTimeout(S._rp); S._rp = setTimeout(() => S.code && !S.players[myId] && presence(), 1500); }
    checkHost(); sched();
  }));
  S.unsub.push(db.on(b + '/scores', v => { S.scores = v || {}; sched(); }));
  S.unsub.push(db.on(b + '/state', v => { S.state = v; sched(); }));
  S.unsub.push(db.on(b + '/secret', v => { S.secret = v; sched(); }));
  S.unsub.push(db.on(b + '/inputs', v => { S.inputs = v || {}; sched(); }));
  S.unsub.push(db.onChild(b + '/chat', (k, v) => addChat(v), null, 60));
  S.unsub.push(db.onChild(b + '/strokes', (k, v) => { S.segs.set(k, v); Canvas.seg(v); }, k => { S.segs.delete(k); Canvas.redrawSoon(); }));
}
function checkHost() {
  if (!S.meta || !S.code) return;
  const ids = onlineIds();
  if (ids.length && !S.players[S.meta.host] && ids[0] === myId) db.update(R() + '/meta', { host: myId });
}
function leaveRoom(silent) {
  if (S.code && !silent) db.remove(R() + '/players/' + myId);
  S.unsub.forEach(f => f()); S.unsub = [];
  S.present = false;
  setTimeout(() => db.closeRoom(), silent ? 0 : 300);
  Object.assign(S, { code: null, meta: null, players: {}, scores: {}, state: null, secret: null, inputs: {}, chat: [], key: null, joinedAt: null });
  S.segs.clear();
  sessionStorage.removeItem('lamma_room');
  history.replaceState(null, '', location.pathname + (db.mode === 'local' ? '?local' : ''));
  render();
}
function busy(on) { document.body.classList.toggle('busy', on); }

// لاعب (ماشي هوست) فقد الاتصال بالهوست: كنحاولو نرجعو
async function onLost() {
  if (!S.code) return;
  const code = S.code;
  toast('تقطع الاتصال... كنحاولو نرجعو 🔄');
  for (let i = 0; i < 6 && S.code === code; i++) {
    await new Promise(r => setTimeout(r, 2500));
    const r = await db.openRoom(code, false);
    if (r.ok) { presence(); toast('رجعنا ✅'); return; }
  }
  if (S.code === code) { toast('الهوست خرج، الروم تسدات 😢'); leaveRoom(true); }
}

// ---------- البداية ----------
async function main() {
  const cfg = window.FIREBASE_CONFIG || {};
  const sbc = window.SUPABASE_CONFIG || {};
  const local = new URLSearchParams(location.search).has('local');
  if (local) db = new LocalDB();
  else if (sbc.url && sbc.key) {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
      db = new SupaDB(sbc);
    } catch { db = null; }
  } else if (cfg.apiKey && cfg.databaseURL) {
    try {
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
      db = new FireDB(cfg);
    } catch { db = null; }
  }
  if (!db) {
    try { await loadScript('https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'); db = new PeerDB(); db.onLost = onLost; }
    catch { db = new LocalDB(); }
  }
  db.onConnection(ok => { if (ok && S.code && S.present) presence(); });
  const saved = sessionStorage.getItem('lamma_room');
  render();
  if (saved && prof.name) {
    if (db.mode === 'peer') {
      // الهوست اللي دار refresh كيرجع يحل نفس الروم
      const wasHost = sessionStorage.getItem('lamma_host_tree_' + saved);
      if (wasHost) {
        const r = await db.openRoom(saved, true);
        if (r.ok && (await db.get(`rooms/${saved}/meta`))) return enterRoom(saved);
      }
    }
    toast("🔄 كنرجعو للروم..."); joinRoom(saved);
  }
}
// main() كتعيط ليها games2.js من بعد مايتزادو الألعاب
