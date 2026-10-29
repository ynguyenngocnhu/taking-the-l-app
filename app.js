/* Taking the L: L-Score prototype. Plain JS, no build step. */
(function () {
  'use strict';

  // ---- Model -------------------------------------------------------------
  // Basis from the pitch deck: 1080p served at 2.5 Mbps, 0.1 kWh per GB,
  // Vietnam grid 0.5 kg CO2e per kWh. Other values are placeholders until
  // the Impact+ model and Ember factors are confirmed.
  var ENERGY_KWH_PER_GB = 0.1;
  var BITRATE_MBPS = { '720p': 1.5, '1080p': 2.5, '1440p': 5, '4K': 7.5 };
  var RESOLUTIONS = ['720p', '1080p', '1440p', '4K'];
  var MARKETS = {
    VN: { name: 'Vietnam', grid: 500, line: 610, lineNote: 'deck' },
    ID: { name: 'Indonesia', grid: 700, line: 854, lineNote: 'demo' },
    IN: { name: 'India', grid: 710, line: 866, lineNote: 'demo' }
  };
  var L_CREATOR_TARGET = 10;

  function mbPerView(secs, res) { return secs * BITRATE_MBPS[res] / 8; }
  function lScore(secs, res, market) {
    // grams CO2e per 1,000 views
    return 1000 * (mbPerView(secs, res) / 1000) * ENERGY_KWH_PER_GB * MARKETS[market].grid;
  }
  function viewsPerGB(secs, res) { return Math.floor(1000 / mbPerView(secs, res)); }
  function secondsToEarn(res, market) {
    var perSec = lScore(1, res, market);
    return Math.floor(MARKETS[market].line / perSec);
  }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmt1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function fmtViews(n) {
    if (!n) return '—';
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 2).replace(/\.?0+$/, '') + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(n);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---- Storage (this browser only) --------------------------------------
  var KEY = 'takingthel.v1';
  var SAMPLES = [
    { id: 's1', sample: true, title: 'Serum routine, original', secs: 60, res: '1080p', market: 'VN', views: 980000, color: '#4A3A33' },
    { id: 's2', sample: true, title: 'Serum routine, the L cut', secs: 30, res: '1080p', market: 'VN', views: 1240000, origSecs: 60, color: '#3A2E2A' },
    { id: 's3', sample: true, title: 'Sunscreen in 20 seconds', secs: 20, res: '1080p', market: 'VN', views: 540000, color: '#33302B' }
  ];
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { posts: Array.isArray(d.posts) ? d.posts : [], handle: d.handle || '@your.handle', rate: typeof d.rate === 'number' ? d.rate : 10 };
    } catch (e) { return { posts: [], handle: '@your.handle', rate: 10 }; }
  }
  var store = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode: keep in memory */ } }
  function allPosts() {
    return store.posts.concat(SAMPLES).map(function (p) {
      var s = lScore(p.secs, p.res, p.market);
      return Object.assign({}, p, { score: s, earned: s <= MARKETS[p.market].line });
    });
  }
  function findPost(id) { return allPosts().filter(function (p) { return p.id === id; })[0]; }

  // ---- Draft being weighed ----------------------------------------------
  var draft = { title: '', secs: 60, res: '1080p', market: 'VN', views: '', origSecs: '', fileName: '', videoUrl: '' };

  // ---- Views ---------------------------------------------------------------
  var app = document.getElementById('app');

  function header(kicker, title) {
    return '<div class="row" style="align-items:center;justify-content:flex-start;gap:10px">' +
      '<span class="lbox" style="width:34px;height:34px;font-size:24px" aria-hidden="true">L</span>' +
      '<div style="display:flex;flex-direction:column"><span class="label">' + kicker + '</span><h1 style="font-size:22px">' + title + '</h1></div></div>';
  }

  function viewPosts() {
    var posts = allPosts();
    var earnedCount = posts.filter(function (p) { return p.earned; }).length;
    var bars = '';
    for (var i = 0; i < L_CREATOR_TARGET; i++) bars += '<div style="height:6px;background:' + (i < earnedCount ? 'var(--red)' : '#333') + '"></div>';
    var tiles = posts.map(function (p, i) {
      var colors = ['#3A2E2A', '#4A3A33', '#33302B', '#2E2A3A'];
      return '<a class="tile" href="#receipt-' + esc(p.id) + '" style="background:' + (p.color || colors[i % 4]) + '" aria-label="' + esc(p.title) + ', ' + fmt(p.score) + ' grams per 1,000 views' + (p.earned ? ', L earned' : '') + '">' +
        (p.earned ? '<span class="lbox lb" aria-hidden="true">L</span>' : '') +
        '<span class="meta"><span>▷ ' + fmtViews(p.views) + '</span><span class="' + (p.earned ? 'on' : '') + '">' + fmt(p.score) + '</span></span></a>';
    }).join('');
    var left = Math.max(0, L_CREATOR_TARGET - earnedCount);
    return header("L'Oréal Star", 'My posts') +
      '<div class="row"><label class="field" style="flex:1"><span class="label">Your handle</span><input type="text" id="handle" value="' + esc(store.handle) + '" maxlength="40"></label></div>' +
      '<div class="card"><div class="row"><span class="label">L posts this quarter</span><span class="mono small" style="color:var(--red-text)">' + (left ? left + ' to L Creator' : 'L Creator unlocked') + '</span></div>' +
      '<span style="font:800 32px var(--display)">' + earnedCount + ' <span class="muted" style="font-size:20px">/ ' + L_CREATOR_TARGET + '</span></span>' +
      '<div style="display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px">' + bars + '</div></div>' +
      '<p class="mono small muted">Second number on every tile: g CO₂e per 1,000 views. Red means under the L line for its format and market. Tap a post for its receipt.</p>' +
      '<div class="tiles">' + tiles + '</div>' +
      '<a class="btn primary" href="#weigh">Weigh a post</a>' +
      (store.posts.length ? '' : '<p class="small muted">The three posts above are samples. Weigh one of your own videos to add it here.</p>');
  }

  function scorePanel() {
    var m = MARKETS[draft.market];
    var s = lScore(draft.secs, draft.res, draft.market);
    var earned = s <= m.line;
    var max = Math.max(m.line * 3, s * 1.1);
    var pct = Math.min(100, s / max * 100);
    var mark = m.line / max * 100;
    var need = secondsToEarn('1080p', draft.market);
    var verdict;
    if (earned) verdict = 'L earned. Lighter per view than half the short videos in ' + m.name + ' this quarter.';
    else if (draft.res === '4K' || draft.res === '1440p') verdict = 'A ' + draft.res + ' upload makes the platform serve ' + draft.res + '. Fit it to 1080p' + (draft.secs > need ? ', then cut to ' + need + ' s' : '') + ' to earn the L.';
    else verdict = 'Above the L line. Cut to ' + secondsToEarn(draft.res, draft.market) + ' s to earn the L.';
    var orig = parseFloat(draft.origSecs);
    var claim = (orig && orig > draft.secs) ? Math.round((1 - lScore(draft.secs, draft.res, draft.market) / lScore(orig, draft.res, draft.market)) * 100) : null;
    var mb = mbPerView(draft.secs, draft.res);
    return '<div class="card" aria-live="polite">' +
      '<div class="row" style="align-items:flex-end"><div style="display:flex;flex-direction:column;gap:2px"><span class="label">L-Score · g CO₂e / 1,000 views</span>' +
      '<span class="score" style="color:' + (earned ? 'var(--red-text)' : 'var(--text)') + '">' + fmt(s) + '</span></div>' +
      (earned ? '<span class="lbox" style="width:52px;height:52px;font-size:36px" aria-label="L earned">L</span>' : '') + '</div>' +
      '<div class="bar"><div class="fill" style="width:' + pct.toFixed(1) + '%;background:' + (earned ? 'var(--red)' : '#8C8C8C') + '"></div><div class="mark" style="left:' + mark.toFixed(1) + '%"></div></div>' +
      '<div class="row mono small muted"><span>0</span><span>L line ' + fmt(m.line) + (m.lineNote === 'demo' ? ' (demo)' : '') + '</span><span>' + fmt(max) + '</span></div>' +
      '<p>' + verdict + '</p>' +
      '<div class="grid2"><div class="stat"><span class="label">MB per view</span><b>' + fmt1(mb) + '</b></div>' +
      '<div class="stat"><span class="label">Views per 1 GB day</span><b>' + viewsPerGB(draft.secs, draft.res) + '</b></div>' +
      '<div class="stat"><span class="label">1M views send</span><b>' + fmt1(mb) + ' TB</b></div>' +
      '<div class="stat"><span class="label">' + (claim !== null ? 'vs. your ' + orig + ' s cut' : 'Lighter than') + '</span><b>' + (claim !== null ? '−' + claim + '%' : '—') + '</b></div></div></div>';
  }

  function seg(name, options, current, cols) {
    return '<div class="seg" role="group" aria-label="' + name + '" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' +
      options.map(function (o) {
        return '<button type="button" data-' + name + '="' + o.v + '" aria-pressed="' + (String(o.v) === String(current)) + '">' + o.l + '</button>';
      }).join('') + '</div>';
  }

  function viewWeigh() {
    var marketOpts = Object.keys(MARKETS).map(function (k) { return '<option value="' + k + '"' + (k === draft.market ? ' selected' : '') + '>' + MARKETS[k].name + '</option>'; }).join('');
    return header('Lever 1: seconds · Lever 2: resolution', 'Weigh a post') +
      '<label class="drop" id="drop"><input type="file" id="file" accept="video/*"><span class="label red">Pick a video from your phone</span>' +
      '<span class="small muted">We read its length and resolution in your browser. The video is never uploaded.</span>' +
      (draft.videoUrl ? '<video class="preview" src="' + draft.videoUrl + '" muted playsinline loop autoplay></video><span class="mono small">' + esc(draft.fileName) + '</span>' : '') +
      '</label>' +
      '<div id="score">' + scorePanel() + '</div>' +
      '<div class="card"><span class="label">Lever 1 · seconds</span>' +
      '<div class="row"><input type="range" id="secs" min="5" max="180" step="1" value="' + draft.secs + '" aria-label="Post length in seconds"><span class="mono" style="min-width:56px;text-align:right;font-weight:700" id="secsOut">' + draft.secs + ' s</span></div>' +
      seg('preset', [{ v: 60, l: '60 s' }, { v: 45, l: '45 s' }, { v: 39, l: '39 s' }, { v: 30, l: '30 s' }], draft.secs, 4) +
      '<span class="label" style="margin-top:6px">Lever 2 · top resolution</span>' +
      seg('res', RESOLUTIONS.map(function (r) { return { v: r, l: r }; }), draft.res, 4) + '</div>' +
      '<div class="card"><span class="label">About the post</span>' +
      '<label class="field"><span class="small muted">Title</span><input type="text" id="title" maxlength="60" placeholder="e.g. Serum routine" value="' + esc(draft.title) + '"></label>' +
      '<div class="grid2"><label class="field"><span class="small muted">Market</span><select id="market">' + marketOpts + '</select></label>' +
      '<label class="field"><span class="small muted">Views (optional)</span><input type="number" id="views" min="0" inputmode="numeric" placeholder="1240000" value="' + esc(draft.views) + '"></label></div>' +
      '<label class="field"><span class="small muted">Longer original, in seconds (optional, for the Invisible Edit)</span><input type="number" id="orig" min="0" inputmode="numeric" placeholder="60" value="' + esc(draft.origSecs) + '"></label>' +
      '<p class="small muted">Format: short video. Livestream lines are set after the Weigh-In.</p></div>' +
      '<button class="btn primary" type="button" id="saveBtn">Save and get my Impact Receipt</button>' +
      '<p class="mono small muted">L-Score = 1,000 × seconds × bitrate (GB/s) × energy per GB (kWh) × grid (g CO₂e/kWh). Public inputs, published factors.</p>';
  }

  function receiptHTML(p) {
    var m = MARKETS[p.market];
    var mb = mbPerView(p.secs, p.res);
    var claim = (p.origSecs && p.origSecs > p.secs) ? Math.round((1 - lScore(p.secs, p.res, p.market) / lScore(p.origSecs, p.res, p.market)) * 100) : null;
    return '<div class="receipt" id="receipt">' +
      '<div class="row" style="align-items:center"><span style="font-weight:700;font-size:14px;letter-spacing:.1em">IMPACT RECEIPT</span><span class="lbox" style="width:30px;height:30px;font-size:22px" aria-hidden="true">L</span></div>' +
      '<span style="font-size:11px;color:#4A4A4A">' + esc(store.handle) + ' · ' + esc(p.title || 'Untitled post') + ' · ' + m.name + '</span>' +
      '<div class="dash"></div><dl>' +
      '<dt>seconds</dt><dd>' + p.secs + '</dd>' +
      '<dt>top resolution</dt><dd>' + p.res + '</dd>' +
      '<dt>MB per view</dt><dd>' + fmt1(mb) + '</dd>' +
      '<dt>g CO₂e / 1,000</dt><dd>' + fmt(p.score) + '</dd>' +
      '<dt>L line</dt><dd>' + fmt(m.line) + (m.lineNote === 'demo' ? '*' : '') + '</dd>' +
      '<dt>views per 1 GB day</dt><dd>' + viewsPerGB(p.secs, p.res) + '</dd>' +
      '</dl><div class="dash"></div><dl>' +
      '<dt>result</dt><dd class="' + (p.earned ? 'won' : '') + '">' + (p.earned ? 'L earned' : 'above the L line') + '</dd>' +
      (claim !== null ? '<dt>claim</dt><dd>lighter by ' + claim + '%</dd><dt>vs.</dt><dd style="font-weight:400">my ' + p.origSecs + ' s cut</dd>' : '') +
      '<dt>method</dt><dd style="font-weight:400">loreal.com/L</dd>' +
      '</dl><div class="dash"></div>' +
      '<span class="fine">Modelled per view from public inputs: seconds, top resolution, market. Factors: platform bitrate, Impact+ energy per GB, Ember grid. Not a carbon neutral or net zero claim.' + (m.lineNote === 'demo' ? ' *Demo L line.' : '') + ' Prototype: factors to be confirmed.</span></div>';
  }

  function viewReceipt(id) {
    var p = findPost(id);
    if (!p) return '<h1>Receipt not found</h1><a class="btn ghost" href="#posts">Back to my posts</a>';
    return '<a href="#posts" class="mono small" style="color:var(--muted);text-decoration:none;min-height:40px;display:flex;align-items:center">← MY POSTS</a>' +
      receiptHTML(p) +
      '<button class="btn primary" type="button" id="shareBtn">Share my receipt</button>' +
      '<button class="btn ghost" type="button" id="dlBtn">Save as image</button><div id="imgOut"></div>' +
      (p.sample ? '<p class="small muted">This is a sample post.</p>' : '<button class="btn ghost" type="button" id="delBtn" style="border-color:var(--line-strong);color:var(--muted)">Delete this post</button>');
  }

  function viewEarnings() {
    var earnedCount = allPosts().filter(function (p) { return p.earned; }).length;
    var unlocked = earnedCount >= L_CREATOR_TARGET;
    return header('Earnings', 'The L pays') +
      '<div class="card"><div class="row"><span class="label red">The Lighter Rate</span><span class="mono small muted">TikTok Shop · Shopee</span></div>' +
      '<span class="mono" style="font-size:40px;font-weight:700;line-height:1">+2 pts</span>' +
      '<p>Extra affiliate commission on every L post. Your other posts keep your standard rate.</p>' +
      '<label class="field"><span class="small muted">Your standard commission (%)</span><input type="number" id="rate" min="0" max="50" step="0.5" value="' + store.rate + '"></label>' +
      '<div class="grid2"><div class="stat"><span class="label">Standard</span><b id="rStd">' + store.rate + '%</b></div><div class="stat" style="border-color:var(--red)"><span class="label">L post</span><b id="rL" style="color:var(--red-text)">' + (store.rate + 2) + '%</b></div></div>' +
      '<p class="small muted">Capped until the Vietnam test shows L posts sell enough more to pay for it.</p></div>' +
      '<div class="card"><span class="label red">The L-Media Fund</span><p>Paid boosts from L\'Oréal, spent only on L posts. Unlocks when you become an L Creator: ' + L_CREATOR_TARGET + ' L posts in a quarter.</p>' +
      '<div class="row mono"><span class="small">L posts this quarter</span><b>' + earnedCount + ' / ' + L_CREATOR_TARGET + '</b></div>' +
      '<div style="height:6px;background:#333;display:flex"><div style="width:' + Math.min(100, earnedCount / L_CREATOR_TARGET * 100) + '%;background:var(--red)"></div></div>' +
      '<span class="mono small" style="color:' + (unlocked ? 'var(--red-text)' : 'var(--muted)') + '">' + (unlocked ? 'Unlocked: your L posts get boosted' : 'Locked') + '</span></div>' +
      '<div style="background:var(--red);color:var(--ink);padding:16px;display:flex;flex-direction:column;gap:6px"><span class="mono small" style="font-weight:700;letter-spacing:.1em">REFILL BONUS</span><span style="font-weight:700">Refillable products earn a further premium on top of the Lighter Rate.</span></div>' +
      '<a class="btn primary" href="#weigh">Weigh my next post</a>';
  }

  function viewMethod() {
    var rows = Object.keys(MARKETS).map(function (k) {
      var m = MARKETS[k];
      return '<tr><td>' + m.name + ' · short video</td><td>' + m.grid + '</td><td>' + fmt(m.line) + (m.lineNote === 'demo' ? '*' : '') + '</td></tr>';
    }).join('');
    var br = RESOLUTIONS.map(function (r) { return '<tr><td>' + r + '</td><td>' + BITRATE_MBPS[r] + ' Mbps</td></tr>'; }).join('');
    return header('loreal.com/L · open to any brand', 'The L method') +
      '<div class="card" style="background:var(--cream);color:var(--ink);border:0"><span class="label" style="color:#4A4A4A">The Weigh-In</span><span class="mono" style="font-size:28px;font-weight:700">[X] t CO₂e</span><span class="small">L\'Oréal weighs a year of its own SAPMENA social content first, by market and format, and publishes the tonnage.</span></div>' +
      '<div class="card"><span class="label">The formula</span><p class="mono small">L-Score = 1,000 × seconds × bitrate (GB/s) × energy per GB (kWh) × grid (g CO₂e/kWh)</p>' +
      '<p class="small muted">Energy per GB: ' + ENERGY_KWH_PER_GB + ' kWh (Impact+ to confirm). The creator controls seconds and top resolution. Compressing a 1080p upload does not change the score, because the platform re-encodes it.</p></div>' +
      '<div class="card"><span class="label">Markets · grid g/kWh · L line</span><table><tbody>' + rows + '</tbody></table><p class="small muted">*Demo line. Real lines are the format median per market, reset every quarter, and they only move down.</p></div>' +
      '<div class="card"><span class="label">Bitrate the platform serves</span><table><tbody>' + br + '</tbody></table><p class="small muted">1080p from the deck basis. Others are placeholders.</p></div>' +
      '<button class="btn ghost" type="button" id="resetBtn" style="border-color:var(--line-strong);color:var(--muted)">Clear my test data</button>' +
      '<p class="small muted">Prototype for the WPP × L\'Oréal SAPMENA Limitless Pitch 2026. Your posts are stored only in this browser.</p>';
  }

  // ---- Router --------------------------------------------------------------
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'posts';
    var parts = h.indexOf('receipt-') === 0 ? ['receipt', h.slice(8)] : h.split('/');
    var tab = parts[0];
    var html;
    if (tab === 'weigh') html = viewWeigh();
    else if (tab === 'receipt') html = viewReceipt(parts[1]);
    else if (tab === 'earnings') html = viewEarnings();
    else if (tab === 'method') html = viewMethod();
    else { tab = 'posts'; html = viewPosts(); }
    app.innerHTML = html;
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.getAttribute('data-tab') === (tab === 'receipt' ? 'posts' : tab)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    bind(tab, parts[1]);
  }

  function refreshScore() {
    var el = document.getElementById('score');
    if (el) el.innerHTML = scorePanel();
    var out = document.getElementById('secsOut');
    if (out) out.textContent = draft.secs + ' s';
    var r = document.getElementById('secs');
    if (r && +r.value !== draft.secs) r.value = draft.secs;
    document.querySelectorAll('[data-preset]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-preset') === draft.secs)); });
    document.querySelectorAll('[data-res]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-res') === draft.res)); });
  }

  function resFromSize(w, h) {
    var short = Math.min(w, h);
    if (short >= 2000) return '4K';
    if (short >= 1400) return '1440p';
    if (short >= 1000) return '1080p';
    return '720p';
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function bind(tab, id) {
    if (tab === 'posts') {
      var hd = document.getElementById('handle');
      hd.addEventListener('change', function () {
        var v = hd.value.trim() || '@your.handle';
        store.handle = v.charAt(0) === '@' ? v : '@' + v; save(); hd.value = store.handle;
      });
    }
    if (tab === 'weigh') {
      document.getElementById('file').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        if (draft.videoUrl) URL.revokeObjectURL(draft.videoUrl);
        var url = URL.createObjectURL(f);
        var v = document.createElement('video');
        v.preload = 'metadata'; v.muted = true; v.playsInline = true;
        v.onloadedmetadata = function () {
          if (!isFinite(v.duration) || !v.videoWidth) { toast('Could not read this video. Enter the length by hand.'); return; }
          draft.secs = Math.max(1, Math.round(v.duration));
          draft.res = resFromSize(v.videoWidth, v.videoHeight);
          draft.fileName = f.name + ' · ' + v.videoWidth + '×' + v.videoHeight;
          draft.videoUrl = url;
          if (!draft.title) draft.title = f.name.replace(/\.[^.]+$/, '').slice(0, 60);
          route();
          toast('Read ' + draft.secs + ' s at ' + draft.res);
        };
        v.onerror = function () { toast('Could not read this video. Enter the length by hand.'); };
        v.src = url;
      });
      var r = document.getElementById('secs');
      r.addEventListener('input', function () { draft.secs = +r.value; refreshScore(); });
      document.querySelectorAll('[data-preset]').forEach(function (b) {
        b.addEventListener('click', function () { draft.secs = +b.getAttribute('data-preset'); refreshScore(); });
      });
      document.querySelectorAll('[data-res]').forEach(function (b) {
        b.addEventListener('click', function () { draft.res = b.getAttribute('data-res'); refreshScore(); });
      });
      document.getElementById('market').addEventListener('change', function (e) { draft.market = e.target.value; refreshScore(); });
      document.getElementById('title').addEventListener('input', function (e) { draft.title = e.target.value; });
      document.getElementById('views').addEventListener('input', function (e) { draft.views = e.target.value; });
      document.getElementById('orig').addEventListener('input', function (e) { draft.origSecs = e.target.value; refreshScore(); });
      document.getElementById('saveBtn').addEventListener('click', function () {
        var p = {
          id: 'p' + Date.now().toString(36),
          title: (draft.title || 'Untitled post').slice(0, 60),
          secs: draft.secs, res: draft.res, market: draft.market,
          views: parseInt(draft.views, 10) || 0,
          origSecs: parseInt(draft.origSecs, 10) || null,
          date: new Date().toISOString()
        };
        store.posts.unshift(p); save();
        location.hash = '#receipt-' + p.id;
      });
    }
    if (tab === 'receipt') {
      var p = findPost(id);
      if (!p) return;
      document.getElementById('dlBtn').addEventListener('click', function () {
        drawReceipt(p).then(function (canvas) {
          var url = canvas.toDataURL('image/png');
          var box = document.getElementById('imgOut');
          box.innerHTML = '<img src="' + url + '" alt="Impact Receipt image" style="width:100%;display:block"><p class="small muted">Press and hold the image to save it, or right-click and choose Save image.</p>';
          try { var a = document.createElement('a'); a.download = 'impact-receipt-' + p.secs + 's.png'; a.href = url; a.click(); } catch (e) {}
        });
      });
      document.getElementById('shareBtn').addEventListener('click', function () {
        drawReceipt(p).then(function (canvas) {
          canvas.toBlob(function (blob) {
            var file = new File([blob], 'impact-receipt.png', { type: 'image/png' });
            var text = 'I took the L: ' + fmt(p.score) + ' g CO₂e per 1,000 views. Method: loreal.com/L';
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({ files: [file], text: text }).catch(function () {});
            } else {
              document.getElementById('dlBtn').click();
              toast('Sharing is not available here. Save the image below instead.');
            }
          });
        });
      });
      var del = document.getElementById('delBtn');
      if (del) del.addEventListener('click', function () {
        store.posts = store.posts.filter(function (q) { return q.id !== id; }); save();
        location.hash = '#posts';
      });
    }
    if (tab === 'earnings') {
      var rate = document.getElementById('rate');
      rate.addEventListener('input', function () {
        var v = parseFloat(rate.value);
        if (isNaN(v)) return;
        store.rate = v; save();
        document.getElementById('rStd').textContent = v + '%';
        document.getElementById('rL').textContent = (v + 2) + '%';
      });
    }
    if (tab === 'method') {
      document.getElementById('resetBtn').addEventListener('click', function () {
        var b = document.getElementById('resetBtn');
        if (b.getAttribute('data-armed') !== '1') { b.setAttribute('data-armed', '1'); b.textContent = 'Tap again to delete your test posts'; return; }
        b.removeAttribute('data-armed'); b.textContent = 'Clear my test data';
        store = { posts: [], handle: '@your.handle', rate: 10 }; save();
        toast('Test data cleared');
      });
    }
  }

  // ---- Receipt image (1080 × 1350) ------------------------------------------
  function drawReceipt(p) {
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    return ready.then(function () {
      var m = MARKETS[p.market];
      var c = document.createElement('canvas');
      c.width = 1080; c.height = 1350;
      var x = c.getContext('2d');
      x.fillStyle = '#0D0D0D'; x.fillRect(0, 0, 1080, 1350);
      x.fillStyle = '#F3EFE7'; x.fillRect(80, 80, 920, 1190);
      x.fillStyle = '#E52521'; x.fillRect(860, 120, 100, 100);
      x.fillStyle = '#0D0D0D'; x.font = '900 80px Archivo, sans-serif'; x.textAlign = 'center'; x.fillText('L', 910, 200);
      x.textAlign = 'left';
      x.font = '700 40px "JetBrains Mono", monospace'; x.fillText('IMPACT RECEIPT', 130, 185);
      x.fillStyle = '#4A4A4A'; x.font = '400 26px "JetBrains Mono", monospace';
      x.fillText((store.handle + ' · ' + (p.title || 'Untitled') + ' · ' + m.name).slice(0, 52), 130, 260);
      function dash(y) { x.strokeStyle = '#8C8C8C'; x.setLineDash([10, 8]); x.lineWidth = 2; x.beginPath(); x.moveTo(130, y); x.lineTo(950, y); x.stroke(); x.setLineDash([]); }
      dash(300);
      var claim = (p.origSecs && p.origSecs > p.secs) ? Math.round((1 - lScore(p.secs, p.res, p.market) / lScore(p.origSecs, p.res, p.market)) * 100) : null;
      var rows = [['seconds', String(p.secs)], ['top resolution', p.res], ['MB per view', fmt1(mbPerView(p.secs, p.res))], ['g CO2e / 1,000', fmt(p.score)], ['L line', fmt(m.line)], ['views per 1 GB day', String(viewsPerGB(p.secs, p.res))]];
      var y = 370;
      rows.forEach(function (r) {
        x.fillStyle = '#0D0D0D'; x.font = '400 34px "JetBrains Mono", monospace'; x.textAlign = 'left'; x.fillText(r[0], 130, y);
        x.font = '700 34px "JetBrains Mono", monospace'; x.textAlign = 'right'; x.fillText(r[1], 950, y);
        y += 62;
      });
      dash(y - 20); y += 50;
      x.textAlign = 'left';
      x.fillStyle = p.earned ? '#B71C18' : '#0D0D0D';
      x.font = '800 96px Archivo, sans-serif';
      x.fillText(p.earned ? 'L EARNED' : 'ABOVE THE LINE', 130, y + 40);
      y += 120;
      x.fillStyle = '#0D0D0D'; x.font = '400 32px "JetBrains Mono", monospace';
      if (claim !== null) { x.fillText('lighter by ' + claim + '% vs. my ' + p.origSecs + ' s cut', 130, y); y += 54; }
      x.fillText('method: loreal.com/L', 130, y);
      x.fillStyle = '#4A4A4A'; x.font = '400 20px "JetBrains Mono", monospace';
      x.fillText('Modelled per view from public inputs.', 130, 1200);
      x.fillText('Not a carbon neutral or net zero claim.', 130, 1232);
      return c;
    });
  }

  window.addEventListener('hashchange', route);
  route();
})();
