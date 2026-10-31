// Shared data helpers for the r3lik.com mockups: real status.json + git log, PT clock.
window.R3 = (() => {
  const TZ = 'America/Los_Angeles';
  const pad = n => String(n).padStart(2, '0');
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function pt(d = new Date(), tz = TZ) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'short', day: 'numeric'
    }).formatToParts(d).map(x => [x.type, x.value]));
    return { h: +p.hour % 24, m: +p.minute, wd: DOW.indexOf(p.weekday), dom: +p.day, hm: `${pad(+p.hour % 24)}:${p.minute}` };
  }
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  let sP, lP;
  const get = url => fetch(url, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const status = () => sP || (sP = get('/status.json'));
  const log = () => lP || (lP = get('/log.json'));

  // every scheduled run in the next 48h, computed from the cron times (stays right as the clock moves)
  function upcoming(jobs, now = pt()) {
    const nowMin = now.h * 60 + now.m, out = [];
    for (const d of [0, 1]) for (const j of jobs || []) {
      if (j.state !== 'scheduled' || !j.times) continue;
      if (j.dow != null && (now.wd + d) % 7 !== j.dow) continue;
      if (j.dom != null && now.dom + d !== j.dom) continue;
      for (const t of j.times) { const at = d * 1440 + toMin(t); if (at > nowMin) out.push({ ...j, t, at, inMin: at - nowMin }); }
    }
    return out.sort((a, b) => a.at - b.at);
  }
  const dur = mins => (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`);
  function ago(iso) {
    if (!iso) return 'never';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 90) return 'just now';
    if (s < 5400) return `${Math.round(s / 60)}m ago`;
    if (s < 129600) return `${Math.round(s / 3600)}h ago`;
    return `${Math.round(s / 86400)}d ago`;
  }
  const fmtPT = iso => (iso ? new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)) : '—');
  const fmtDate = iso => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' }).format(new Date(iso));

  // Field notes: proposed topics only, nothing is written yet.
  const NOTES = [
    { k: 'Separation', t: 'Giving an agent its own accounts, and keeping my wallets out of it' },
    { k: 'Ops', t: 'Eight cron jobs and a kill switch: what an agent in production does all day' },
    { k: 'Guardrails', t: 'Pausing the five-minute signal responder' },
  ];

  // time since r3lik launched chkm8 (status.json launched_at)
  const uptime = (iso, now = Date.now()) => {
    if (!iso) return null;
    const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
    const d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, sec = s % 60;
    return { d, h, m, s: sec, hms: `${pad(h)}:${pad(m)}:${pad(sec)}`, short: `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}` };
  };
  const launchDate = iso => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

  return { TZ, pad, pt, toMin, status, log, upcoming, dur, ago, fmtPT, fmtDate, uptime, launchDate, NOTES, DOW };
})();
