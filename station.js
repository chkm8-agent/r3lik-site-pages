// chkm8's 24-hour schedule as a station: a Swiss-railway-style clock plus a split-flap departures board.
//   Station.clock(host, { marks })            -> { tick(up|null|undefined), hot(key, on) }
//   Station.board(host, { jobs, places, onHot }) -> { tick(up|null|undefined), hot(key, on) }
// marks: one entry per scheduled time ({ ...job, t }); key = `${t}|${label}` links clock pips and board rows.
window.Station = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const CREAM = '#f6f0e1', RED = '#ff3b2f', BLUE = '#0000f0', INK = '#0b0b10', AMBER = '#ffd78a';
  const F = {
    cnd: '"Rules Gothic Condensed","Rules",sans-serif', cmp: '"Rules Gothic Compressed","Rules",sans-serif',
    mono: '"JetBrains Mono",ui-monospace,monospace', voice: '"chkm8 Voice","Instrument Serif",Georgia,serif',
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk = (p, tag, a = {}, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    if (text != null) e.textContent = text;
    p.appendChild(e); return e;
  };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const deg = mins => (mins / 1440) * 360;
  const polar = (cx, cy, d, r) => [cx + r * Math.sin(d * Math.PI / 180), cy - r * Math.cos(d * Math.PI / 180)];
  const nowMin = () => { const d = new Date(), p = R3.pt(d); return p.h * 60 + p.m + d.getSeconds() / 60; };
  const failed = j => j.last_status && j.last_status !== 'ok';
  const key = j => `${j.t}|${j.label}`;
  const style = (id, css) => { if (document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s); };
  style('st-base', '@keyframes st-sweep{to{transform:rotate(360deg)}}');

  // ------------------------------------------------------------------ clock
  function clock(host, { marks }) {
    host.innerHTML = '';
    const s = mk(host, 'svg', { viewBox: '0 0 400 400', role: 'img', 'aria-label': "24-hour station clock of chkm8's scheduled jobs" });
    Object.assign(s.style, { width: '100%', height: 'auto', display: 'block', overflow: 'visible' });
    const C = 200;
    mk(s, 'circle', { cx: C, cy: C, r: 194, fill: CREAM });
    for (let i = 0; i < 96; i++) {                         // every 15 min; hours bolder; every 3h longest
      const d = i * 3.75, hr = i % 4 === 0, big = i % 12 === 0;
      const [x1, y1] = polar(C, C, d, big ? 150 : hr ? 162 : 174), [x2, y2] = polar(C, C, d, 182);
      mk(s, 'line', { x1, y1, x2, y2, stroke: INK, 'stroke-width': big ? 7 : hr ? 3.4 : 1.2 });
    }
    for (let h = 0; h < 24; h += 3) {
      const [x, y] = polar(C, C, deg(h * 60), 126);
      mk(s, 'text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK, 'font-family': F.cnd, 'font-size': 24 }, String(h));
    }
    mk(s, 'circle', { cx: C, cy: C, r: 106, fill: 'none', stroke: INK, 'stroke-opacity': .14 });
    const pips = {};
    marks.forEach(m => {
      const [cx, cy] = polar(C, C, deg(toMin(m.t)), 106), f = failed(m);
      const p = mk(s, 'circle', { cx, cy, r: 3.8, fill: f ? CREAM : BLUE, stroke: f ? RED : 'none', 'stroke-width': 2 });
      mk(p, 'title', {}, `${m.t} PT · ${m.label}`);
      pips[key(m)] = { p, m };
    });
    mk(s, 'text', { x: C, y: C - 52, 'text-anchor': 'middle', fill: INK, 'font-family': F.cmp, 'font-size': 24, 'font-weight': 500, 'letter-spacing': 2 }, 'CHKM8');
    mk(s, 'text', { x: C, y: C - 36, 'text-anchor': 'middle', fill: INK, 'fill-opacity': .55, 'font-family': F.mono, 'font-size': 8.5, 'letter-spacing': 1.5 }, '24 H · PACIFIC TIME');
    const nx = mk(s, 'text', { x: C, y: C + 56, 'text-anchor': 'middle', fill: BLUE, 'font-family': F.voice, 'font-size': 19 }, '');
    const nl = mk(s, 'text', { x: C, y: C + 72, 'text-anchor': 'middle', fill: INK, 'fill-opacity': .55, 'font-family': F.mono, 'font-size': 8.5, 'letter-spacing': 1.2 }, '');
    const hour = mk(s, 'g'); mk(hour, 'rect', { x: C - 5, y: C - 104, width: 10, height: 124, fill: INK });
    const min = mk(s, 'g'); mk(min, 'rect', { x: C - 3.6, y: C - 168, width: 7.2, height: 190, fill: INK });
    const sec = mk(s, 'g'); Object.assign(sec.style, { transformBox: 'view-box', transformOrigin: `${C}px ${C}px` });
    mk(sec, 'rect', { x: C - 1.3, y: C - 122, width: 2.6, height: 168, fill: RED });
    mk(sec, 'circle', { cx: C, cy: C - 122, r: 13, fill: RED });
    mk(s, 'circle', { cx: C, cy: C, r: 4, fill: INK });
    const d0 = new Date(), s0 = d0.getSeconds() + d0.getMilliseconds() / 1000;
    if (!reduce) sec.style.animation = `st-sweep 60s linear ${-s0}s infinite`;
    let nextKey = null;
    const paint = k => { const { p, m } = pips[k]; p.setAttribute('fill', k === nextKey ? RED : failed(m) ? CREAM : BLUE); };
    const tick = up => {
      const n = nowMin(), p = R3.pt();
      hour.setAttribute('transform', `rotate(${deg(n)} ${C} ${C})`);
      min.setAttribute('transform', `rotate(${(p.m + new Date().getSeconds() / 60) * 6} ${C} ${C})`);
      if (reduce) sec.setAttribute('transform', `rotate(${new Date().getSeconds() * 6} ${C} ${C})`);
      if (up !== undefined) {
        nextKey = up ? key(up) : null;
        nx.textContent = up ? `next ${up.t}` : '';
        nl.textContent = up ? up.label.toUpperCase() : '';
        Object.keys(pips).forEach(paint);
      }
    };
    return { tick, hot: (k, on) => pips[k] && pips[k].p.setAttribute('r', on ? 6.5 : 3.8) };
  }

  // ------------------------------------------------------------------ departures board
  const FLAGS = {
    US: '<svg class="flag" viewBox="0 0 19 10" aria-hidden="true"><rect width="19" height="10" fill="#f6f0e1"/>' +
      [0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${(i * 10 / 13).toFixed(2)}" width="19" height="${(10 / 13).toFixed(2)}" fill="#c8102e"/>`).join('') +
      '<rect width="7.6" height="5.39" fill="#0a3161"/>' +
      [[1.3, 1], [3.8, 1], [6.3, 1], [2.55, 2.2], [5.05, 2.2], [1.3, 3.4], [3.8, 3.4], [6.3, 3.4], [2.55, 4.5], [5.05, 4.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".42" fill="#f6f0e1"/>`).join('') + '</svg>',
    DE: '<svg class="flag" viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg>',
  };
  const SHORT = { 'Morning market digest': 'Market digest', 'Five Chains digest': 'Five Chains', 'Late-scratch lineup check': 'Late scratches' };
  const CITY = { LA: 'LA', NUE: 'Nuremberg' };
  const COLS = { time: 5, job: 16, city: 9, st: 7 }, TIMED = 6;
  const CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/-';

  function board(host, { jobs, places = {}, onHot }) {
    style('st-board', `
      .flap{container-type:inline-size;background:#08081e;border-radius:10px;padding:16px 16px 12px;box-shadow:0 24px 50px rgba(0,0,30,.45),inset 0 0 0 1px rgba(246,240,225,.08);color:${CREAM};width:100%;box-sizing:border-box;--fs:clamp(9px,calc(3.3cqi - 4.6px),15px)}
      .flap .hd{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;font:400 11px/1 ${F.mono};letter-spacing:.14em;text-transform:uppercase;color:rgba(246,240,225,.62)}
      .flap .hd b{font-weight:400;color:${CREAM}}
      .flap .hd .clk{display:flex;align-items:center;gap:8px}
      .flap .grid{display:grid;grid-template-columns:auto 1fr auto auto;column-gap:clamp(6px,2cqi,14px)}
      .flap .row{display:contents}
      .flap .row > *{display:flex;align-items:center;gap:2px;padding:4px 0;border-top:1px solid rgba(246,240,225,.07)}
      .flap .cols > *{font:400 9.5px/1 ${F.mono};letter-spacing:.12em;text-transform:uppercase;color:rgba(246,240,225,.45);padding:0 0 6px;border:0}
      .flap .sep{grid-column:1 / -1;font:400 9.5px/1 ${F.mono};letter-spacing:.12em;text-transform:uppercase;color:rgba(246,240,225,.45);padding:12px 0 6px}
      .flap .where{gap:6px}
      .flap .cells{display:flex;gap:2px;align-items:center}
      .flap .flag{width:calc(var(--fs) * 1.45);height:auto;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(246,240,225,.18)}
      .flap .t{display:inline-grid;place-items:center;width:.8em;height:1.32em;font:500 var(--fs)/1 ${F.cnd};text-transform:uppercase;background:linear-gradient(#1b1b33 0 49%,#05050f 49% 51%,#16162c 51%);border-radius:2px;color:${CREAM}}
      .flap .t.r{color:${RED}}.flap .t.y{color:${AMBER}}.flap .t.g{color:#a6ffcb}
      .flap .row.next .t{background:linear-gradient(#26266a 0 49%,#05050f 49% 51%,#20205c 51%)}
      .flap .row.hot > *{background:rgba(246,240,225,.06)}
      .flap .row[data-k]{cursor:default}
      .flap .big .t{width:.68em;height:1.22em;font-size:24px}
      .flap .t.flip{animation:st-flip .08s linear}
      @keyframes st-flip{50%{transform:scaleY(.12)}}
      @container (max-width:470px){.flap .where .cells{display:none}.flap{--fs:clamp(9px,calc(4.3cqi - 5px),14px)}}`);
    host.innerHTML = '';
    const el = document.createElement('div'); el.className = 'flap'; host.appendChild(el);
    const cells = n => `<span class="cells">${'<span class="t"></span>'.repeat(n)}</span>`;
    const timedRows = Array.from({ length: TIMED }, () => `<div class="row"><span>${cells(COLS.time)}</span><span>${cells(COLS.job)}</span><span class="where"><i></i>${cells(COLS.city)}</span><span>${cells(COLS.st)}</span></div>`).join('');
    const freq = jobs.filter(j => j.interval_min || j.always);
    const freqRows = freq.map(() => `<div class="row"><span>${cells(COLS.time)}</span><span>${cells(COLS.job)}</span><span class="where"><i></i>${cells(COLS.city)}</span><span>${cells(COLS.st)}</span></div>`).join('');
    el.innerHTML = `<div class="hd"><span>Departures · <b>chkm8</b></span><span class="clk"><span class="cells big">${'<span class="t"></span>'.repeat(5)}</span>PT</span></div>
      <div class="grid"><div class="row cols"><span>Time</span><span>Job</span><span>Runs in</span><span>Status</span></div>${timedRows}
      ${freq.length ? `<div class="sep">Always running</div>${freqRows}` : ''}</div>`;
    const rows = [...el.querySelectorAll('.row:not(.cols)')], clockCells = [...el.querySelectorAll('.big .t')];

    const setCell = (t, ch, cls = '') => {
      ch = (ch || ' ').toUpperCase();
      const want = 't' + (cls ? ' ' + cls : '');
      if (t.textContent === ch) { t.className = want; return; }
      if (reduce) { t.textContent = ch; t.className = want; return; }
      let n = 2 + Math.floor(Math.random() * 7);
      const step = () => {
        t.className = 't'; void t.offsetWidth; t.classList.add('flip');
        if (n-- > 0) { t.textContent = CH[Math.floor(Math.random() * CH.length)]; setTimeout(step, 65); } else { t.textContent = ch; t.className = want; }
      };
      step();
    };
    const setText = (span, str, cls) => [...span.querySelectorAll('.t')].forEach((t, i) => setCell(t, str[i] || ' ', cls));
    const fill = (row, time, j, st, stCls, isNext) => {
      const [c0, c1, c2, c3] = row.children;
      row.classList.toggle('next', !!isNext);
      setText(c0, time); setText(c1, (SHORT[j.label] || j.label).replace(/[^A-Za-z0-9 :/-]/g, '').slice(0, COLS.job));
      const country = (places[j.where] || {}).country || (j.where === 'NUE' ? 'DE' : 'US');
      const flag = c2.querySelector('i'); if (flag.dataset.c !== country) { flag.outerHTML = `<i data-c="${country}">${FLAGS[country] || ''}</i>`; }
      c2.title = (places[j.where] || {}).city || CITY[j.where] || '';
      setText(c2, CITY[j.where] || j.where || '');
      setText(c3, st, stCls);
    };
    let shownKeys = [];
    const render = up => {
      const list = R3.upcoming(jobs, R3.pt()).slice(0, TIMED);
      shownKeys = list.map(key);
      list.forEach((j, i) => {
        const isNext = up ? key(j) === key(up) : i === 0;
        fill(rows[i], j.t, j, isNext ? 'NEXT' : failed(j) ? 'CHECK' : 'ON TIME', isNext ? 'r' : failed(j) ? 'y' : '', isNext);
        rows[i].dataset.k = key(j);
      });
      freq.forEach((j, i) => {
        const r = rows[TIMED + i];
        const time = j.always ? '24/7' : `${j.interval_min}MIN`;
        const [st, cls] = j.state === 'paused' ? ['PAUSED', 'y'] : j.state === 'testing' ? ['TESTING', 'y'] : j.last_status === 'ok' ? ['LIVE', 'g'] : ['CHECK', 'r'];
        fill(r, time, j, st, cls, false);
      });
    };
    rows.forEach(r => {
      r.addEventListener('mouseenter', () => { if (r.dataset.k) { r.classList.add('hot'); onHot && onHot(r.dataset.k, true); } });
      r.addEventListener('mouseleave', () => { r.classList.remove('hot'); r.dataset.k && onHot && onHot(r.dataset.k, false); });
    });
    let lastHm = '';
    const tick = up => {
      const hm = R3.pt().hm;
      if (hm !== lastHm) { lastHm = hm; [...hm].forEach((ch, i) => setCell(clockCells[i], ch)); }
      if (up !== undefined) render(up);
    };
    const hot = (k, on) => rows.forEach(r => r.classList.toggle('hot', on && r.dataset.k === k));
    return { tick, hot };
  }

  return { clock, board };
})();
