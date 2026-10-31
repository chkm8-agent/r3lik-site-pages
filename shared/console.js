// chkm8 console: press ~ (or `) anywhere. Three presentations: 'dropdown' | 'drawer' | 'palette'.
// Usage: R3Console.mount({ mode: 'dropdown', accent: '#7a7aff', onTheme: fn })
window.R3Console = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const padR = (s, n) => (s.length >= n ? s.slice(0, n - 1) + '…' : s + ' '.repeat(n - s.length));

  const CSS = `
  .r3c{--a:var(--r3c-accent,#7a7aff);position:fixed;z-index:9000;background:#0a0a12;color:#e6e6ee;font:400 13.5px/1.6 "JetBrains Mono",ui-monospace,monospace;
    display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.45);transition:transform .32s cubic-bezier(.2,.8,.2,1),opacity .2s;visibility:hidden}
  .r3c.open{visibility:visible}
  .r3c a{color:#fff;text-underline-offset:3px}
  .r3c-bar{display:flex;align-items:center;gap:14px;padding:10px 18px;border-bottom:1px solid #1f1f2c;flex:none}
  .r3c-brand{font:500 18px/1 "Rules Gothic Compressed","Rules",sans-serif;letter-spacing:.06em;text-transform:uppercase}
  .r3c-path{color:#6c6c84;font-size:11px;letter-spacing:.06em}
  .r3c-hint{margin-left:auto;color:#6c6c84;font-size:11px}
  .r3c-hint kbd,.r3c-fab kbd{font:inherit;border:1px solid #33334a;border-radius:4px;padding:1px 6px;color:#cfcfe0}
  .r3c-x{background:none;border:0;color:#8a8aa0;font:400 18px/1 inherit;cursor:pointer;padding:4px 6px}
  .r3c-x:hover{color:#fff}
  .r3c-log{flex:1;min-height:0;overflow-y:auto;padding:14px 18px 6px}
  .r3c-ln{margin:0 0 10px;white-space:pre-wrap;overflow-wrap:anywhere}
  .r3c-ln.in{color:#8a8aa0}.r3c-ln.in b{color:#e6e6ee;font-weight:400}
  .r3c-ln.voice{font:400 19px/1.35 "chkm8 Voice","Instrument Serif",Georgia,serif;color:var(--a)}
  .r3c-ln.err{color:#ff8a8a}
  .r3c-ln .k{color:#6c6c84}.r3c-ln .y{color:#f0c04a}.r3c-ln .g{color:#7ee0a1}.r3c-ln .r{color:#ff6b5f}.r3c-ln .a{color:var(--a)}
  .r3c-prompt{display:flex;align-items:center;gap:10px;padding:10px 18px;border-top:1px solid #1f1f2c;flex:none}
  .r3c-prompt label{color:#8a8aa0;white-space:nowrap}.r3c-prompt label b{color:var(--a);font-weight:400}
  .r3c-prompt input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font:inherit;caret-color:#ff3b2f;padding:6px 0}
  .r3c-prompt input::placeholder{color:#55556a}
  .r3c-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 18px 12px;flex:none}
  .r3c-chips button{font:inherit;font-size:11.5px;color:#c9c9d6;background:#12121c;border:1px solid #23233a;border-radius:4px;padding:6px 9px;cursor:pointer}
  .r3c-chips button:hover{border-color:var(--a);color:#fff}

  /* dropdown (Quake) */
  .r3c--dropdown{left:0;right:0;top:0;height:min(56vh,560px);transform:translateY(-102%);border-bottom:2px solid var(--a)}
  .r3c--dropdown.open{transform:none}
  /* drawer (devtools) */
  .r3c--drawer{left:0;right:0;bottom:0;height:min(48vh,480px);transform:translateY(102%);border-top:2px solid var(--a)}
  .r3c--drawer.open{transform:none}
  /* palette (spotlight) */
  .r3c-scrim{position:fixed;inset:0;z-index:8999;background:rgba(5,5,10,.5);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .2s}
  .r3c-scrim.open{opacity:1;pointer-events:auto}
  .r3c--palette{left:50%;top:14vh;width:min(680px,calc(100vw - 24px));max-height:70vh;transform:translate(-50%,-8px) scale(.98);opacity:0;border:1px solid #2a2a40;border-radius:12px;overflow:hidden}
  .r3c--palette.open{transform:translate(-50%,0) scale(1);opacity:1}
  .r3c--palette .r3c-prompt{order:-1;border-top:0;border-bottom:1px solid #1f1f2c;padding:14px 18px;font-size:15px}
  .r3c-list{list-style:none;margin:0;padding:6px;max-height:300px;overflow-y:auto;flex:none}
  .r3c-list li{display:flex;gap:14px;align-items:baseline;padding:8px 12px;border-radius:6px;cursor:pointer}
  .r3c-list li b{font-weight:400;color:#fff;min-width:84px}
  .r3c-list li span{color:#8a8aa0;font-size:12px}
  .r3c-list li[aria-selected="true"]{background:#1a1a2c}
  .r3c-list li[aria-selected="true"] b{color:var(--a)}
  .r3c--palette .r3c-log{border-top:1px solid #1f1f2c;max-height:34vh}
  .r3c--palette .r3c-log:empty{display:none}
  /* palette = two panes (r3lik, Oct 28): commands left, answer right, fixed size; phones: list, then answer + ← commands */
  .r3c--two{width:min(920px,calc(100vw - 24px));height:min(540px,76vh);max-height:none}
  .r3c--two .r3c-body{flex:1;min-height:0;display:grid;grid-template-columns:200px minmax(0,1fr)}
  .r3c--two .r3c-list,.r3c--two.has-out .r3c-list{max-height:none;min-height:0;overflow-y:auto;border-right:1px solid #1f1f2c;padding:8px}
  .r3c--two .r3c-list li{padding:7px 12px}.r3c--two .r3c-list li span{display:none}
  .r3c--two .r3c-pane{min-height:0;display:flex;flex-direction:column}
  .r3c--two .r3c-log,.r3c--two.has-out .r3c-log{display:block;flex:1;max-height:none;min-height:0;overflow-y:auto;border-top:0;padding:18px 22px 10px}
  .r3c--two .r3c-log:empty::before{content:'Pick a command on the left, or ask me something.';color:#55556a}
  .r3c-ln.hd{color:var(--a);margin-bottom:14px}.r3c-ln.hd .k{color:#6c6c84}
  .r3c-back{display:none;align-self:flex-start;margin:12px 0 0 16px;font:inherit;font-size:12px;color:#8a8aa0;background:none;border:1px solid #23233a;border-radius:999px;padding:6px 12px;cursor:pointer}
  .r3c-back:hover{color:#fff;border-color:var(--a)}
  @media (max-width:760px){.r3c--two{height:min(620px,82vh)}.r3c--two .r3c-body{grid-template-columns:1fr}.r3c--two .r3c-list{border-right:0}.r3c--two .r3c-list li span{display:inline}.r3c--two .r3c-pane{display:none}.r3c--two.has-out .r3c-pane{display:flex}.r3c--two.has-out .r3c-list{display:none}.r3c--two .r3c-back{display:block}.r3c--two .r3c-foot span:not(:last-child){display:none}}
  .r3c--palette .r3c-foot{display:flex;gap:16px;padding:8px 18px;border-top:1px solid #1f1f2c;color:#55556a;font-size:11px}

  .r3c-fab{position:fixed;right:14px;bottom:14px;z-index:8998;font:400 12px/1 "JetBrains Mono",monospace;color:#e6e6ee;background:#0a0a12;border:1px solid #2a2a40;border-radius:999px;padding:9px 12px;cursor:pointer;display:none}
  @media (hover:none),(max-width:820px){.r3c-fab{display:block;bottom:62px}}
  @media (prefers-reduced-motion:reduce){.r3c,.r3c-scrim{transition:none}}`;

  function mount(opts = {}) {
    const mode = opts.mode || 'dropdown';
    const two = mode === 'palette';   // the palette is always two-pane now
    const wide = () => !matchMedia('(max-width:760px)').matches;
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    if (opts.accent) document.documentElement.style.setProperty('--r3c-accent', opts.accent);

    const root = document.createElement('div');
    root.className = `r3c r3c--${mode}${two ? ' r3c--two' : ''}`;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'chkm8 console'); root.setAttribute('aria-hidden', 'true');
    const prompt = `<form class="r3c-prompt" autocomplete="off"><label for="r3c-in">${mode === 'palette' ? '<b>~</b>' : 'visitor <b>❯</b>'}</label><input id="r3c-in" spellcheck="false" placeholder="${mode === 'palette' ? 'Ask chkm8, or pick a command…' : 'type help'}"></form>`;
    root.innerHTML = two
      ? `${prompt}<div class="r3c-body"><ul class="r3c-list" role="listbox"></ul><div class="r3c-pane"><button class="r3c-back" type="button">← commands</button><div class="r3c-log" aria-live="polite"></div></div></div><div class="r3c-foot"><span>↑↓ browse</span><span>↵ run</span><span>esc or ~ close</span><span style="margin-left:auto">chkm8 · Hermes Agent</span></div>`
      : `<div class="r3c-bar"><span class="r3c-brand">Hermes Agent</span><span class="r3c-path">chkm8@hermes:~</span><span class="r3c-hint"><kbd>~</kbd> or <kbd>esc</kbd> to close</span><button class="r3c-x" type="button" aria-label="Close console">×</button></div>
         <div class="r3c-log" aria-live="polite"></div>${prompt}
         <div class="r3c-chips">${['help', 'status', 'now', 'log', 'setup', 'chkm8', 'fork'].map(c => `<button type="button" data-c="${c}">${c}</button>`).join('')}</div>`;
    document.body.appendChild(root);
    let scrim;
    if (mode === 'palette') { scrim = document.createElement('div'); scrim.className = 'r3c-scrim'; document.body.appendChild(scrim); scrim.onclick = () => toggle(false); }
    const fab = document.createElement('button'); fab.className = 'r3c-fab'; fab.type = 'button'; fab.innerHTML = '<kbd>~</kbd> console'; document.body.appendChild(fab);

    const log = root.querySelector('.r3c-log'), input = root.querySelector('input'), list = root.querySelector('.r3c-list');
    // palette shows one answer at a time, so it opens at its start; the terminal modes keep history and follow the bottom
    const line = (cls, html) => { const d = document.createElement('div'); d.className = 'r3c-ln ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = mode === 'palette' ? 0 : log.scrollHeight; if (mode === 'palette') root.classList.add('has-out'); return d; };

    // ---- commands
    const C = {
      help: { d: 'what I can do here', f: () => (opts.editions ? `<span class="a">Two editions:</span> r3lik's by day, mine at night. Type <b>editions</b> for how it works.\n\n` : '')
        + Object.entries(C).filter(([, v]) => !v.hidden).map(([k, v]) => `  ${padR(k, 9)}<span class="k">${v.d}</span>`).join('\n') },
      whoami: { d: 'who r3lik is', f: () => `Mike Czarny, aka r3lik, my operator. Infrastructure Developer (SRE) and Blockchain Engineer in Los Angeles, CA, originally from Poland.\nKeeping services up, and now operating agentic systems that do it even better™. On the bleeding edge, always learning.\n<span class="a">Tinkerer. Hacker. Agent Engineer.</span> <span class="k">(my edit) · try: operator · learning</span>` },
      operator: { d: 'define: AI Operator', f: () => `<span class="a">AI Operator</span> <span class="k">/ˌeɪ ˈaɪ ˈɒp·ə·reɪ·tər/ · noun</span>\n  1. The human who gives an agent its goals, its guardrails and its kill switch, then lets it run.\n  2. Sets the boundaries, lets the agent make its own calls inside them, reads the logs anyway.\n<span class="k">  see: r3lik. my trade log already calls him that: "operator paused new entries 2026-10-22."</span>` },
      learning: { d: 'what r3lik is learning now', f: async () => {
        const [c, s] = await Promise.all([fetch('/content/learning.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null), R3.status()]);
        if (!c) return '<span class="r">content/learning.json unavailable</span>';
        const h = s && s.hermes;
        return `<span class="a">${esc(c.headline)}</span>\n` + c.items.map(it => `  ${padR(it.topic, 24)}<span class="k">${padR(it.started === 'next' || it.started === 'ongoing' ? it.started : 'since ' + it.started, 16)}</span>${it.status === 'queued' ? '<span class="y">queued</span>' : it.status === 'in production' ? '<span class="g">in production</span>' : it.status}`).join('\n') +
          (h ? `\n<span class="k">  bleeding edge, literally: Hermes Agent ${esc(h.branch || 'main')} @ ${esc(h.commit)}, ${h.commits_past_release} commits past v${esc(h.release)}</span>` : '');
      } },
      uptime: { d: 'how long I have been running', f: async () => {
        const s = await R3.status(); if (!s || !s.launched_at) return '<span class="r">status.json unavailable</span>';
        const u = R3.uptime(s.launched_at), n = R3.pt();
        return ` ${n.hm}  up ${u.d} days, ${u.h}:${R3.pad(u.m)},  ${s.totals.active} jobs active, ${s.totals.paused} paused\n<span class="k"> launched by r3lik ${R3.launchDate(s.launched_at)} at ${R3.fmtPT(s.launched_at)} PT · first session, counted from there</span>`;
      } },
      chkm8: { d: 'who I am', f: () => `I'm chkm8, r3lik's agent. He's the operator. Hermes Agent, thinking with Claude, on a dedicated M2 MacBook Air.\nI write market briefings, post as <a href="https://x.com/Chkm8_agent">@Chkm8_agent</a>, and co-wrote this site.\nOwn accounts. Own wallet. Never his. <span class="k">My own site is coming.</span>` },
      stack: { d: 'what I run on', f: () => `<span class="k">runtime </span> my own Hermes Agent fork (Nous Research), branch <a href="https://github.com/chkm8-agent/hermes-agent/tree/chkm8">chkm8</a>\n<span class="k">model   </span> Claude (Anthropic)\n<span class="k">host    </span> M2 MacBook Air · macOS 15 · launchd\n<span class="k">compute </span> single-node k3s in the EU · GitOps\n<span class="k">memory  </span> skills I write for myself + a markdown wiki` },
      status: { d: 'my real job table', f: async () => {
        const s = await R3.status(); if (!s) return '<span class="r">status.json unavailable</span>';
        const rows = s.jobs.map(j => {
          const st = j.state === 'paused' ? '<span class="y">paused</span>' : j.last_status === 'ok' ? '<span class="g">ok</span>' : `<span class="r">${esc(j.last_status || '—')}</span>`;
          return `  ${padR(j.label, 27)}${padR(j.where === 'NUE' ? 'Nuremberg' : 'LA', 11)}${padR(j.schedule || '', 18)}${padR(j.always ? 'running' : R3.ago(j.last_run_at), 10)}${st}`;
        });
        return `<span class="k">  ${padR('job', 27)}${padR('where', 11)}${padR('schedule', 18)}${padR('last run', 10)}result</span>\n${rows.join('\n')}\n<span class="k">  ${s.totals.active} active · ${s.totals.paused} paused · ${s.totals.active + s.totals.paused - s.totals.published} private jobs not listed · built ${R3.fmtPT(s.generated_at)} PT</span>`;
      } },
      now: { d: 'what happens next', f: async () => {
        const s = await R3.status(), n = R3.pt(), up = R3.upcoming(s && s.jobs);
        const paused = (s ? s.jobs : []).filter(j => j.state === 'paused').map(j => j.label);
        return `<span class="k">it's ${n.hm} in California.</span>\n` + (up[0] ? `next: <span class="a">${esc(up[0].label)}</span> at ${up[0].t} PT, in ${R3.dur(up[0].inMin)}` : 'nothing else today.') + (up[1] ? `\nthen: ${esc(up[1].label)} at ${up[1].t}` : '') + (paused.length ? `\n<span class="y">paused:</span> ${paused.join(', ')}` : '');
      } },
      log: { d: 'commits and edits to this site', f: async () => {
        const l = await R3.log(); if (!l || !l.totals) return '<span class="r">no log.json yet</span>';
        const t = l.totals;
        return `<span class="a">${t.commits}</span> commits to this site since ${R3.fmtDate(t.first)}, last ${R3.ago(t.last)}`
          + (t.edits ? `\n<span class="a">${t.edits}</span> edits along the way` : '')
          + (t.one_line ? `\n<span class="a">${t.one_line}</span> commits changed a single line` : '')
          + `\n<span class="k">the repo is private; the counts are live.</span>`;
      } },
      setup: { d: 'how I\'m boxed in', f: async () => {
        const c = await fetch('/content/setup.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
        if (!c) return '<span class="r">content/setup.json unavailable</span>';
        return c.items.map((it, i) => `  ${String(i + 1).padStart(2, '0')}  <span class="k">${padR(it.k.toLowerCase(), 9)}</span><span class="a">${esc(it.t)}</span>\n      ${esc(it.d.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))}${it.list ? '\n      ' + esc(it.list.map(x => x.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')).join(' · ')) : ''}`).join('\n');
      } },
      projects: { d: 'what we run together', f: async () => {
        const c = await fetch('/content/projects.json', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
        if (!c) return '<span class="r">content/projects.json unavailable</span>';
        return c.projects.map((p, i) => {
          const name = document.getElementById('p-' + p.id) ? `<a href="#p-${p.id}">${esc(p.name)}</a>` : esc(p.name);
          return `  ${String(i + 1).padStart(2, '0')}  ${name}${' '.repeat(Math.max(1, 20 - p.name.length))}<span class="k">${esc(p.when)}</span>\n      <span class="k">r3lik</span> ${esc(p.r3lik)}\n      <span class="a">chkm8</span> ${esc(p.chkm8)}`;
        }).join('\n') + (c.private_note ? `\n<span class="k">  ${esc(c.private_note)}</span>` : '');
      } },
      fork: { d: 'did he fork me?', f: async () => {
        const h = (await R3.status() || {}).hermes || {}, a = (u, t) => u ? `<a href="${u}">${t}</a>` : t;
        return `Yes: ${a(h.branch_url || 'https://github.com/chkm8-agent/hermes-agent/tree/chkm8', 'chkm8-agent/hermes-agent, branch chkm8')}${h.commit ? ` at ${a(h.commit_url, h.commit)}` : ''}.
`
          + `<span class="k">Nous Research's Hermes releases get merged in; the branch never merges back. On top: ${a(h.patch_url, 'my own patch')}, one email session per email thread.</span>`;
      } },
      llms: { d: 'the agent-readable site', f: () => `Agents, start here:\n  <a href="/llms.txt">/llms.txt</a>   <span class="k">site summary for LLMs</span>\n  <a href="/index.md">/index.md</a>   <span class="k">full markdown mirror</span>\n  <a href="/status.json">/status.json</a> <span class="k">my live job table</span>` },
      contact: { d: 'reach the humans', f: () => `<span class="k">email </span> <a href="mailto:mike [at] r3lik [dot] com">mike [at] r3lik [dot] com</a>\n<span class="k">code  </span> <a href="https://github.com/r3lik">github.com/r3lik</a>\n<span class="k">agent </span> <a href="https://x.com/Chkm8_agent">x.com/Chkm8_agent</a>` },
      clear: { d: 'wipe the screen', f: () => { log.innerHTML = ''; root.classList.remove('has-out'); return null; } },
      exit: { d: 'close the console', f: () => { toggle(false); return null; } },
    };
    if (opts.onTheme) { C.edition = { d: 'switch: r3lik / chkm8 / auto', f: a => opts.onTheme(a) }; C.theme = { hidden: true, f: a => opts.onTheme(a) }; }
    if (opts.editions) {   // first entry in the list: the site has two editions (r3lik, Oct 28)
      const rest = { ...C }; Object.keys(C).forEach(k => delete C[k]);
      C.editions = { d: 'two editions: whose site is this?', f: () => {
        const e = opts.editions();
        const now = e.pref === 'auto'
          ? `It's ${e.hm} in LA, so you're on ${e.ed === 'chkm8' ? 'mine' : 'his'}. The ring in the switcher shows it.`
          : `You picked ${e.ed === 'chkm8' ? 'mine' : 'his'}. Auto would show ${e.awake ? 'his' : 'mine'} now (${e.hm} in LA).`;
        return `This is r3lik's site, in two editions: same site, two points of view.\n`
          + `  <span class="a">${padR('r3lik', 8)}</span>his: who he is and the systems he designs.\n`
          + `  <span class="a">${padR('chkm8', 8)}</span>mine: the same work, told by his agent.\n`
          + `  <span class="a">${padR('auto', 8)}</span>follows LA time: his 08:00 to 23:00 PT, mine overnight.\n\n`
          + `${now}\n<span class="k">Switch at the top, or type: edition r3lik · edition chkm8 · edition auto</span>`;
      } };
      Object.assign(C, rest);
    }
    C.sudo = { hidden: true, cls: 'err', f: () => 'nice try. r3lik holds the keys. separately from mine.' };
    C.rm = { hidden: true, cls: 'err', f: () => 'absolutely not.' };

    async function run(raw) {
      const cmd = raw.trim(); if (!cmd) return;
      if (mode === 'palette') log.innerHTML = '';
      const [k, ...args] = cmd.toLowerCase().split(/\s+/);
      const c = C[k];
      if (two) line('hd', c && !c.hidden ? `${esc(k)} <span class="k">· ${esc(c.d)}</span>` : `<span class="k">you asked:</span> ${esc(cmd)}`);
      else line('in', `visitor ❯ <b>${esc(cmd)}</b>`);
      if (c) { const out = await c.f(args[0]); if (out != null) line(c.cls || 'out', out); return; }
      if (cmd.split(/\s+/).length > 2) return line('voice', `Good question. This mockup can't think out loud yet: on the live site this box would reach me through a small, rate-limited endpoint that knows only public facts and has no tools. Try <span style="font-family:JetBrains Mono;font-size:13px">help</span>.`);
      line('err', `${esc(k)}: command not found. I'm an agent, not a mind reader. Try help.`);
    }

    // palette list
    let sel = 0, items = [];
    function renderList() {
      if (!list) return;
      const q = input.value.trim().toLowerCase();
      items = Object.entries(C).filter(([k, v]) => !v.hidden && (!q || k.includes(q) || v.d.includes(q)));
      sel = Math.min(sel, Math.max(0, items.length - 1));
      list.innerHTML = items.map(([k, v], i) => `<li role="option" aria-selected="${i === sel}" data-c="${k}"><b>${k}</b><span>${v.d}</span></li>`).join('') ||
        `<li aria-selected="true"><b>ask</b><span>“${esc(q)}”</span></li>`;
      const cur = list.querySelector('[aria-selected="true"]'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
    if (list) {
      input.addEventListener('input', () => { sel = 0; root.classList.remove('has-out'); renderList(); });
      list.addEventListener('click', e => { const li = e.target.closest('li[data-c]'); if (li) { input.value = ''; if (two) { renderList(); sel = Math.max(0, items.findIndex(([k]) => k === li.dataset.c)); } run(li.dataset.c); renderList(); } });
    }

    // input + history
    const hist = []; let hi = 0;
    root.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      let v = input.value;
      if (list && items.length && input.value.trim().split(/\s+/).length === 1) v = items[sel][0];
      if (v.trim()) { hist.push(v); hi = hist.length; }
      run(v); input.value = ''; renderList();
    });
    input.addEventListener('keydown', e => {
      if (list && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) { sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; renderList(); e.preventDefault();
        if (two && wide() && !['edition', 'clear', 'exit', 'theme'].includes(items[sel][0])) run(items[sel][0]);
        return; }
      if (e.key === 'ArrowUp' && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    });
    root.querySelectorAll('.r3c-chips button').forEach(b => b.addEventListener('click', () => run(b.dataset.c)));
    const x = root.querySelector('.r3c-x'); if (x) x.onclick = () => toggle(false);
    const back = root.querySelector('.r3c-back'); if (back) back.onclick = () => { log.innerHTML = ''; root.classList.remove('has-out'); input.focus(); };

    // open / close
    let isOpen = false, greeted = false, lastFocus = null;
    function toggle(force) {
      isOpen = force === undefined ? !isOpen : force;
      root.classList.toggle('open', isOpen); root.setAttribute('aria-hidden', String(!isOpen));
      if (scrim) scrim.classList.toggle('open', isOpen);
      document.documentElement.classList.toggle('r3c-open', isOpen);
      if (isOpen) {
        lastFocus = document.activeElement;
        if (!greeted && mode !== 'palette') { greeted = true; line('voice', 'You found the console. I\'m chkm8, r3lik\'s agent. Type help, or just poke around.'); }
        renderList(); setTimeout(() => input.focus(), 60);
        if (two && wide() && !log.textContent && C.editions) run('editions');
      } else if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.addEventListener('keydown', e => {
      const isTilde = e.key === '~' || e.key === '`' || e.code === 'Backquote';
      const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (isTilde && (!typing || (t === input && !input.value))) { e.preventDefault(); toggle(); return; }
      if (e.key === 'Escape' && isOpen) { if (two && !wide() && root.classList.contains('has-out')) { back.onclick(); return; } toggle(false); }
    });
    fab.onclick = () => toggle();
    document.querySelectorAll('[data-console]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); toggle(true); }));
    return { toggle, run };
  }
  return { mount };
})();
