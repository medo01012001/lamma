// ===== ألعاب جداد: كذبة ولا حقيقة، زوم، كمل المثل، XO جماعي =====

const PROVERBS = [
  ['اللي فراس الجمل', 'فراس الجمال'],
  ['اللي بغا العسل', 'يصبر لقريص النحل'],
  ['اللي زربو', 'ماتو'],
  ['دير الخير', 'وانساه'],
  ['اللي فاتك بليلة', 'فاتك بحيلة'],
  ['ما حس بالمزود', 'غير اللي مخبوط بيه'],
  ['جا يكحلها', 'عماها'],
  ['الجار قبل', 'الدار'],
  ['اللي عضو الحنش', 'كيخاف من الحبل'],
  ['يد وحدة', 'ما كتصفقش'],
  ['كثرة الهم', 'كتضحك'],
  ['اللي ما عرفك', 'خسرك'],
  ['ماشي كل ما كيلمع', 'ذهب'],
  ['اللي حفر شي حفرة لخوه', 'طاح فيها'],
  ['كبرها', 'تصغار'],
  ['قطران بلادي', 'ولا عسل البلدان'],
  ['سبع صنايع', 'والرزق ضايع'],
  ['ضربني وبكى', 'سبقني وشكى'],
  ['شاف الربيع', 'ما شاف الحافة'],
  ['المكتوب', 'ما منو هروب'],
  ['زيد الما', 'زيد الدقيق'],
  ['اللي ما قدر على الحمار', 'كيتشطر على البردعة'],
  ['ولد الفار', 'حفار'],
  ['من الخيمة خرج', 'مايل'],
  ['حوتة وحدة', 'كتخنز الشواري'],
  ['تبع الكذاب', 'حتى لباب الدار'],
  ['الصباح', 'رباح'],
  ['الفم المزموم', 'ما تدخلو ذبانة'],
  ['ما يحس بالجمرة', 'غير اللي عافس عليها'],
  ['اللي تلف', 'يشد الأرض'],
  ['كل نهار', 'ورزقو'],
  ['الصبر', 'مفتاح الفرج']
];

const ZOOM_ITEMS = [
  ['🐘', 'فيل'], ['🦒', 'زرافة'], ['🍉', 'دلاحة|بطيخ|دلاح'], ['🚗', 'طوموبيل|سيارة|طونوبيل'], ['✈️', 'طيارة|طائرة'],
  ['🏠', 'دار|منزل|بيت'], ['⚽', 'كورة|كرة|بالون'], ['🌵', 'صبار|هندية|كاكتوس|الهندية'], ['🐪', 'جمل'], ['🦁', 'سبع|أسد'],
  ['🐢', 'فكرون|سلحفاة|سلحفات'], ['🍌', 'بنان|موز|بنانة'], ['🍓', 'فراولة|فريز|فريزة'], ['🎸', 'قيتارة|غيتار|كيتارة|قيثارة'],
  ['🚲', 'بشكليط|دراجة|بيسكليت|بيشكليط'], ['🌙', 'قمر|هلال'], ['☀️', 'شمس'], ['🐟', 'حوتة|سمكة|حوت'], ['🐓', 'فروج|ديك|سردوك'],
  ['🦋', 'فراشة|فرطوطو'], ['🍕', 'بيتزا|بيتزة'], ['🔑', 'ساروت|مفتاح'], ['⏰', 'ساعة|منبه|ريفاي'], ['🎂', 'كيكة|حلوة|طورطة|كعكة'],
  ['🐧', 'بطريق'], ['🐊', 'تمساح'], ['🦉', 'بومة|موكة'], ['🍎', 'تفاحة|تفاح'], ['🚀', 'صاروخ|فوزي'], ['🌈', 'قوس قزح'],
  ['🐝', 'نحلة|نحل'], ['🕌', 'جامع|مسجد'], ['📱', 'تيليفون|هاتف|بورطابل|تلفون'], ['👓', 'نظارات|نضاضر|نظاظر|ندادر|نظارة'],
  ['🐌', 'غلالة|حلزون|بوجغلالة'], ['🐙', 'أخطبوط|قرنيط|بولبو'], ['🍋', 'حامض|ليمون|ليمونة'], ['🥕', 'خيزو|جزر|جزرة'],
  ['🐑', 'حولي|خروف|كبش|نعجة'], ['🐄', 'بقرة|عجل'], ['🐸', 'جرانة|ضفدع'], ['🦀', 'قبقب|سرطان|كراب'], ['🍇', 'عنب|عنبة'],
  ['🎈', 'بالونة|بالون|نفاخة'], ['🦓', 'حمار الوحش|زيبرا'], ['🐒', 'قرد|شادي'], ['🍔', 'همبرغر|برغر|برجر'], ['🏀', 'كرة السلة|باسكيط|كورة|كرة']
];

const matchAny = (guess, alts) => {
  const g = stripAl(norm(guess));
  return alts.split('|').some(a => stripAl(norm(a)) === g);
};

// =====================================================================
// 🤥 كذبة ولا حقيقة
// =====================================================================
const TL = { key: '', s: ['', '', ''], l: -1 };
const Truth = {
  id: 'truth', title: 'كذبة ولا حقيقة', icon: '🤥', desc: 'كتب 2 حقائق وكذبة على راسك، والباقي كيلقاو الكذبة', min: 3,
  settings: [
    { k: 'max', label: 'شحال من واحد يتكشف', opts: [[0, 'الكل'], [5, '5'], [8, '8'], [12, '12']], def: 8 },
    { k: 'time', label: 'وقت الكتابة', opts: [[60, '60 ثانية'], [90, '90 ثانية'], [120, '120 ثانية']], def: 90 }
  ],
  init(c, o) { return { state: { phase: 'write', max: +o.max, endsAt: c.now + o.time * 1000 } }; },
  key: c => c.state.phase + ':' + (c.state.step || 0),
  badge(c, id) {
    const st = c.state;
    if (st.phase === 'write' && c.inputs.tl && c.inputs.tl[id]) return '✅';
    if (st.phase === 'guess' && id === st.cur) return '🎤';
    if (st.phase === 'guess' && ((c.inputs.tg || {})[st.step] || {})[id] != null) return '🗳️';
    return '';
  },
  stepState(c, order, step) {
    return { 'state/phase': 'guess', 'state/step': step, 'state/cur': order[step], 'state/perm': shuffle([0, 1, 2]), 'state/counts': null, 'state/gains': null, 'state/endsAt': c.now + 25000 };
  },
  tick(c) {
    const st = c.state, now = c.now, tl = c.inputs.tl || {};
    if (st.phase === 'write') {
      if ((c.ids.length && c.ids.every(id => tl[id])) || now >= st.endsAt) {
        let order = shuffle(Object.keys(tl));
        if (st.max) order = order.slice(0, st.max);
        if (!order.length) return H.final();
        H.up({ 'state/order': order, ...Truth.stepState(c, order, 0) });
      }
    } else if (st.phase === 'guess') {
      const votes = (c.inputs.tg || {})[st.step] || {};
      const voters = c.ids.filter(id => id !== st.cur);
      if ((voters.length && voters.every(id => votes[id] != null)) || now >= st.endsAt) {
        const lie = (tl[st.cur] || {}).l, perm = st.perm || [0, 1, 2], gains = {}, counts = [0, 0, 0];
        let fooled = 0;
        for (const [id, k] of Object.entries(votes)) {
          if (id === st.cur) continue;
          counts[k] = (counts[k] || 0) + 1;
          if (perm[k] === lie) gains[id] = 100; else fooled++;
        }
        if (fooled) gains[st.cur] = (gains[st.cur] || 0) + fooled * 50;
        H.up({ 'state/phase': 'reveal', 'state/counts': counts, 'state/gains': gains, 'state/endsAt': now + 7000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && now >= st.endsAt) {
      const step = st.step + 1;
      if (step >= (st.order || []).length) H.final();
      else H.up(Truth.stepState(c, st.order, step));
    }
  },
  build(el, c) {
    const st = c.state;
    const top = `<div class="topbar"><div class="round">${st.phase === 'write' ? 'الكتابة' : `${(st.step || 0) + 1}/${(st.order || []).length}`}</div><div class="status" id="tls"></div><div class="timer" data-timer></div></div>`;
    if (st.phase === 'write') {
      const k = 'w' + st.endsAt;
      if (TL.key !== k) { TL.key = k; TL.s = ['', '', '']; TL.l = -1; }
      el.innerHTML = `<div class="truth">${top}<h3 class="center">كتب 3 جمل على راسك: جوج صحاح ووحدة كذبة 🤫<br><small class="muted">ومن بعد ختار شمن وحدة هي الكذبة</small></h3>
        <div class="tlin">${[0, 1, 2].map(i => `<div class="tlrow"><input data-i="${i}" maxlength="80" autocomplete="off" placeholder="جملة ${i + 1}..."><button class="liebtn" data-l="${i}">🤥 كذبة</button></div>`).join('')}</div>
        <button class="btn big" id="tlsend">صيفط ✉️</button><div class="muted center" id="tldone"></div></div>`;
      const sync = () => $$('.liebtn', el).forEach(b => b.classList.toggle('on', +b.dataset.l === TL.l));
      $$('.tlrow input', el).forEach(inp => { inp.value = TL.s[inp.dataset.i]; inp.oninput = () => (TL.s[inp.dataset.i] = inp.value); });
      $$('.liebtn', el).forEach(b => b.onclick = () => { TL.l = +b.dataset.l; sync(); });
      $('#tlsend', el).onclick = () => {
        if (TL.s.some(x => !x.trim())) return toast('عمر الجمل الثلاثة ✍️');
        if (TL.l < 0) return toast('ختار شمن جملة هي الكذبة 🤥');
        db.set(R() + '/inputs/tl/' + myId, { s: TL.s.map(x => x.trim().slice(0, 80)), l: TL.l });
        beep(700, 0.08);
      };
      sync();
    } else {
      const sub = (c.inputs.tl || {})[st.cur] || { s: [], l: -1 }, perm = st.perm || [0, 1, 2];
      const mine = st.cur === c.me, reveal = st.phase === 'reveal';
      el.innerHTML = `<div class="truth">${top}
        <h3 class="center">${mine ? '😏 هادو الجمل ديالك، شوف واش غادي يكشفوك' : `شمن وحدة كذبة عند ${pTag(c, st.cur)}؟`}</h3>
        <div class="tlopts">${perm.map((orig, k) => `<button class="tlopt ${reveal ? (orig === sub.l ? 'lie' : 'true') : ''}" data-k="${k}" ${mine || reveal ? 'disabled' : ''}>
          <span class="tlt">${esc(sub.s[orig] || '')}</span>${reveal ? `<span class="tltag">${orig === sub.l ? '🤥 كذبة' : '✅ حقيقة'} · ${(st.counts || [])[k] || 0}</span>` : ''}</button>`).join('')}</div>
        ${reveal ? gainList(c, st.gains) : ''}</div>`;
      if (!mine && !reveal) $$('.tlopt', el).forEach(b => b.onclick = () => { db.set(R() + `/inputs/tg/${st.step}/${myId}`, +b.dataset.k); beep(600, 0.06); });
      if (reveal) ding();
    }
  },
  update(el, c) {
    const st = c.state, s = $('#tls', el);
    if (st.phase === 'write') {
      const tl = c.inputs.tl || {};
      s.textContent = `صيفطو ${Object.keys(tl).length}/${c.ids.length}`;
      $('#tldone', el).textContent = tl[c.me] ? '✓ تصيفط! تقدر تبدل وتعاود تصيفط' : '';
    } else if (st.phase === 'guess') {
      const v = (c.inputs.tg || {})[st.step] || {};
      s.textContent = `صوتو ${Object.keys(v).length}/${Math.max(0, c.ids.length - 1)}`;
      $$('.tlopt', el).forEach(b => b.classList.toggle('mine', v[c.me] === +b.dataset.k));
    } else s.textContent = '';
  }
};

// =====================================================================
// 🔍 زوم
// =====================================================================
const ZOOM_MS = 30000;
const Zoom = {
  id: 'zoom', title: 'زوم', icon: '🔍', desc: 'صورة مكبرة بزاف كتصغر شوية بشوية، شكون يعرفها الأول؟', min: 1,
  settings: [{ k: 'rounds', label: 'عدد الجولات', opts: [[5, '5'], [8, '8'], [12, '12']], def: 8 }],
  init(c, o) { return { state: Zoom.round(c, { total: +o.rounds, used: [] }, 0) }; },
  round(c, b, r) {
    const used = b.used || [];
    let i = rnd(ZOOM_ITEMS.length), n = 0;
    while (used.includes(i) && n++ < 80) i = rnd(ZOOM_ITEMS.length);
    const startAt = c.now + 2000;
    return { phase: 'play', round: r, total: b.total, used: [...used, i], item: i, ox: 25 + rnd(50), oy: 25 + rnd(50), startAt, endsAt: startAt + ZOOM_MS };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge: (c, id) => (c.state.phase === 'play' && c.inputs.zm && c.inputs.zm[id] ? '✅' : ''),
  tick(c) {
    const st = c.state, now = c.now;
    if (st.phase === 'play') {
      const d = c.inputs.zm || {};
      if ((c.ids.length && c.ids.every(id => d[id])) || now >= st.endsAt) {
        const gains = {};
        Object.entries(d).sort((a, b) => a[1].t - b[1].t).forEach(([id, a], k) => {
          gains[id] = 100 + Math.round(400 * Math.max(0, (st.endsAt - a.t) / ZOOM_MS)) + (k === 0 ? 50 : 0);
        });
        H.up({ 'state/phase': 'reveal', 'state/gains': gains, 'state/endsAt': now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && now >= st.endsAt) nextRound(c, r => Zoom.round(c, st, r));
  },
  build(el, c) {
    const st = c.state, [emo, ans] = ZOOM_ITEMS[st.item];
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="zs"></div><div class="timer" data-timer></div></div>`;
    el.innerHTML = `<div class="zoom">${top}<div class="zbox"><span class="zemo" id="ze" style="transform-origin:${st.ox}% ${st.oy}%">${emo}</span></div>
      ${st.phase === 'play'
        ? `<form class="row" id="zf"><input id="zi" maxlength="24" autocomplete="off" placeholder="شنو هادي؟"><button class="btn">جاوب</button></form><div class="center tmsg" id="zm"></div>`
        : `<p class="center">كانت: <b class="reveal-word small">${esc(ans.split('|')[0])}</b></p>${gainList(c, st.gains)}`}</div>`;
    const ze = $('#ze', el);
    if (st.phase === 'play') {
      liveLoop(el, () => {
        const f = Math.max(0, Math.min(1, (db.now() - st.startAt) / ZOOM_MS));
        ze.style.transform = `scale(${(14 - 13 * Math.pow(f, 0.7)).toFixed(3)})`;
      }, 50);
      const done = () => (c.inputs.zm || {})[myId] || (ctx().inputs.zm || {})[myId];
      $('#zf', el).onsubmit = e => {
        e.preventDefault();
        const inp = $('#zi', el), v = inp.value.trim();
        if (!v || done()) return;
        if (db.now() < st.startAt) return toast('تسنا شوية ⏳');
        if (matchAny(v, ans)) {
          db.set(R() + '/inputs/zm/' + myId, { t: db.now() });
          inp.disabled = true; $('#zm', el).innerHTML = '<span class="good">✅ صحيح! تسنا الباقيين</span>'; ding();
        } else { inp.value = ''; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); beep(200, 0.15, 'triangle'); }
      };
    } else { ze.style.transform = 'scale(1)'; }
  },
  update(el, c) {
    const s = $('#zs', el);
    if (s) s.textContent = c.state.phase === 'play' ? `عرفوها ${Object.keys(c.inputs.zm || {}).length}/${c.ids.length}` : '';
  }
};

// =====================================================================
// 📜 كمل المثل
// =====================================================================
const P_MS = 15000;
const Proverb = {
  id: 'proverb', title: 'كمل المثل', icon: '📜', desc: 'كيبان نص المثل المغربي، ختار التكملة الصحيحة بالزربة', min: 1,
  settings: [{ k: 'count', label: 'عدد الأمثال', opts: [[5, '5'], [10, '10'], [15, '15']], def: 10 }],
  init(c, o) {
    const items = shuffle(PROVERBS.map((_, i) => i)).slice(0, +o.count).map(i => {
      const wrong = shuffle(PROVERBS.filter((_, j) => j !== i).map(p => p[1])).slice(0, 3);
      const o4 = shuffle([PROVERBS[i][1], ...wrong]);
      return { q: PROVERBS[i][0], o: o4, a: o4.indexOf(PROVERBS[i][1]) };
    });
    return { state: { phase: 'q', q: 0, items, total: items.length, endsAt: c.now + P_MS } };
  },
  key: c => c.state.phase + ':' + c.state.q,
  badge: (c, id) => (c.state.phase === 'q' && c.inputs.pa && c.inputs.pa[id] ? '✅' : ''),
  tick(c) {
    const st = c.state;
    if (st.phase === 'q') {
      const ans = c.inputs.pa || {};
      if ((c.ids.length && c.ids.every(id => ans[id])) || c.now >= st.endsAt) {
        const Q = st.items[st.q], counts = [0, 0, 0, 0], gains = {};
        for (const [id, a] of Object.entries(ans)) {
          counts[a.c] = (counts[a.c] || 0) + 1;
          if (a.c === Q.a) gains[id] = 300 + Math.round(400 * Math.max(0, Math.min(1, (st.endsAt - a.t) / P_MS)));
        }
        H.up({ 'state/phase': 'reveal', 'state/counts': counts, 'state/gains': gains, 'state/endsAt': c.now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && c.now >= st.endsAt) {
      const q = st.q + 1;
      if (q >= st.total) H.final();
      else H.up({ 'state/phase': 'q', 'state/q': q, 'state/counts': null, 'state/gains': null, 'state/endsAt': c.now + P_MS, inputs: null });
    }
  },
  build(el, c) {
    const st = c.state, Q = st.items[st.q];
    el.innerHTML = `<div class="quiz">
      <div class="topbar"><div class="round">مثل ${st.q + 1}/${st.total}</div><div class="status" id="ps"></div><div class="timer" data-timer></div></div>
      <div class="qtext proverb">«${esc(Q.q)} <span class="dots">...</span>»</div>
      <div class="opts">${Q.o.map((o, i) => `<button class="opt o${i}" data-i="${i}"><span class="sh">${'▲◆●■'[i]}</span><span class="ot">${esc(o)}</span><span class="cnt"></span></button>`).join('')}</div>
      <div class="qfoot" id="pf"></div></div>`;
    $$('.opt', el).forEach(b => b.onclick = () => {
      const cc = ctx();
      if (cc.state.phase !== 'q' || (cc.inputs.pa && cc.inputs.pa[myId])) return;
      db.set(R() + '/inputs/pa/' + myId, { c: +b.dataset.i, t: db.now() });
      beep(520, 0.08);
    });
    if (st.phase === 'reveal') { const my = (c.inputs.pa || {})[c.me]; my && my.c === Q.a ? ding() : beep(220, 0.25, 'triangle'); }
  },
  update(el, c) {
    const st = c.state, Q = st.items[st.q], ans = c.inputs.pa || {}, my = ans[c.me];
    $('#ps', el).textContent = `جاوبو ${Object.keys(ans).length}/${c.ids.length}`;
    $$('.opt', el).forEach((b, i) => {
      b.classList.toggle('mine', !!my && my.c === i);
      b.disabled = !!my || st.phase !== 'q';
      if (st.phase === 'reveal') {
        b.classList.toggle('right', i === Q.a); b.classList.toggle('wrong', i !== Q.a);
        $('.cnt', b).textContent = (st.counts && st.counts[i]) || 0;
      }
    });
    const f = $('#pf', el);
    if (st.phase === 'q') f.textContent = my ? '👌 جاوبتي! تسنا الباقيين...' : '';
    else {
      const g = st.gains && st.gains[c.me];
      f.innerHTML = `<div class="full-prov">«${esc(Q.q)} ${esc(Q.o[Q.a])}»</div>` + (g ? `<span class="good">صحيح! +${g}</span>` : my ? '<span class="bad">غلط 😬</span>' : '<span class="bad">ماجاوبتيش ⏰</span>');
    }
  }
};

// =====================================================================
// ❌⭕ XO جماعي (فرقة ضد فرقة)
// =====================================================================
const XO_MS = 12000;
const XO_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const XO_MARK = { r: '❌', b: '⭕' };
const XO = {
  id: 'xo', title: 'XO جماعي', icon: '⭕', desc: 'فرقة ضد فرقة: كل فرقة كتصوت على الخانة اللي غادي تلعب فيها', min: 2,
  settings: [{ k: 'rounds', label: 'عدد الطرحات', opts: [[1, '1'], [3, '3'], [5, '5']], def: 3 }],
  init(c, o) {
    const teams = c.meta.teamsOn ? null : shuffleTeams(c);
    return { state: { phase: 'vote', round: 0, total: +o.rounds, board: Array(9).fill('-'), turn: 'r', starter: 'r', wins: { r: 0, b: 0 }, teams, endsAt: c.now + XO_MS } };
  },
  key: c => c.state.phase + ':' + c.state.round,
  teams: c => teamsOf(c) || {},
  badge(c, id) {
    const st = c.state, t = XO.teams(c)[id];
    if (st.phase === 'vote' && t === st.turn && (c.inputs.xo || {})[id] != null) return '🗳️';
    return t ? TEAM[t].i : '👀';
  },
  winner(b) {
    for (const l of XO_LINES) if (b[l[0]] !== '-' && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { k: b[l[0]], line: l };
    return b.includes('-') ? null : { k: '', line: [] };
  },
  tick(c) {
    const st = c.state, now = c.now, teams = XO.teams(c);
    if (st.phase === 'vote') {
      const members = c.ids.filter(id => teams[id] === st.turn);
      const votes = c.inputs.xo || {}, board = (st.board || []).slice();
      const valid = Object.entries(votes).filter(([id, cell]) => teams[id] === st.turn && board[cell] === '-');
      if ((members.length && members.every(id => votes[id] != null)) || !members.length || now >= st.endsAt) {
        const tally = {};
        valid.forEach(([, cell]) => (tally[cell] = (tally[cell] || 0) + 1));
        const max = Math.max(0, ...Object.values(tally));
        const empty = board.map((v, i) => (v === '-' ? i : -1)).filter(i => i >= 0);
        const top = max ? Object.keys(tally).filter(k => tally[k] === max).map(Number) : empty;
        const cell = pick(top);
        board[cell] = st.turn;
        const w = XO.winner(board);
        if (w) {
          const gains = {}, wins = { ...(st.wins || { r: 0, b: 0 }) };
          if (w.k) { wins[w.k]++; c.ids.filter(id => teams[id] === w.k).forEach(id => (gains[id] = 200)); }
          else c.ids.filter(id => teams[id]).forEach(id => (gains[id] = 50));
          H.up({ 'state/board': board, 'state/last': cell, 'state/phase': 'win', 'state/win': w.k, 'state/line': w.line, 'state/wins': wins, 'state/gains': gains, 'state/endsAt': now + 5000, inputs: null, ...H.gains(gains) });
        } else H.up({ 'state/board': board, 'state/last': cell, 'state/turn': st.turn === 'r' ? 'b' : 'r', 'state/endsAt': now + XO_MS, inputs: null });
      }
    } else if (st.phase === 'win' && now >= st.endsAt) {
      const r = st.round + 1;
      if (r >= st.total) return H.final();
      const starter = st.starter === 'r' ? 'b' : 'r';
      H.up({ 'state/phase': 'vote', 'state/round': r, 'state/board': Array(9).fill('-'), 'state/turn': starter, 'state/starter': starter, 'state/last': null, 'state/line': null, 'state/win': null, 'state/gains': null, 'state/endsAt': now + XO_MS, inputs: null });
    }
  },
  build(el, c) {
    const st = c.state;
    el.innerHTML = `<div class="xo">
      <div class="topbar"><div class="round">طرح ${st.round + 1}/${st.total}</div><div class="xoscore" id="xs"></div><div class="timer" data-timer></div></div>
      <div class="xoturn" id="xt"></div><div class="xoboard" id="xb">${Array.from({ length: 9 }, (_, i) => `<button class="xocell" data-i="${i}"></button>`).join('')}</div>
      <div class="center" id="xf"></div></div>`;
    $('#xb', el).onclick = e => {
      const b = e.target.closest('.xocell'), cc = ctx();
      if (!b || cc.state.phase !== 'vote') return;
      if (XO.teams(cc)[myId] !== cc.state.turn) return toast('ماشي دور الفرقة ديالك ⏳');
      if ((cc.state.board || [])[+b.dataset.i] !== '-') return;
      db.set(R() + '/inputs/xo/' + myId, +b.dataset.i); beep(600, 0.06);
    };
    if (st.phase === 'win') st.win ? ding() : beep(400, 0.2);
  },
  update(el, c) {
    const st = c.state, teams = XO.teams(c), mine = teams[c.me], w = st.wins || { r: 0, b: 0 };
    $('#xs', el).innerHTML = `<span class="tr">🔴 ${w.r}</span> - <span class="tb">${w.b} 🔵</span>`;
    const votes = c.inputs.xo || {}, myTurn = st.phase === 'vote' && mine === st.turn;
    const tally = {};
    Object.entries(votes).forEach(([id, cell]) => { if (teams[id] === st.turn) tally[cell] = (tally[cell] || 0) + 1; });
    const xt = $('#xt', el);
    if (st.phase === 'vote') {
      xt.className = 'xoturn team-' + st.turn;
      xt.innerHTML = `دور ${TEAM[st.turn].i} ${TEAM[st.turn].n} ${XO_MARK[st.turn]} — ${myTurn ? '<b>صوت على خانة!</b>' : mine ? 'تسناو دوركم...' : 'نتا كتفرج 👀'}`;
    } else {
      xt.className = 'xoturn' + (st.win ? ' team-' + st.win : '');
      xt.innerHTML = st.win ? `🏆 ربحات ${TEAM[st.win].i} ${TEAM[st.win].n}!` : '🤝 تعادل!';
    }
    $$('.xocell', el).forEach((b, i) => {
      const v = (st.board || [])[i];
      const html = v !== '-' ? `<span class="mk">${XO_MARK[v]}</span>` : (myTurn && tally[i] ? `<span class="vc">${tally[i]}</span>` : '');
      if (b._h !== html) { b.innerHTML = html; b._h = html; }
      b.classList.toggle('mine', myTurn && votes[c.me] === i);
      b.classList.toggle('last', st.last === i);
      b.classList.toggle('line', (st.line || []).includes(i));
      b.disabled = !myTurn || v !== '-';
    });
    $('#xf', el).innerHTML = st.phase === 'win' ? gainList(c, st.gains) : `<p class="muted">${mine ? `نتا ف ${TEAM[mine].i} ${TEAM[mine].n}` : ''}</p>`;
  }
};

Object.assign(GAMES, { truth: Truth, zoom: Zoom, proverb: Proverb, xo: XO });

main();
