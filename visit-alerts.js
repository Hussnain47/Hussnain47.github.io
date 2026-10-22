(() => {
  if (location.origin !== 'https://hussnain47.github.io' || navigator.webdriver || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const endpoint = 'https://portfolio-visit-alerts.hussnain-ilyas11.workers.dev/visit';
  const key = 'portfolio-visit-alert';
  const visitWindow = 30 * 60 * 1000;
  const path = location.pathname === '/index.html' ? '/' : location.pathname;
  const allowed = new Set(['/', '/work/orchestrator-scheduler/', '/work/twitter-data-migration/', '/work/email-template-manager/', '/work/vartana-financing-chatbot/', '/work/educative-payments-promotions/', '/work/decision-labs-geospatial/']);
  if (!allowed.has(path)) return;
  const read = () => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
  const write = value => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Notifications can still work when session storage is unavailable. */ } };
  async function notify() {
    const now = Date.now();
    const previous = read();
    if (previous && now - previous.time < (previous.sent ? visitWindow : 30000)) return;
    write({ time: now, sent: false });
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) throw new Error(`Visit notification failed (${response.status})`);
      write({ time: now, sent: true });
    } catch (error) {
      write(null);
      console.warn('Portfolio visit notification could not be sent.', error.message);
    }
  }
  if (document.visibilityState === 'visible') void notify();
  else document.addEventListener('visibilitychange', function onVisible() {
    if (document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', onVisible);
    void notify();
  });
})();
