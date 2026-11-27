// ===== ألعاب إضافية: الذاكرة، الأسرع فالكتابة، ردّ الفعل، كمل الجملة، 3 كلمات، الكلمات بالزربة =====

const TYPING_SENTENCES = [
  'الشمس طالعة والجو زوين اليوم',
  'كاس ديال أتاي بالنعناع كيدير الخاطر',
  'المغرب بلاد زوينة فيها البحر والجبل والصحرا',
  'خويا مشا للسوق وشرا خضرة وفواكه',
  'الكورة هي الرياضة اللي كيبغيوها بزاف ديال الناس',
  'اللي زربو ماتو والصبر مفتاح الفرج',
  'كل نهار جمعة كناكلو الكسكس مع العائلة',
  'القط ديالنا كينعس فوق الكنبة طول النهار',
  'سافرنا لشفشاون وتصورنا فالزناقي الزرقين',
  'الحريرة والتمر والشباكية فرمضان',
  'التلميذ المجتهد كيراجع دروسو كل نهار',
  'طيارة طايرة فالسما والدراري كيشوفو فيها',
  'الدنيا كتشتي برا وحنا شاربين أتاي فالدار',
  'جدتي كتعرف تحكي أحسن الحكايات قبل النعاس',
  'الطوموبيل الحمرا واقفة قدام باب الدار',
  'نهار العيد كنلبسو حوايج جداد ونزورو العائلة',
  'الحوت كيعوم فالبحر والطيور كتطير فالسما',
  'البحر هادئ والموجات صغار والرملة سخونة',
  'كنبغي نقرا الكتب ونتعلم حوايج جديدة',
  'الصحاب الحقيقيين كيبانو فوقت الشدة',
  'خاصنا نحافظو على الما حيت هو الحياة',
  'الفيل حيوان كبير وعندو ودنين كبار',
  'مراكش مدينة حمرا وفيها ساحة جامع الفنا',
  'ماما كتصاوب أحسن طاجين فالعالم',
  'الوقت كالسيف إلا ماقطعتيهش يقطعك'
];

const COMPLETE_PROMPTS = [
  'أخطر حاجة فالعرس المغربي هي...',
  'إلا ربحت مليار درهم أول حاجة غادي ندير هي...',
  'السر ديال النجاح فالحياة هو...',
  'ماما ديما كتقول ليا...',
  'أسوأ هدية ممكن تعطيها لشي واحد هي...',
  'إلا تحولت لحيوان نهار واحد غادي نكون...',
  'الحاجة اللي ماخاصكش تقولها للأستاذ هي...',
  'أحسن عذر باش تتأخر على الخدمة هو...',
  'إلا كانت عندي قوة خارقة غادي تكون...',
  'أكبر كذبة كيقولوها الناس هي...',
  'شنو كيدير القط ملي كتخرج من الدار؟ ...',
  'أغرب حاجة لقيتها فالثلاجة هي...',
  'ملي كنتعطل على الدار ماما كتقول...',
  'إلا تلاقيت مع كائن فضائي أول حاجة غادي نقول ليه...',
  'الدرس اللي خاصو يتقرا فالمدرسة هو...',
  'نهار الاثنين كيولي زوين إلا...',
  'أصعب حاجة فرمضان هي...',
  'إلا كان الحمار كيهضر غادي يقول...',
  'التيليفون ديالي إلا هضر غادي يفضحني ويقول...',
  'العرس المثالي فيه...',
  'إلا رجعت للماضي غادي...',
  'الجيران ديالنا ديما...',
  'أخيب نصيحة سمعتها فحياتي هي...',
  'إلا وليت وزير نهار واحد غادي...',
  'أحسن ماكلة فالدنيا هي... حيت...',
  'الحاجة اللي كتخليني نضحك ديما هي...',
  'إلا كان الواي فاي بنادم غادي يكون...',
  'فالمستقبل الطوموبيلات غادي...'
];

const STORY_WORDS = ['جمل','طيارة','بطاطا','ملك','حمام','تيليفون','بحر','عرس','ساحر','قنفود','طاكسي','كنز','جدة','صاروخ','بيتزا',
  'مدرسة','غول','دلاحة','بوليسي','صحرا','قط','سوق','شتا','باب','ديناصور','ساروت','شمس','فراشة','موطور','عفريت','كسكس','ملعب',
  'نجمة','قرصان','حلاق','غابة','روبو','سبع','قمر','مراية','فرماج','خيمة','عصفور','كورة','بركان','زربية','ساعة','جزيرة','براد',
  'بابور','بالونة','شيخ','قرد','ثلج','كاميرا','بطريق','طبيب','تمساح','شكلاط','حمار','مظلة','سيف','أستاذ','نحلة','تران','طاجين',
  'كرسي','ستيلو','لامبة','حلزون','عروسة','جن','فلوس','بيضة'];

const SCRAMBLE_WORDS = ['برتقال','مستشفى','مكتبات','سيارات','طيارات','حديقة','مدرسين','فلاحين','معلمين','بحيرات','رسامين','تلاميذ',
  'كتابات','ملاعب','مطاعم','مراكش','سلاحف','خضروات','حلويات','دجاجات','شبابيك','عصافير','نجارين','طباخين','مسابح','قناطر'];

const MEM_SYMS = ['🍎', '🚗', '⚽', '🐱', '🌙', '⭐', '🎈', '🍉', '🐟', '🌵', '🎁', '🔑'];

// مساعد: كيوقف intervals ديال الشاشة ملي كتتبدل
function liveLoop(el, fn, ms) {
  const id = setInterval(() => { if (!el.isConnected) return clearInterval(id); fn(); }, ms);
  fn();
  return id;
}
const ranked = gainsArr => gainsArr.sort((a, b) => b[1] - a[1]);
const gainList = (c, g) => {
  const arr = ranked(Object.entries(g || {}));
  return arr.length ? `<div class="gainlist">${arr.map(([id, p]) => `<div>${pTag(c, id)} <b>+${p}</b></div>`).join('')}</div>` : '<p class="muted">حتى واحد ماربح نقط فهاد الجولة</p>';
};
const nextRound = (c, mk) => {
  const st = c.state, r = st.round + 1;
  if (r >= st.total) return H.final();
  H.up({ state: mk(r), inputs: null });
};

// =====================================================================
// 🧩 الذاكرة
// =====================================================================
const MEMP = { key: '', s: [] };
const Memory = {
  id: 'memory', title: 'الذاكرة', icon: '🧩', desc: 'حفظ الترتيب ديال الأشكال وعاودو بلا غلط', min: 1,
  settings: [{ k: 'rounds', label: 'عدد الجولات', opts: [[4, '4'], [6, '6'], [8, '8']], def: 6 }],
  init(c, o) { return { state: Memory.round(c, +o.rounds, 0) }; },
  round(c, total, r) {
    const len = 3 + r;
    return { phase: 'show', round: r, total, seq: Array.from({ length: len }, () => rnd(MEM_SYMS.length)), endsAt: c.now + 1500 + len * 800 };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge: (c, id) => (c.state.phase === 'input' && c.inputs.mem && c.inputs.mem[id] ? '✅' : ''),
  tick(c) {
    const st = c.state, now = c.now, len = st.seq.length;
    if (st.phase === 'show' && now >= st.endsAt) {
      H.up({ 'state/phase': 'input', 'state/startAt': now, 'state/endsAt': now + 8000 + len * 1500 });
    } else if (st.phase === 'input') {
      const ans = c.inputs.mem || {};
      if ((c.ids.length && c.ids.every(id => ans[id])) || now >= st.endsAt) {
        const gains = {}, res = {};
        for (const [id, a] of Object.entries(ans)) {
          const s = a.s || [];
          let k = 0;
          while (k < len && s[k] === st.seq[k]) k++;
          res[id] = k;
          if (k === len) gains[id] = 100 + len * 10 + Math.round(150 * Math.max(0, (st.endsAt - a.t) / (st.endsAt - st.startAt)));
          else if (k) gains[id] = k * 10;
        }
        H.up({ 'state/phase': 'reveal', 'state/gains': gains, 'state/res': res, 'state/endsAt': now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && now >= st.endsAt) nextRound(c, r => Memory.round(c, st.total, r));
  },
  build(el, c) {
    const st = c.state, len = st.seq.length;
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total} · ${len} أشكال</div><div class="status" id="ms"></div><div class="timer" data-timer></div></div>`;
    const seqHtml = st.seq.map(i => `<span class="mtile">${MEM_SYMS[i]}</span>`).join('');
    if (st.phase === 'show') {
      el.innerHTML = `<div class="memory">${top}<h2 class="center">👀 حفظ هاد الترتيب!</h2><div class="mseq show">${seqHtml}</div></div>`;
      beep(600, 0.15);
    } else if (st.phase === 'input') {
      const k = st.round + ':' + st.startAt;
      if (MEMP.key !== k) { MEMP.key = k; MEMP.s = []; }
      el.innerHTML = `<div class="memory">${top}<h2 class="center">🧠 عاود نفس الترتيب</h2>
        <div class="mseq" id="slots"></div>
        <div class="mgrid">${MEM_SYMS.map((s, i) => `<button class="mbtn" data-i="${i}">${s}</button>`).join('')}</div>
        <div class="row center"><button class="btn ghost" id="undo">↩️ رجع</button></div></div>`;
      const draw = () => {
        const done = !!(ctx().inputs.mem || {})[myId];
        $('#slots', el).innerHTML = Array.from({ length: len }, (_, i) => `<span class="mtile ${MEMP.s[i] == null ? 'empty' : ''}">${MEMP.s[i] != null ? MEM_SYMS[MEMP.s[i]] : ''}</span>`).join('');
        $$('.mbtn', el).forEach(b => (b.disabled = done));
        $('#undo', el).disabled = done || !MEMP.s.length;
      };
      $$('.mbtn', el).forEach(b => b.onclick = () => {
        if (MEMP.s.length >= len) return;
        MEMP.s.push(+b.dataset.i); beep(500 + MEMP.s.length * 40, 0.06);
        if (MEMP.s.length === len) db.set(R() + '/inputs/mem/' + myId, { s: MEMP.s, t: db.now() });
        draw();
      });
      $('#undo', el).onclick = () => { MEMP.s.pop(); draw(); };
      draw();
    } else {
      const res = st.res || {}, mine = res[c.me];
      const ok = mine === len;
      el.innerHTML = `<div class="memory">${top}<h2 class="center">${ok ? '🎉 صحيح كامل!' : mine != null ? `😬 حفظتي ${mine} من ${len}` : '⏰ ماجاوبتيش'}</h2>
        <div class="mseq show">${seqHtml}</div>${gainList(c, st.gains)}</div>`;
      ok ? ding() : beep(220, 0.25, 'triangle');
    }
  },
  update(el, c) {
    const s = $('#ms', el);
    if (s) s.textContent = c.state.phase === 'input' ? `ساليو ${Object.keys(c.inputs.mem || {}).length}/${c.ids.length}` : '';
  }
};

// =====================================================================
// ⌨️ الأسرع فالكتابة
// =====================================================================
const Typing = {
  id: 'typing', title: 'الأسرع فالكتابة', icon: '⌨️', desc: 'كتب الجملة بلا غلط قبل الآخرين', min: 1,
  settings: [{ k: 'rounds', label: 'عدد الجولات', opts: [[3, '3'], [5, '5'], [7, '7']], def: 5 }],
  init(c, o) { return { state: Typing.round(c, { total: +o.rounds, used: [] }, 0) }; },
  round(c, b, r) {
    const used = b.used || [];
    let i = rnd(TYPING_SENTENCES.length), n = 0;
    while (used.includes(i) && n++ < 50) i = rnd(TYPING_SENTENCES.length);
    const startAt = c.now + 3500;
    return { phase: 'type', round: r, total: b.total, used: [...used, i], text: TYPING_SENTENCES[i], startAt, endsAt: startAt + 12000 + TYPING_SENTENCES[i].length * 450 };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge: (c, id) => (c.state.phase === 'type' && c.inputs.typ && c.inputs.typ[id] ? '🏁' : ''),
  tick(c) {
    const st = c.state, now = c.now;
    if (st.phase === 'type') {
      const d = c.inputs.typ || {};
      if ((c.ids.length && c.ids.every(id => d[id])) || now >= st.endsAt) {
        const arr = Object.entries(d).sort((a, b) => a[1].t - b[1].t), gains = {};
        arr.forEach(([id, a], k) => {
          gains[id] = 100 + Math.round(300 * Math.max(0, (st.endsAt - a.t) / (st.endsAt - st.startAt))) + (k === 0 ? 100 : 0);
        });
        H.up({ 'state/phase': 'reveal', 'state/gains': gains, 'state/endsAt': now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && c.now >= st.endsAt) nextRound(c, r => Typing.round(c, st, r));
  },
  build(el, c) {
    const st = c.state;
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="ts"></div><div class="timer" data-timer></div></div>`;
    if (st.phase === 'type') {
      el.innerHTML = `<div class="typing">${top}<div class="ttext" id="tt"></div>
        <input id="ti" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="تسنا..." disabled>
        <div class="tmsg" id="tm"></div></div>`;
      const inp = $('#ti', el), tt = $('#tt', el), tm = $('#tm', el), target = norm(st.text);
      let started = false, done = false;
      const paint = () => {
        const v = norm(inp.value);
        let k = 0;
        while (k < v.length && k < target.length && v[k] === target[k]) k++;
        const wrong = v.length > k;
        tt.innerHTML = `<span class="tok">${esc(st.text.slice(0, k))}</span><span class="${wrong ? 'terr' : 'tcur'}">${esc(st.text.slice(k, k + 1))}</span>${esc(st.text.slice(k + 1))}`;
        inp.classList.toggle('err', wrong);
      };
      inp.onpaste = e => e.preventDefault();
      inp.oninput = () => {
        paint();
        if (!done && norm(inp.value) === target) {
          done = true; inp.disabled = true;
          const t = db.now();
          db.set(R() + '/inputs/typ/' + myId, { t });
          tm.innerHTML = `<span class="good">✅ ساليتي ف ${((t - st.startAt) / 1000).toFixed(1)} ثانية!</span>`;
          ding();
        }
      };
      paint();
      liveLoop(el, () => {
        const left = st.startAt - db.now();
        if (!started) {
          if (left > 0) tm.innerHTML = `<span class="count">${Math.ceil(left / 1000)}</span>`;
          else { started = true; inp.disabled = false; inp.placeholder = 'كتب هنا...'; inp.focus(); tm.textContent = 'يلاه! 🏁'; beep(880, 0.2); }
        }
      }, 100);
    } else {
      el.innerHTML = `<div class="typing">${top}<h2 class="center">🏁 النتيجة</h2><div class="ttext">${esc(st.text)}</div>${gainList(c, st.gains)}</div>`;
    }
  },
  update(el, c) {
    const s = $('#ts', el);
    if (s) s.textContent = c.state.phase === 'type' ? `ساليو ${Object.keys(c.inputs.typ || {}).length}/${c.ids.length}` : '';
  }
};

// =====================================================================
// ⚡ ردّ الفعل
// =====================================================================
const Reaction = {
  id: 'reaction', title: 'ردّ الفعل', icon: '⚡', desc: 'ضغط غير ملي يولي خضر، اللي ضغط قبل الوقت كيخسر!', min: 1,
  settings: [{ k: 'rounds', label: 'عدد الجولات', opts: [[3, '3'], [5, '5'], [7, '7']], def: 5 }],
  init(c, o) { return { state: Reaction.round(c, +o.rounds, 0) }; },
  round(c, total, r) {
    const goAt = c.now + 3000 + rnd(4500);
    return { phase: 'wait', round: r, total, goAt, until: goAt + 4000 };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge(c, id) {
    const a = c.inputs.rx && c.inputs.rx[id];
    if (!a) return '';
    return c.state.phase === 'reveal' ? (a.f ? '❌' : a.ms + 'ms') : '✅';
  },
  tick(c) {
    const st = c.state, now = c.now;
    if (st.phase === 'wait') {
      const d = c.inputs.rx || {};
      if ((c.ids.length && c.ids.every(id => d[id])) || now >= st.until) {
        const ok = Object.entries(d).filter(([, a]) => !a.f).sort((a, b) => a[1].ms - b[1].ms), gains = {};
        ok.forEach(([id], k) => (gains[id] = [300, 200, 150][k] || 100));
        H.up({ 'state/phase': 'reveal', 'state/gains': gains, 'state/endsAt': now + 5000, ...H.gains(gains) });
      }
    } else if (st.phase === 'reveal' && now >= st.endsAt) nextRound(c, r => Reaction.round(c, st.total, r));
  },
  build(el, c) {
    const st = c.state;
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="rs"></div><div class="timer" data-timer></div></div>`;
    if (st.phase === 'wait') {
      el.innerHTML = `<div class="reaction">${top}<button class="rpad wait" id="rp"><b>تسنا اللون الخضر...</b><small>ماتضغطش دابا!</small></button></div>`;
      const pad = $('#rp', el);
      let green = false, greenAt = 0, done = false;
      const fire = () => {
        if (done) return;
        done = true;
        if (!green) {
          db.set(R() + '/inputs/rx/' + myId, { f: 1 });
          pad.className = 'rpad bad'; pad.innerHTML = '<b>❌ بكري!</b><small>ضغطتي قبل الوقت</small>';
          beep(180, 0.3, 'sawtooth', 0.08);
        } else {
          const ms = Math.round(performance.now() - greenAt);
          db.set(R() + '/inputs/rx/' + myId, { ms });
          pad.className = 'rpad done'; pad.innerHTML = `<b>${ms} ms</b><small>تسنا الباقيين...</small>`;
        }
      };
      pad.onpointerdown = e => { e.preventDefault(); fire(); };
      const id = setInterval(() => {
        if (!pad.isConnected) return clearInterval(id);
        if (!green && db.now() >= st.goAt) {
          green = true; greenAt = performance.now();
          if (!done) { pad.className = 'rpad go'; pad.innerHTML = '<b>دابا! ⚡</b><small>ضغط بالزربة</small>'; beep(990, 0.08); }
          clearInterval(id);
        }
      }, 5);
    } else {
      const d = c.inputs.rx || {};
      const arr = Object.entries(d).sort((a, b) => (a[1].f ? 1e9 : a[1].ms) - (b[1].f ? 1e9 : b[1].ms));
      el.innerHTML = `<div class="reaction">${top}<h2 class="center">⚡ النتيجة</h2>
        <div class="gainlist">${arr.map(([id, a]) => `<div>${pTag(c, id)} ${a.f ? '<span class="bad">❌ بكري</span>' : `<b class="ms">${a.ms} ms</b>`} ${st.gains && st.gains[id] ? `<b>+${st.gains[id]}</b>` : ''}</div>`).join('') || '<p class="muted">حتى واحد ماضغط</p>'}</div></div>`;
    }
  },
  update(el, c) {
    const s = $('#rs', el);
    if (s) s.textContent = c.state.phase === 'wait' ? `ضغطو ${Object.keys(c.inputs.rx || {}).length}/${c.ids.length}` : '';
  }
};

// =====================================================================
// ✍️ ألعاب الكتابة والتصويت (كمل الجملة + 3 كلمات)
// =====================================================================
const WV = { key: '', text: '' };
function makeWriteVote(cfg) {
  const G = {
    id: cfg.id, title: cfg.title, icon: cfg.icon, desc: cfg.desc, min: 3,
    settings: [
      { k: 'rounds', label: 'عدد الجولات', opts: [[2, '2'], [3, '3'], [5, '5']], def: 3 },
      { k: 'time', label: 'وقت الكتابة', opts: cfg.times, def: cfg.defTime }
    ],
    init(c, o) { return { state: G.round(c, { total: +o.rounds, time: +o.time * 1000, used: [] }, 0) }; },
    round(c, b, r) {
      const used = b.used || [];
      const p = cfg.prompt(used);
      return { phase: 'write', round: r, total: b.total, time: b.time, used: [...used, p.key], prompt: p.v, endsAt: c.now + b.time };
    },
    key: c => c.state.phase + ':' + c.state.round,
    badge(c, id) {
      const st = c.state;
      if (st.phase === 'write' && c.inputs.w && c.inputs.w[id]) return '✅';
      if (st.phase === 'vote' && c.inputs.v && c.inputs.v[id]) return '🗳️';
      return '';
    },
    tick(c) {
      const st = c.state, now = c.now;
      if (st.phase === 'write') {
        const w = c.inputs.w || {};
        if ((c.ids.length && c.ids.every(id => w[id])) || now >= st.endsAt) {
          const list = shuffle(Object.entries(w).filter(([, t]) => String(t).trim()));
          if (list.length < 2) {
            const gains = {};
            list.forEach(([id]) => (gains[id] = 50));
            H.up({ 'state/phase': 'result', 'state/list': list, 'state/tally': {}, 'state/gains': gains, 'state/endsAt': now + 7000, ...H.gains(gains) });
          } else H.up({ 'state/phase': 'vote', 'state/list': list, 'state/endsAt': now + 25000 + list.length * 3000 });
        }
      } else if (st.phase === 'vote') {
        const v = c.inputs.v || {}, list = st.list || [];
        const authors = new Set(list.map(x => x[0]));
        // اللي يقدر يصوت: أي لاعب عندو على الأقل جواب واحد ماشي ديالو
        const voters = c.ids.filter(id => list.some(x => x[0] !== id));
        if (voters.every(id => v[id]) || now >= st.endsAt) {
          const tally = {}, gains = {};
          Object.entries(v).forEach(([voter, a]) => { if (a !== voter && authors.has(a)) tally[a] = (tally[a] || 0) + 1; });
          const max = Math.max(0, ...Object.values(tally));
          list.forEach(([id, t]) => {
            let g = (tally[id] || 0) * 100;
            if (max > 0 && tally[id] === max) g += 50;
            if (cfg.bonus) g += cfg.bonus(t, st.prompt);
            if (g) gains[id] = g;
          });
          H.up({ 'state/phase': 'result', 'state/tally': tally, 'state/gains': gains, 'state/endsAt': now + 10000, ...H.gains(gains) });
        }
      } else if (st.phase === 'result' && now >= st.endsAt) nextRound(c, r => G.round(c, st, r));
    },
    build(el, c) {
      const st = c.state;
      const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="ws"></div><div class="timer" data-timer></div></div>`;
      const prompt = `<div class="wprompt">${cfg.showPrompt(st.prompt)}</div>`;
      if (st.phase === 'write') {
        const k = st.round + ':' + st.endsAt;
        if (WV.key !== k) { WV.key = k; WV.text = ''; }
        el.innerHTML = `<div class="wv">${top}${prompt}
          <textarea id="wt" maxlength="${cfg.max}" placeholder="${cfg.placeholder}"></textarea>
          <div class="row"><span class="muted" id="wc"></span><span style="flex:1"></span><button class="btn" id="wsend">صيفط ✉️</button></div>
          <div id="wdone" class="muted"></div></div>`;
        const ta = $('#wt', el);
        ta.value = WV.text;
        const cnt = () => { $('#wc', el).textContent = `${ta.value.length}/${cfg.max}${cfg.check ? ' · ' + cfg.check(ta.value, st.prompt) : ''}`; };
        ta.oninput = () => { WV.text = ta.value; cnt(); };
        $('#wsend', el).onclick = () => {
          const t = ta.value.trim();
          if (!t) return toast('كتب شي حاجة الأول ✍️');
          db.set(R() + '/inputs/w/' + myId, t.slice(0, cfg.max));
          beep(700, 0.08);
        };
        cnt();
        beep(600, 0.2);
      } else if (st.phase === 'vote') {
        el.innerHTML = `<div class="wv">${top}${prompt}<h3>🗳️ صوت على أحسن ${cfg.noun} (ماتقدرش تصوت على ديالك)</h3><div class="wlist" id="wl"></div></div>`;
        $('#wl', el).onclick = e => {
          const b = e.target.closest('[data-v]');
          if (b && ctx().state.phase === 'vote') db.set(R() + '/inputs/v/' + myId, b.dataset.v);
        };
      } else {
        const list = (st.list || []).slice().sort((a, b) => ((st.tally || {})[b[0]] || 0) - ((st.tally || {})[a[0]] || 0));
        el.innerHTML = `<div class="wv">${top}${prompt}<h3>🏆 النتيجة</h3><div class="wlist">${list.map(([id, t], i) => `
          <div class="wcard ${i === 0 && (st.tally || {})[id] ? 'win' : ''}"><div class="wtext">${esc(t)}</div>
          <div class="wmeta">${pTag(c, id)} <span>🗳️ ${(st.tally || {})[id] || 0}</span>${cfg.check ? `<span class="muted">${cfg.check(t, st.prompt)}</span>` : ''}<b class="good">+${(st.gains || {})[id] || 0}</b></div></div>`).join('') || '<p class="muted">حتى واحد ماكتب والو 😅</p>'}</div></div>`;
        ding();
      }
    },
    update(el, c) {
      const st = c.state, s = $('#ws', el);
      if (st.phase === 'write') {
        const w = c.inputs.w || {};
        s.textContent = `صيفطو ${Object.keys(w).length}/${c.ids.length}`;
        $('#wdone', el).textContent = w[c.me] ? '✓ تصيفط! تقدر تبدلو وتعاود تصيفط قبل مايسالي الوقت' : '';
      } else if (st.phase === 'vote') {
        const v = c.inputs.v || {};
        s.textContent = `صوتو ${Object.keys(v).length}`;
        const html = (st.list || []).map(([id, t]) => {
          const mine = id === c.me, voted = v[c.me] === id;
          return `<div class="wcard ${voted ? 'voted' : ''}"><div class="wtext">${esc(t)}</div><div class="wmeta">
            ${cfg.check ? `<span class="muted">${cfg.check(t, st.prompt)}</span>` : ''}<span style="flex:1"></span>
            ${mine ? '<span class="muted">هادي ديالك</span>' : `<button class="btn small ${voted ? '' : 'ghost'}" data-v="${id}">${voted ? '✓ صوتتي' : '👍 هادي'}</button>`}</div></div>`;
        }).join('');
        const wl = $('#wl', el);
        if (wl._h !== html) { wl.innerHTML = html; wl._h = html; }
      } else if (s) s.textContent = '';
    }
  };
  return G;
}

const hasWord = (text, w) => stripAl(norm(text)).includes(stripAl(norm(w))) || norm(text).includes(norm(w));
const Complete = makeWriteVote({
  id: 'complete', title: 'كمل الجملة', icon: '💬', desc: 'كمل الجملة بأضحك جواب، والكل كيصوت', noun: 'جواب',
  times: [[45, '45 ثانية'], [60, '60 ثانية'], [90, '90 ثانية']], defTime: 60, max: 140, placeholder: 'كمل الجملة هنا...',
  prompt(used) {
    const avail = COMPLETE_PROMPTS.filter(p => !used.includes(p));
    const p = pick(avail.length ? avail : COMPLETE_PROMPTS);
    return { key: p, v: p };
  },
  showPrompt: p => `<span class="muted">كمل الجملة:</span><b>${esc(p)}</b>`
});
const Story = makeWriteVote({
  id: 'story', title: '3 كلمات', icon: '📖', desc: '3 كلمات عشوائيين: دير بيهم جملة ولا قصة قصيرة زوينة', noun: 'قصة',
  times: [[60, '60 ثانية'], [90, '90 ثانية'], [120, '120 ثانية']], defTime: 90, max: 280, placeholder: 'كتب القصة ديالك هنا...',
  prompt(used) {
    const w = shuffle(STORY_WORDS).slice(0, 3);
    return { key: w.join('-'), v: w };
  },
  showPrompt: w => `<span class="muted">استعمل هاد الكلمات:</span><div class="wchips">${(w || []).map(x => `<span class="wchip">${esc(x)}</span>`).join('')}</div>`,
  check(t, w) {
    const n = (w || []).filter(x => hasWord(t, x)).length;
    return n === 3 ? '✔️ فيها 3 كلمات' : `⚠️ فيها ${n}/3`;
  },
  bonus: (t, w) => ((w || []).every(x => hasWord(t, x)) ? 50 : 0)
});

// =====================================================================
// 🔠 الكلمات بالزربة
// =====================================================================
const SW = { key: '', words: [] };
function canMake(word, letters) {
  const pool = {};
  letters.forEach(l => { const n = norm(l); pool[n] = (pool[n] || 0) + 1; });
  for (const ch of norm(word).replace(/\s/g, '')) { if (!pool[ch]) return false; pool[ch]--; }
  return true;
}
const Scramble = {
  id: 'scramble', title: 'الكلمات بالزربة', icon: '🔠', desc: 'كون أكبر عدد ديال الكلمات من الحروف المخلطين', min: 1,
  settings: [
    { k: 'rounds', label: 'عدد الجولات', opts: [[2, '2'], [3, '3'], [5, '5']], def: 3 },
    { k: 'time', label: 'الوقت', opts: [[60, '60 ثانية'], [90, '90 ثانية'], [120, '120 ثانية']], def: 90 }
  ],
  init(c, o) { return { state: Scramble.round(c, { total: +o.rounds, time: +o.time * 1000, used: [] }, 0) }; },
  round(c, b, r) {
    const used = b.used || [];
    const avail = SCRAMBLE_WORDS.filter(w => !used.includes(w));
    const base = pick(avail.length ? avail : SCRAMBLE_WORDS);
    return { phase: 'play', round: r, total: b.total, time: b.time, used: [...used, base], base, letters: shuffle([...base]), endsAt: c.now + b.time };
  },
  key: c => c.state.phase + ':' + c.state.round,
  badge(c, id) { const w = c.inputs.sw && c.inputs.sw[id]; return c.state.phase === 'play' && w ? String(w.length) : ''; },
  allWords(c) {
    const st = c.state, m = {};
    for (const [id, arr] of Object.entries(c.inputs.sw || {})) {
      const seen = new Set();
      (arr || []).forEach(w => {
        const k = norm(w);
        if (seen.has(k) || k.length < 2 || !canMake(k, st.letters)) return;
        seen.add(k);
        (m[k] = m[k] || { w, ids: [] }).ids.push(id);
      });
    }
    return m;
  },
  valid(c, k) { return !(c.state.rej && c.state.rej[k]); },
  score(c) {
    const m = Scramble.allWords(c), gains = {};
    for (const [k, x] of Object.entries(m)) {
      if (!Scramble.valid(c, k)) continue;
      const p = k.replace(/\s/g, '').length * (x.ids.length === 1 ? 2 : 1);
      x.ids.forEach(id => (gains[id] = (gains[id] || 0) + p));
    }
    H.up({ 'state/phase': 'scored', 'state/gains': gains, 'state/endsAt': c.now + 9000, ...H.gains(gains) });
  },
  tick(c) {
    const st = c.state;
    if (st.phase === 'play' && c.now >= st.endsAt) H.up({ 'state/phase': 'review', 'state/endsAt': null, 'state/rej': null });
    else if (st.phase === 'scored' && c.now >= st.endsAt) nextRound(c, r => Scramble.round(c, st, r));
  },
  build(el, c) {
    const st = c.state;
    const top = `<div class="topbar"><div class="round">جولة ${st.round + 1}/${st.total}</div><div class="status" id="scs"></div><div class="timer" data-timer></div></div>`;
    const tiles = `<div class="stiles">${st.letters.map((l, i) => `<button class="stile" data-i="${i}">${l}</button>`).join('')}</div>`;
    if (st.phase === 'play') {
      const k = st.round + ':' + st.base;
      if (SW.key !== k) { SW.key = k; SW.words = []; }
      el.innerHTML = `<div class="scramble">${top}<h3 class="center">كون كلمات من هاد الحروف (كل حرف مرة وحدة فالكلمة)</h3>${tiles}
        <form class="row" id="sf"><input id="si" maxlength="12" autocomplete="off" placeholder="كتب كلمة..."><button class="btn">زيد ➕</button><button type="button" class="btn ghost" id="sclr">✖</button></form>
        <div class="swords" id="sw"></div></div>`;
      const inp = $('#si', el);
      const save = () => db.set(R() + '/inputs/sw/' + myId, SW.words);
      const drawWords = () => {
        $('#sw', el).innerHTML = SW.words.map((w, i) => `<span class="swchip">${esc(w)} <button data-r="${i}">×</button></span>`).join('') || '<span class="muted">مازال ماكتبتي حتى كلمة</span>';
      };
      $$('.stile', el).forEach(b => b.onclick = () => { inp.value += b.textContent; inp.focus(); });
      $('#sclr', el).onclick = () => { inp.value = ''; inp.focus(); };
      $('#sw', el).onclick = e => { const b = e.target.closest('[data-r]'); if (b) { SW.words.splice(+b.dataset.r, 1); save(); drawWords(); } };
      $('#sf', el).onsubmit = e => {
        e.preventDefault();
        const w = inp.value.trim();
        if (norm(w).length < 2) return toast('الكلمة خاصها حرفين على الأقل');
        if (!canMake(w, st.letters)) return toast('هاد الكلمة فيها حروف ماكايناش 🙅');
        if (SW.words.some(x => norm(x) === norm(w))) return toast('كتبتيها من قبل 😉');
        SW.words.unshift(w); save(); drawWords(); inp.value = ''; beep(760, 0.06);
      };
      drawWords();
      setTimeout(() => inp.focus(), 50);
    } else {
      el.innerHTML = `<div class="scramble">${top}${tiles}<p class="center muted">الكلمة الطويلة كانت: <b class="good">${esc(st.base)}</b></p>
        <div class="swords review" id="rv"></div><div class="lfoot" id="sft"></div></div>`;
      $$('.stile', el).forEach(b => (b.disabled = true));
      $('#rv', el).onclick = e => {
        const b = e.target.closest('[data-k]'), cc = ctx();
        if (!b || !cc.isHost || cc.state.phase !== 'review') return;
        db.set(R() + '/state/rej/' + b.dataset.k, b.dataset.ok === '1');
      };
    }
  },
  update(el, c) {
    const st = c.state, s = $('#scs', el);
    if (st.phase === 'play') { s.textContent = `عندك ${SW.words.length} كلمات`; return; }
    s.textContent = '';
    const m = Scramble.allWords(c), review = st.phase === 'review';
    const html = Object.entries(m).sort((a, b) => b[0].length - a[0].length).map(([k, x]) => {
      const ok = Scramble.valid(c, k);
      const p = k.replace(/\s/g, '').length * (x.ids.length === 1 ? 2 : 1);
      return `<span class="swchip ${ok ? 'ok' : 'bad'} ${review && c.isHost ? 'tap' : ''}" data-k="${esc(k)}" data-ok="${ok ? 1 : 0}" title="${esc(x.ids.map(id => pName(c, id)).join('، '))}">
        ${esc(x.w)} <small>${x.ids.length === 1 ? (c.players[x.ids[0]] || {}).a || '' : '×' + x.ids.length}</small>${ok ? ` <sup>+${p}</sup>` : ''}</span>`;
    }).join('') || '<p class="muted">حتى واحد ماكتب كلمة 😅</p>';
    const rv = $('#rv', el);
    if (rv._h !== html) { rv.innerHTML = html; rv._h = html; }
    const f = $('#sft', el);
    if (review) {
      if (c.isHost) {
        if (!$('#calc', f)) {
          f.innerHTML = `<p class="muted">كليكي على الكلمات اللي ماكايناش باش ترفضها (الكلمة اللي لقيتيها بوحدك نقطها ×2)</p><button class="btn big" id="calc">✅ حسب النقط</button>`;
          $('#calc', f).onclick = () => Scramble.score(ctx());
        }
      } else f.innerHTML = '<p class="muted">⏳ الهوست كيراجع الكلمات...</p>';
    } else f.innerHTML = gainList(c, st.gains);
  }
};

Object.assign(GAMES, { story: Story, complete: Complete, scramble: Scramble, typing: Typing, reaction: Reaction, memory: Memory });

main();
