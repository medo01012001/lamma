// ===== طبقة الداتا =====
// 3 أنواع:
//  - PeerDB  (الافتراضي): بلا سيرفر، المتصفح ديال اللي دار الروم هو "السيرفر" (WebRTC عبر PeerJS)
//  - FireDB  (اختياري): Firebase Realtime Database إلا عمرتي config.js
//  - LocalDB (?local): للتجربة بين التابات ديال نفس المتصفح
let _idc = 0;
function makeId() {
  _idc = (_idc + 1) % 1296;
  return Date.now().toString(36) + _idc.toString(36).padStart(2, '0') + Math.random().toString(36).slice(2, 6);
}
const clean = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

class FireDB {
  constructor(cfg) {
    this.mode = 'online';
    firebase.initializeApp(cfg);
    this.d = firebase.database();
    this.offset = 0;
    this.d.ref('.info/serverTimeOffset').on('value', s => (this.offset = s.val() || 0));
  }
  openRoom() { return Promise.resolve({ ok: true }); }
  closeRoom() {}
  ref(p) { return this.d.ref(p); }
  now() { return Date.now() + this.offset; }
  get(p) { return this.ref(p).get().then(s => s.val()); }
  set(p, v) { return this.ref(p).set(clean(v)); }
  update(p, o) {
    const c = {};
    for (const k in o) c[k] = clean(o[k]);
    return this.ref(p).update(c);
  }
  remove(p) { return this.ref(p).remove(); }
  push(p, v) { const r = this.ref(p).push(); r.set(clean(v)); return r.key; }
  on(p, cb) {
    const r = this.ref(p), f = s => cb(s.val());
    r.on('value', f);
    return () => r.off('value', f);
  }
  onChild(p, added, removed, limit) {
    let q = this.ref(p);
    if (limit) q = q.limitToLast(limit);
    const a = s => added(s.key, s.val()), d = s => removed && removed(s.key);
    q.on('child_added', a); q.on('child_removed', d);
    return () => { q.off('child_added', a); q.off('child_removed', d); };
  }
  onDisconnectRemove(p) { this.ref(p).onDisconnect().remove(); }
  onConnection(cb) { this.ref('.info/connected').on('value', s => cb(!!s.val())); }
}

// شجرة داتا فالذاكرة مع listeners (القاعدة ديال LocalDB و PeerDB)
class TreeDB {
  constructor() { this.tree = {}; this.subs = new Set(); }
  openRoom() { return Promise.resolve({ ok: true }); }
  closeRoom() {}
  now() { return Date.now(); }
  _parts(p) { return p.split('/').filter(Boolean); }
  _get(parts) {
    let n = this.tree;
    for (const k of parts) { if (n == null || typeof n !== 'object') return null; n = n[k]; }
    return n === undefined ? null : n;
  }
  _set(parts, v) {
    if (!parts.length) { this.tree = v && typeof v === 'object' ? v : {}; return; }
    let n = this.tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (n[parts[i]] == null || typeof n[parts[i]] !== 'object') n[parts[i]] = {};
      n = n[parts[i]];
    }
    const last = parts[parts.length - 1];
    if (v === null) delete n[last]; else n[last] = v;
  }
  _apply(ops, origin) {
    for (const op of ops) this._set(this._parts(op.p), op.v);
    this._out(ops, origin);
    for (const s of [...this.subs]) {
      if (ops.some(op => op.p.startsWith(s.p) || s.p.startsWith(op.p))) this._fire(s);
    }
  }
  _out() {}
  _fireAll() { for (const s of [...this.subs]) this._fire(s); }
  _fire(s) {
    if (!this.subs.has(s)) return;
    const val = this._get(this._parts(s.p));
    if (s.child) {
      const obj = val && typeof val === 'object' ? val : {};
      const keys = Object.keys(obj).sort();
      const now = new Set(keys);
      for (const k of [...s.known]) if (!now.has(k)) { s.known.delete(k); s.removed && s.removed(k); }
      for (const k of keys) if (!s.known.has(k)) { s.known.add(k); s.added(k, clean(obj[k])); }
    } else {
      const j = JSON.stringify(val);
      if (j === s.last) return;
      s.last = j;
      s.cb(val == null ? null : JSON.parse(j));
    }
  }
  get(p) { return Promise.resolve(clean(this._get(this._parts(p)))); }
  set(p, v) { this._apply([{ p, v: clean(v) }], 'self'); return Promise.resolve(); }
  update(p, o) { this._apply(Object.keys(o).map(k => ({ p: p + '/' + k, v: clean(o[k]) })), 'self'); return Promise.resolve(); }
  remove(p) { return this.set(p, null); }
  push(p, v) { const k = makeId(); this.set(p + '/' + k, v); return k; }
  on(p, cb) {
    const s = { p, cb, last: undefined };
    this.subs.add(s);
    queueMicrotask(() => this._fire(s));
    return () => this.subs.delete(s);
  }
  onChild(p, added, removed) {
    const s = { p, child: true, added, removed, known: new Set() };
    this.subs.add(s);
    queueMicrotask(() => this._fire(s));
    return () => this.subs.delete(s);
  }
  onDisconnectRemove() {}
  onConnection() {}
}

class LocalDB extends TreeDB {
  constructor() {
    super();
    this.mode = 'local';
    this.LK = 'lamma_local_tree';
    this.disc = [];
    try { this.tree = JSON.parse(localStorage.getItem(this.LK) || '{}'); } catch { this.tree = {}; }
    try {
      this.ch = new BroadcastChannel('lamma-db');
      this.ch.onmessage = e => this._apply(e.data, 'remote');
    } catch { this.ch = null; }
    addEventListener('pagehide', () => this.disc.forEach(p => this.remove(p)));
  }
  _out(ops, origin) {
    if (origin !== 'self') return;
    try { localStorage.setItem(this.LK, JSON.stringify(this.tree)); } catch {}
    if (this.ch) this.ch.postMessage(ops);
  }
  onDisconnectRemove(p) { if (!this.disc.includes(p)) this.disc.push(p); }
}

// ===== SupaDB: Supabase Realtime (broadcast + presence) =====
// كل لاعب عندو نسخة من الداتا، والتبديلات كتدوز للكل عبر قناة ديال الروم.
// إلا خرج الهوست، الداتا باقية عند الباقيين واللعبة كتكمل.
class SupaDB extends TreeDB {
  constructor(cfg) {
    super();
    this.mode = 'supa';
    this.sb = supabase.createClient(cfg.url, cfg.key, { realtime: { params: { eventsPerSecond: 20 } } });
    this.offset = 0;
    this.cid = makeId();
    this.q = []; this.disc = []; this.pending = [];
  }
  now() { return Date.now() + this.offset; }
  openRoom(code, create) {
    this.closeRoom(true);
    this.code = code;
    this.t0 = Date.now();
    this.ready = false; this.pending = [];
    return new Promise(res => {
      let done = false;
      const fin = r => { if (!done) { done = true; res(r); } };
      const ch = this.sb.channel('lamma-' + code, { config: { broadcast: { self: false }, presence: { key: this.cid } } });
      this.ch = ch;
      ch.on('broadcast', { event: 'ops' }, ({ payload }) => {
        if (this.ch !== ch) return;
        if (this.ready) this._apply(payload.ops, 'remote'); else this.pending.push(...payload.ops);
      });
      ch.on('broadcast', { event: 'hello' }, ({ payload }) => {
        if (this.ch === ch && this.ready && this._responder(payload.cid))
          ch.send({ type: 'broadcast', event: 'snap', payload: { to: payload.cid, tree: this.tree, now: this.now() } });
      });
      ch.on('broadcast', { event: 'snap' }, ({ payload }) => {
        if (this.ch !== ch || payload.to !== this.cid || this.ready) return;
        this.tree = payload.tree || {};
        this.offset = payload.now - Date.now();
        this.ready = true;
        const p = this.pending; this.pending = [];
        if (p.length) for (const op of p) this._set(this._parts(op.p), op.v);
        this._fireAll();
        fin({ ok: true });
      });
      ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (this.ch !== ch || !this.ready) return;
        const ops = [];
        (leftPresences || []).forEach(p => (p.disc || []).forEach(x => ops.push({ p: x, v: null })));
        if (ops.length) this._apply(ops, 'remote');
      });
      ch.subscribe(async st => {
        if (st === 'SUBSCRIBED') {
          await ch.track({ t: this.t0, disc: this.disc });
          if (create) {
            // نتأكدو بلي حتى واحد ماكاين فهاد الروم
            setTimeout(() => {
              const others = Object.keys(ch.presenceState()).filter(k => k !== this.cid);
              if (others.length) { this.closeRoom(); fin({ ok: false, err: 'taken' }); }
              else { this.ready = true; fin({ ok: true }); }
            }, 1200);
          } else {
            const ask = () => !this.ready && this.ch === ch && ch.send({ type: 'broadcast', event: 'hello', payload: { cid: this.cid } });
            ask(); setTimeout(ask, 1500); setTimeout(ask, 3500);
            setTimeout(() => { if (!this.ready) { this.closeRoom(); fin({ ok: false, err: 'nf' }); } }, 7000);
          }
        } else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') {
          if (!done) { this.closeRoom(); fin({ ok: false, err: 'net' }); }
        }
      });
    });
  }
  // اللاعب اللي دخل الأول (من غير اللي طالب) هو اللي كيصيفط الداتا
  _responder(req) {
    const st = this.ch.presenceState();
    let best = null, bt = Infinity;
    for (const k in st) {
      if (k === req) continue;
      const t = (st[k][0] && st[k][0].t) || Infinity;
      if (t < bt || (t === bt && k < best)) { bt = t; best = k; }
    }
    return best === this.cid;
  }
  _out(ops, origin) {
    if (origin !== 'self' || !this.ch) return;
    this.q.push(...ops);
    if (!this._qt) this._qt = setTimeout(() => this._flushQ(), 120);
  }
  _flushQ() {
    clearTimeout(this._qt); this._qt = null;
    if (!this.q.length || !this.ch) return;
    const ops = this.q; this.q = [];
    this.ch.send({ type: 'broadcast', event: 'ops', payload: { ops } });
  }
  onDisconnectRemove(p) {
    if (this.disc.includes(p)) return;
    this.disc.push(p);
    if (this.ch) this.ch.track({ t: this.t0, disc: this.disc });
  }
  closeRoom(keep) {
    if (this.ch) { this._flushQ(); const ch = this.ch; this.ch = null; try { this.sb.removeChannel(ch); } catch {} }
    this.disc = []; this.ready = false;
    if (!keep) this.tree = {};
  }
}

// ===== PeerDB: الهوست كيخبي الداتا وكيوزعها على الكل =====
const PEER_PREFIX = 'lamma-mw-room-';
const PEER_OPTS = {
  debug: 0,
  config: { iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ] }
};

class PeerDB extends TreeDB {
  constructor() {
    super();
    this.mode = 'peer';
    this.offset = 0;
    this.conns = new Map();   // peerId -> {c, disc:[], seen}
    this.isServer = false;
    this.onLost = null;
    setInterval(() => this._heartbeat(), 4000);
    addEventListener('pagehide', () => { if (!this.isServer && this.peer) { try { this.peer.destroy(); } catch {} } });
  }
  now() { return Date.now() + this.offset; }

  openRoom(code, create) {
    this.closeRoom(true);
    this.code = code;
    const pid = PEER_PREFIX + code;
    return new Promise(res => {
      let done = false;
      const fin = r => { if (!done) { done = true; res(r); } };
      if (create) {
        this.isServer = true;
        const p = new Peer(pid, PEER_OPTS);
        this.peer = p;
        p.on('open', () => {
          // إلا كان الهوست دار refresh، كنرجعو الداتا اللي كانت
          try {
            const saved = sessionStorage.getItem('lamma_host_tree_' + code);
            if (saved) { this.tree = JSON.parse(saved); this._ghostSweep(); }
          } catch {}
          fin({ ok: true });
        });
        p.on('connection', c => this._serve(c));
        p.on('disconnected', () => { try { p.reconnect(); } catch {} });
        p.on('error', e => {
          if (e.type === 'unavailable-id') fin({ ok: false, err: 'taken' });
          else if (!done) fin({ ok: false, err: 'net' });
        });
      } else {
        this.isServer = false;
        const p = new Peer(PEER_OPTS);
        this.peer = p;
        const to = setTimeout(() => fin({ ok: false, err: 'nf' }), 12000);
        p.on('open', () => {
          const c = p.connect(pid, { reliable: true });
          this.host = c;
          c.on('data', m => {
            if (!m) return;
            if (m.t === 'snap') {
              clearTimeout(to);
              this.tree = m.tree || {};
              this.offset = m.now - Date.now();
              this._fireAll();
              fin({ ok: true });
            } else if (m.t === 'ops') this._apply(m.ops, 'remote');
          });
          c.on('close', () => { if (this.host === c) { this.host = null; done ? this.onLost && this.onLost() : fin({ ok: false, err: 'nf' }); } });
          c.on('error', () => {});
        });
        p.on('error', e => {
          clearTimeout(to);
          if (!done) fin({ ok: false, err: e.type === 'peer-unavailable' ? 'nf' : 'net' });
          else if (this.host && !this.host.open) { this.host = null; this.onLost && this.onLost(); }
        });
      }
    });
  }

  closeRoom(keepSubs) {
    this.isServer && this.code && sessionStorage.removeItem('lamma_host_tree_' + this.code);
    if (this.peer) { try { this.peer.destroy(); } catch {} }
    this.peer = null; this.host = null; this.conns.clear();
    if (!keepSubs) { this.tree = {}; }
  }

  _serve(c) {
    c.on('open', () => {
      this.conns.set(c.peer, { c, disc: [], seen: Date.now() });
      c.send({ t: 'snap', tree: this.tree, now: Date.now() });
    });
    c.on('data', m => {
      const e = this.conns.get(c.peer);
      if (!m || !e) return;
      e.seen = Date.now();
      if (m.t === 'ops') this._apply(m.ops, c);
      else if (m.t === 'disc' && !e.disc.includes(m.p)) e.disc.push(m.p);
    });
    c.on('close', () => this._drop(c.peer));
    c.on('error', () => this._drop(c.peer));
  }
  _drop(id) {
    const e = this.conns.get(id);
    if (!e) return;
    this.conns.delete(id);
    try { e.c.close(); } catch {}
    if (e.disc.length) this._apply(e.disc.map(p => ({ p, v: null })), 'self');
  }
  _heartbeat() {
    if (this.isServer) {
      const now = Date.now();
      for (const [id, e] of this.conns) {
        if (now - e.seen > 16000) this._drop(id);
        else if (e.c.open) e.c.send({ t: 'ping' });
      }
    } else if (this.host && this.host.open) this.host.send({ t: 'ping' });
  }
  // بعد refresh ديال الهوست: اللاعبين اللي مارجعوش كنحيدوهم
  _ghostSweep() {
    setTimeout(() => {
      const players = this._get(this._parts('rooms/' + this.code + '/players')) || {};
      const alive = new Set([...(this.selfDisc || [])]);
      for (const e of this.conns.values()) e.disc.forEach(p => alive.add(p));
      const ops = [];
      for (const id in players) {
        const p = 'rooms/' + this.code + '/players/' + id;
        if (!alive.has(p)) ops.push({ p, v: null });
      }
      if (ops.length) this._apply(ops, 'self');
    }, 20000);
  }
  _out(ops, origin) {
    if (this.isServer) {
      for (const e of this.conns.values()) if (e.c !== origin && e.c.open) e.c.send({ t: 'ops', ops });
      clearTimeout(this._sv);
      this._sv = setTimeout(() => {
        try { sessionStorage.setItem('lamma_host_tree_' + this.code, JSON.stringify(this.tree)); } catch {}
      }, 800);
    } else if (origin === 'self' && this.host && this.host.open) {
      this.host.send({ t: 'ops', ops });
    }
  }
  onDisconnectRemove(p) {
    if (this.isServer) { (this.selfDisc = this.selfDisc || []).push(p); return; }
    if (this.host && this.host.open) this.host.send({ t: 'disc', p });
  }
}
