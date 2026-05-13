/* ==========================================================================
   Review Mode — activated only via ?review=1 URL flag
   ========================================================================== */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('review') !== '1') return;

  const STORAGE_KEY = 'videodb-review-comments-v2';
  const STORAGE_KEY_OLD = 'videodb-review-comments-v1';
  const PIN_MODE_KEY = 'videodb-review-pin-mode';
  const IDB_NAME = 'videodb-review';
  const IDB_STORE = 'handles';
  const IDB_DIR_KEY = 'feedback-dir-handle';
  const state = {
    comments: [],
    nextId: 1,
    filter: 'open',          // 'open' | 'needs-review' | 'resolved' | 'all'
    activeComment: null,
    hoverEl: null,
    fsDirHandle: null,       // FileSystemDirectoryHandle — persisted to IndexedDB
    selection: [],           // multi-select: array of tagged elements queued for a single comment
    cmdHeld: false,          // tracks Meta/Ctrl held — toggles granular click + multi-select
    // Pin mode is an explicit toggle independent of the sidebar:
    //   - sidebar open       → pin behavior is always active (implicit)
    //   - sidebar closed + pinMode true   → user can still drop pins; the
    //     "REVIEW MODE" pill is the on/off toggle for this state
    //   - sidebar closed + pinMode false  → page behaves normally
    // Default to ON so a fresh `?review=1` lets the user pin immediately
    // without first opening the sidebar.
    pinMode: (function () {
      try {
        const v = localStorage.getItem(PIN_MODE_KEY);
        return v === null ? true : v === '1';
      } catch (e) { return true; }
    })(),
  };

  // ── IndexedDB helpers — persist the directory handle across reloads ──
  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbGet(key) {
    try {
      const db = await idbOpen();
      return await new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const g = tx.objectStore(IDB_STORE).get(key);
        g.onsuccess = () => resolve(g.result || null);
        g.onerror = () => resolve(null);
      });
    } catch (e) { return null; }
  }
  async function idbSet(key, value) {
    try {
      const db = await idbOpen();
      return await new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (e) { /* silent */ }
  }
  async function idbDelete(key) {
    try {
      const db = await idbOpen();
      return await new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (e) { /* silent */ }
  }

  // ── Permission helper ────────────────────────────────────────
  async function ensurePermission(handle, mode) {
    if (!handle || !handle.queryPermission) return false;
    const opts = { mode: mode || 'readwrite' };
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  // ── Toast (replaces alert for non-blocking feedback) ─────────
  let toastTimer = null;
  function showToast(msg, kind) {
    let toast = document.getElementById('review-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'review-toast';
      toast.className = 'review-toast';
      document.body.appendChild(toast);
    }
    toast.classList.toggle('is-warn', kind === 'warn');
    toast.innerHTML = '<span class="dot"></span><span class="text"></span>';
    toast.querySelector('.text').textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, kind === 'warn' ? 5000 : 3500);
  }

  function updateSaveTargetUI() {
    const row = document.getElementById('review-save-status');
    const path = document.getElementById('review-save-target');
    if (!row || !path) return;
    if (state.fsDirHandle) {
      row.classList.remove('is-unset');
      path.textContent = state.fsDirHandle.name + ' / feedback-bundle-LATEST.json';
    } else {
      row.classList.add('is-unset');
      path.textContent = 'Not set — pick a folder';
    }
  }

  async function pickSaveFolder() {
    if (!window.showDirectoryPicker) {
      showToast('Folder picker not supported — submissions will download', 'warn');
      return false;
    }
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      state.fsDirHandle = dir;
      await idbSet(IDB_DIR_KEY, dir);
      updateSaveTargetUI();
      showToast('Save folder: ' + dir.name);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Folder picker failed:', err);
      return false;
    }
  }

  // ── localStorage ─────────────────────────────────────────────
  function load() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem(STORAGE_KEY_OLD); // migration from v1
      if (raw) {
        const parsed = JSON.parse(raw);
        state.comments = (parsed.comments || []).map(migrateComment);
        state.nextId = parsed.nextId || (state.comments.length + 1);
      }
    } catch (e) { /* ignore */ }
  }

  // Migrate a v2 single-reply comment into the v3 threaded shape on the fly.
  // Old: { comment, attachments, links, claude_reply }
  // New: { comment, attachments, links, claude_reply, history: [
  //         { role:'user', text, attachments, links, created_at },
  //         { role:'claude', text, created_at },
  //         ...follow-ups...
  //       ] }
  // Top-level comment/claude_reply stay populated with the latest values so
  // older response-bundle readers and the existing pin-title tooltips still
  // work.
  function migrateComment(c) {
    if (!c) return c;
    if (Array.isArray(c.history) && c.history.length) return c;
    const hist = [];
    if (c.comment) {
      hist.push({
        role: 'user',
        text: c.comment,
        attachments: (c.attachments || []).slice(),
        links: (c.links || []).slice(),
        created_at: c.created_at || new Date().toISOString(),
      });
    }
    if (c.claude_reply) {
      hist.push({
        role: 'claude',
        text: c.claude_reply,
        created_at: c.updated_at || new Date().toISOString(),
      });
    }
    return Object.assign({}, c, { history: hist });
  }
  // Attachment data URLs (base64) get heavy fast — a single 1 MB screenshot
  // can blow past localStorage's 5–10 MB cap with just a handful of pins.
  // Strip the heavy `data` field on persist; keep the metadata (name/size/
  // type) so the user can see what was attached. The in-memory state retains
  // the full data URLs, so bundle submission still carries the screenshots.
  // The trade-off is that a page reload loses attachment blobs (comment text
  // + names persist; you'd re-attach the images). That's the right call —
  // localStorage was never the place for blob persistence.
  function slimAttachments(arr) {
    if (!Array.isArray(arr)) return arr;
    return arr.map(function (a) {
      if (!a || typeof a !== 'object') return a;
      return { name: a.name, type: a.type, size: a.size };
    });
  }
  function slimComment(c) {
    const slim = Object.assign({}, c);
    if (c.attachments) slim.attachments = slimAttachments(c.attachments);
    if (c.history) {
      slim.history = c.history.map(function (h) {
        if (!h || h.role !== 'user' || !h.attachments) return h;
        return Object.assign({}, h, { attachments: slimAttachments(h.attachments) });
      });
    }
    return slim;
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        comments: state.comments.map(slimComment),
        nextId: state.nextId,
      }));
    } catch (e) {
      // Even slim form blew the quota — drop a warning toast but keep going.
      // In-memory state is intact, so the user can still submit the bundle.
      const name = (e && (e.name || e.code)) || '';
      const isQuota = /Quota/i.test(name) || name === 22;
      if (isQuota) {
        try { showToast('Local cache is full — submit the bundle soon to preserve your work.', 'warn'); } catch (_) {}
      } else {
        console.warn('[review-mode] save() failed:', e);
      }
    }
  }
  load();

  // ── Auto-tag elements with human-readable data-comment-id ───
  function tag(el, label) {
    if (!el || el.dataset.commentId) return;
    el.dataset.commentId = label;
  }

  function autoTag() {
    // Sections
    document.querySelectorAll('section.section, section.hero').forEach((s, i) => {
      const code = (s.querySelector('.section-code')?.textContent || '').replace(/\s+/g, ' ').trim();
      const heading = (s.querySelector('h1, h2, h3')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48);
      let label;
      if (s.classList.contains('hero')) label = 'Section · Hero';
      else if (code) label = 'Section · ' + code;
      else if (heading) label = 'Section · ' + heading;
      else label = 'Section #' + (i + 1);
      tag(s, label);
    });

    // Section heading wrappers
    document.querySelectorAll('.section-heading').forEach(h => {
      const text = (h.querySelector('h1,h2,h3')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(h, 'Section heading · ' + (text || 'untitled'));
    });

    // Section codes
    document.querySelectorAll('.section-code').forEach(c => {
      const t = c.textContent.replace(/\s+/g, ' ').trim();
      tag(c, 'Section code · ' + t);
    });

    // Buttons
    document.querySelectorAll('.btn, .code-copy').forEach((b, i) => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) || 'Button';
      const variant = (b.className.match(/btn-[\w-]+/)?.[0]) || (b.classList.contains('code-copy') ? 'code-copy' : 'btn');
      tag(b, 'Button · ' + variant + ' · ' + t);
    });

    // Nav items
    document.querySelectorAll('.nav-item').forEach(n => {
      const t = (n.querySelector('.nav-trigger')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
      tag(n, 'Nav item · ' + (t || 'untitled'));
    });
    document.querySelectorAll('.nav-dropdown').forEach(d => {
      const w = d.classList.contains('nav-dropdown-wide') ? 'wide'
              : d.classList.contains('nav-dropdown-medium') ? 'medium'
              : 'narrow';
      tag(d, 'Mega-menu panel · ' + w);
    });

    // Cards
    document.querySelectorAll('.card-soft, .card-charcoal, .card-charcoal-active, .row-card, .lifecycle-card, .tier-card, .icon-tile, .logo-tile, .swatch, .review-comment-card').forEach(c => {
      if (c.classList.contains('review-comment-card')) return; // review UI itself, skip
      let variant = 'card';
      if (c.classList.contains('card-charcoal-active')) variant = 'card-charcoal-active';
      else if (c.classList.contains('card-charcoal')) variant = 'card-charcoal';
      else if (c.classList.contains('card-soft')) variant = 'card-soft';
      else if (c.classList.contains('row-card')) variant = 'row-card';
      else if (c.classList.contains('lifecycle-card')) variant = 'lifecycle-card';
      else if (c.classList.contains('tier-card')) variant = 'tier-card';
      else if (c.classList.contains('icon-tile')) variant = 'icon-tile';
      else if (c.classList.contains('logo-tile')) variant = 'logo-tile';
      else if (c.classList.contains('swatch')) variant = 'swatch';
      const t = (c.querySelector('.heading-md, .lc-title, .tier-name, .name, .filename, .swatch-name, .row-link, .num-tile')?.textContent || c.textContent || '')
        .replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(c, 'Card · ' + variant + ' · ' + t);
    });

    // Pills (tab buttons)
    document.querySelectorAll('.pill').forEach(p => {
      const t = (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24);
      tag(p, 'Pill · ' + t + (p.classList.contains('is-selected') ? ' (selected)' : ''));
    });

    // Mono badges
    document.querySelectorAll('.mono-badge').forEach(b => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(b, 'Mono badge · ' + t);
    });

    // Code block
    document.querySelectorAll('.code-block').forEach(c => tag(c, 'Code block'));
    document.querySelectorAll('.code-tabs').forEach(c => tag(c, 'Code block · tab bar'));
    document.querySelectorAll('.code-body').forEach(c => tag(c, 'Code block · body'));
    document.querySelectorAll('.code-status').forEach(c => tag(c, 'Code block · status bar'));
    document.querySelectorAll('.chip').forEach((c, i) => {
      const t = (c.querySelector('.chip-label')?.textContent || '').trim().slice(0, 20);
      tag(c, 'Annotation chip · ' + (t || '#' + (i + 1)));
    });

    // Pricing finder
    tag(document.querySelector('.tier-finder'), 'Pricing tier finder');
    tag(document.querySelector('.tier-track'), 'Tier finder · slider track');
    tag(document.querySelector('.tier-thumb'), 'Tier finder · slider thumb');
    document.querySelectorAll('.tier-marker').forEach(m => {
      const t = (m.textContent || '').replace(/\s+/g, ' ').trim();
      tag(m, 'Tier marker · ' + t);
    });

    // Compare rows
    document.querySelectorAll('.compare-row').forEach((r, i) => tag(r, 'Compare row #' + (i + 1)));
    document.querySelectorAll('.compare-table').forEach(t => tag(t, 'Compare table'));

    // Ticker
    document.querySelectorAll('.ticker').forEach(t => tag(t, 'Ticker'));

    // Loaders
    document.querySelectorAll('.skeleton').forEach((s, i) => tag(s, 'Loader · skeleton #' + (i + 1)));
    document.querySelectorAll('.progress').forEach((p, i) => tag(p, 'Loader · progress #' + (i + 1)));
    document.querySelectorAll('.spinner-standalone').forEach(s => tag(s, 'Loader · spinner'));
    document.querySelectorAll('.status-dot').forEach((d, i) => tag(d, 'Loader · status dot #' + (i + 1)));

    // Type rows
    document.querySelectorAll('.type-row').forEach(r => {
      const name = (r.querySelector('.type-name')?.textContent || '').trim();
      tag(r, 'Type sample · ' + name);
    });

    // Header / footer
    tag(document.querySelector('.site-header'), 'Site header');
    tag(document.querySelector('.site-footer'), 'Site footer');
    document.querySelectorAll('.brand-link').forEach((b, i) => tag(b, 'Brand wordmark · #' + (i + 1)));
    document.querySelectorAll('.hero-pill').forEach(p => tag(p, 'Hero · live status pill'));
    document.querySelectorAll('.stats-row').forEach(s => tag(s, 'Stats row'));
    document.querySelectorAll('.stat-num').forEach(s => {
      const t = (s.textContent || '').trim();
      tag(s, 'Stat number · ' + t);
    });

    // ====================================================================
    // Design system v1.5 extensions (engineering-blog rebrand)
    // ====================================================================

    // Sections (.section-light / .section-dark — also catches the hero
    // which carries .section-dark; legacy section.section already handled).
    document.querySelectorAll('section.section-light, section.section-dark').forEach((s, i) => {
      if (s.dataset.commentId) return;
      const code = (s.querySelector('.section-code')?.textContent || '').replace(/\s+/g, ' ').trim();
      const heading = (s.querySelector('h1, h2, h3')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48);
      const id = s.id || '';
      let label;
      if (s.classList.contains('hero')) label = 'Section · Hero';
      else if (code) label = 'Section · ' + code;
      else if (heading) label = 'Section · ' + heading.slice(0, 36);
      else if (id) label = 'Section · ' + id;
      else label = 'Section #' + (i + 1);
      tag(s, label);
    });

    // Design system buttons — .btn-primary / .btn-secondary-dark / .btn-ghost
    document.querySelectorAll('.btn-primary, .btn-secondary-dark, .btn-ghost').forEach(b => {
      if (b.dataset.commentId) return;
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) || 'Button';
      const variant = (b.className.match(/btn-[\w-]+/)?.[0]) || 'btn';
      tag(b, 'Button · ' + variant + ' · ' + t);
    });

    // Anchor pills (in-page nav chrome)
    document.querySelectorAll('.anchor-pill').forEach(p => {
      const t = (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(p, 'Anchor pill · ' + t);
    });

    // Featured posts (composite: copy + diagram instrument)
    document.querySelectorAll('.featured-post').forEach(c => {
      const t = (c.querySelector('.featured-post-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(c, 'Featured post · ' + (t || 'untitled'));
    });

    // Entry rows (list rows for field notes / how-i-built / research)
    document.querySelectorAll('.entry-row').forEach(e => {
      const t = (e.querySelector('.entry-row-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(e, 'Entry row · ' + (t || 'untitled'));
    });

    // Dispatch cards (newsletter issue)
    document.querySelectorAll('.dispatch-card').forEach(d => {
      const t = (d.querySelector('.dispatch-card-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(d, 'Dispatch card · ' + (t || 'untitled'));
    });

    // Project tiles
    document.querySelectorAll('.project-tile').forEach(p => {
      const t = (p.querySelector('.project-tile-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(p, 'Project tile · ' + (t || 'untitled'));
    });

    // Tag chips
    document.querySelectorAll('.tag-chip-light, .tag-chip-dark').forEach(c => {
      const t = (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 18);
      const variant = c.classList.contains('tag-chip-dark') ? 'tag-chip-dark' : 'tag-chip-light';
      tag(c, 'Tag chip · ' + variant + ' · ' + t);
    });

    // Diagram cards & their rows (per-article instruments)
    document.querySelectorAll('.diagram-card').forEach((d, i) => {
      const head = (d.querySelector('.diagram-tick')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(d, 'Diagram card · ' + (head || '#' + (i + 1)));
    });
    document.querySelectorAll('.diagram-row').forEach(r => {
      const t = (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      tag(r, 'Diagram row · ' + t);
    });

    // Section heading block (two-tone display heading + body split)
    document.querySelectorAll('.section-heading-block').forEach(h => {
      const text = (h.querySelector('h1,h2,h3')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(h, 'Section heading · ' + (text || 'untitled'));
    });

    // Byline (author · kind · date · read-time)
    document.querySelectorAll('.byline').forEach(b => {
      const name = (b.querySelector('.byline-name')?.textContent || '').replace(/\s+/g, ' ').trim();
      tag(b, 'Byline · ' + (name || 'unknown'));
    });

    // Hero h1 (singular white)
    document.querySelectorAll('.hero h1').forEach(h => {
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(h, 'Hero heading · ' + t);
    });
    document.querySelectorAll('.hero-deck').forEach(d => tag(d, 'Hero deck'));
    document.querySelectorAll('.hero-rail').forEach(r => tag(r, 'Hero rail label'));

    // Display headings
    document.querySelectorAll('.display-md').forEach(h => {
      if (h.dataset.commentId) return;
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(h, 'Display MD · ' + t);
    });

    // Header / footer fine-grained
    document.querySelectorAll('.site-header-brand').forEach(b => tag(b, 'Header · brand wordmark'));
    document.querySelectorAll('.site-footer-brand').forEach(b => tag(b, 'Footer · brand block'));
    document.querySelectorAll('.site-header-nav a').forEach(a => {
      const t = (a.textContent || '').trim();
      tag(a, 'Header nav · ' + t);
    });
    document.querySelectorAll('.site-footer-group').forEach(g => {
      const h = (g.querySelector('h4')?.textContent || '').trim();
      tag(g, 'Footer group · ' + (h || 'untitled'));
    });

    // Subscribe form parts
    document.querySelectorAll('.subscribe-form').forEach(s => tag(s, 'Subscribe form'));
    document.querySelectorAll('.input-pill').forEach(i => tag(i, 'Pill input · subscribe'));

    // ====================================================================
    // VideoDB Labs v1.7 — inner-page chrome + aggressive article granularity
    // ====================================================================

    // Hub heroes (inner-page hero used on /engineering, /research, /projects)
    document.querySelectorAll('.hub-hero').forEach(h => {
      const heading = (h.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(h, 'Hub hero · ' + (heading || 'untitled'));
    });
    document.querySelectorAll('.hub-hero-eyebrow').forEach(e => tag(e, 'Hub hero · eyebrow'));
    document.querySelectorAll('.hub-hero-deck').forEach(d => tag(d, 'Hub hero · deck'));
    document.querySelectorAll('.hub-hero-back').forEach(b => tag(b, 'Hub hero · back link'));
    document.querySelectorAll('.hub-hero h1').forEach(h => {
      const t = (h.textContent || '').trim().slice(0, 40);
      tag(h, 'Hub hero · heading · ' + t);
    });

    // Article heroes (used on /engineering/field-notes/[slug] etc.)
    document.querySelectorAll('.article-hero').forEach(h => {
      const heading = (h.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(h, 'Article hero · ' + (heading || 'untitled'));
    });
    document.querySelectorAll('.article-hero h1').forEach(h => {
      const t = (h.textContent || '').trim().slice(0, 40);
      tag(h, 'Article · heading · ' + t);
    });
    document.querySelectorAll('.article-hero-deck').forEach(d => tag(d, 'Article hero · deck'));
    document.querySelectorAll('.article-hero-kicker').forEach(k => tag(k, 'Article hero · kicker'));
    document.querySelectorAll('.article-hero-back').forEach(b => tag(b, 'Article hero · back link'));

    // Article TOC
    document.querySelectorAll('.article-toc').forEach(t => tag(t, 'Article · TOC'));
    document.querySelectorAll('.article-toc a').forEach(a => {
      const t = (a.textContent || '').trim();
      tag(a, 'TOC link · ' + t);
    });

    // Note card (flexbox dark list row)
    document.querySelectorAll('.note-card').forEach(c => {
      const t = (c.querySelector('.note-card-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(c, 'Note card · ' + (t || 'untitled'));
    });
    document.querySelectorAll('.note-card-arrow').forEach(a => tag(a, 'Note card · arrow'));
    document.querySelectorAll('.note-card-title').forEach(t => {
      const text = (t.textContent || '').trim().slice(0, 36);
      tag(t, 'Note card · title · ' + text);
    });
    document.querySelectorAll('.note-card-deck').forEach(d => tag(d, 'Note card · deck'));
    document.querySelectorAll('.note-card-meta').forEach(m => tag(m, 'Note card · meta'));
    document.querySelectorAll('.note-card-meta-name').forEach(n => {
      const text = (n.textContent || '').trim();
      tag(n, 'Note card · author · ' + text);
    });

    // Build card
    document.querySelectorAll('.build-card-arrow').forEach(a => tag(a, 'Build card · arrow'));
    document.querySelectorAll('.build-card-title').forEach(t => {
      const text = (t.textContent || '').trim().slice(0, 36);
      tag(t, 'Build card · title · ' + text);
    });
    document.querySelectorAll('.build-card-deck').forEach(d => tag(d, 'Build card · deck'));
    document.querySelectorAll('.build-card-kicker').forEach(k => tag(k, 'Build card · kicker'));

    // Research card
    document.querySelectorAll('.research-card').forEach(c => {
      const t = (c.querySelector('.research-card-title')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36);
      tag(c, 'Research card · ' + (t || 'untitled'));
    });
    document.querySelectorAll('.research-card-title').forEach(t => {
      const text = (t.textContent || '').trim().slice(0, 36);
      tag(t, 'Research card · title · ' + text);
    });
    document.querySelectorAll('.research-card-summary').forEach(s => tag(s, 'Research card · summary'));
    document.querySelectorAll('.research-card-authors').forEach(a => tag(a, 'Research card · authors'));
    document.querySelectorAll('.research-card-kicker').forEach(k => tag(k, 'Research card · kicker'));
    document.querySelectorAll('.research-card-cta').forEach(c => tag(c, 'Research card · CTA'));

    // Project detail
    document.querySelectorAll('.project-detail-hero').forEach(h => tag(h, 'Project detail · hero'));
    document.querySelectorAll('.project-detail-hero h1').forEach(h => {
      const t = (h.textContent || '').trim();
      tag(h, 'Project · heading · ' + t);
    });
    document.querySelectorAll('.project-detail-tagline').forEach(t => tag(t, 'Project · tagline'));
    document.querySelectorAll('.project-detail-description').forEach(d => tag(d, 'Project · description'));
    document.querySelectorAll('.project-detail-meta').forEach(m => tag(m, 'Project · meta'));
    document.querySelectorAll('.project-detail-actions').forEach(a => tag(a, 'Project · actions row'));
    document.querySelectorAll('.project-detail-actions a, .project-detail-actions span').forEach(a => {
      const t = (a.textContent || '').trim();
      tag(a, 'Project action · ' + t);
    });
    document.querySelectorAll('.project-detail-hero-image').forEach(i => tag(i, 'Project · hero image'));
    document.querySelectorAll('.project-detail-card').forEach(c => tag(c, 'Project · details card'));
    document.querySelectorAll('.project-detail-install').forEach(i => tag(i, 'Project · install snippet'));
    document.querySelectorAll('.project-detail-video').forEach(v => tag(v, 'Project · demo video'));

    // Project tile internals (more granular)
    document.querySelectorAll('.project-tile-title').forEach(t => {
      const text = (t.textContent || '').trim().slice(0, 36);
      tag(t, 'Project tile · title · ' + text);
    });
    document.querySelectorAll('.project-tile-deck').forEach(d => tag(d, 'Project tile · deck'));
    document.querySelectorAll('.project-tile-eyebrow').forEach(e => tag(e, 'Project tile · eyebrow'));
    document.querySelectorAll('.project-tile-media').forEach(m => tag(m, 'Project tile · media'));
    document.querySelectorAll('.project-tile-actions').forEach(a => tag(a, 'Project tile · action row'));
    document.querySelectorAll('.project-tile-action').forEach(a => {
      const t = (a.textContent || '').trim();
      tag(a, 'Project tile action · ' + t);
    });

    // Subscribe block parts
    document.querySelectorAll('.subscribe-block--stretch').forEach(s => tag(s, 'Subscribe block'));
    document.querySelectorAll('.subscribe-copy').forEach(c => tag(c, 'Subscribe · copy'));
    document.querySelectorAll('.subscribe-heading').forEach(h => tag(h, 'Subscribe · heading'));
    document.querySelectorAll('.subscribe-eyebrow').forEach(e => tag(e, 'Subscribe · eyebrow'));
    document.querySelectorAll('.subscribe-deck').forEach(d => tag(d, 'Subscribe · deck'));
    document.querySelectorAll('.subscribe-form button[type="submit"]').forEach(b => tag(b, 'Subscribe · button'));

    // Featured post sub-parts
    document.querySelectorAll('.featured-post-title').forEach(t => {
      const text = (t.textContent || '').trim().slice(0, 36);
      tag(t, 'Featured post · title · ' + text);
    });
    document.querySelectorAll('.featured-post-deck').forEach(d => tag(d, 'Featured post · deck'));
    document.querySelectorAll('.featured-post-kicker').forEach(k => tag(k, 'Featured post · kicker'));
    document.querySelectorAll('.featured-post-cta').forEach(c => tag(c, 'Featured post · CTA'));

    // Diagram card sub-parts
    document.querySelectorAll('.diagram-tick').forEach(t => {
      const text = (t.textContent || '').trim();
      tag(t, 'Diagram · tick · ' + text);
    });
    document.querySelectorAll('.diagram-readout').forEach(r => tag(r, 'Diagram · readout'));

    // Section heading internals
    document.querySelectorAll('.section-code').forEach(c => {
      if (c.dataset.commentId) return;
      const text = (c.textContent || '').replace(/\s+/g, ' ').trim();
      tag(c, 'Section code · ' + text);
    });
    document.querySelectorAll('.section-deck').forEach(d => tag(d, 'Section · deck'));

    // Display headings everywhere
    document.querySelectorAll('.display-md, .display-lg, .display-xl, .heading-md').forEach(h => {
      if (h.dataset.commentId) return;
      const t = (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      const cls = ['display-xl', 'display-lg', 'display-md', 'heading-md'].find(c => h.classList.contains(c)) || 'heading';
      tag(h, cls + ' · ' + (t || 'untitled'));
    });

    // ── Aggressive article-body granularity ─────────────────────
    // Every block-level child of the rendered article body gets its own tag
    // so Cmd+click can reach the smallest useful unit (a paragraph, a list
    // item, a code block, a table) without falling back to the article body
    // as a whole.
    document.querySelectorAll('.article-body').forEach(b => {
      if (!b.dataset.commentId) tag(b, 'Article body');
    });
    document.querySelectorAll('.article-body > h2').forEach(h => {
      const t = (h.textContent || '').trim().slice(0, 36);
      tag(h, 'Article H2 · ' + t);
    });
    document.querySelectorAll('.article-body > h3').forEach(h => {
      const t = (h.textContent || '').trim().slice(0, 36);
      tag(h, 'Article H3 · ' + t);
    });
    document.querySelectorAll('.article-body > p').forEach((p, i) => {
      const t = (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
      tag(p, 'Article paragraph · ' + (t || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body > pre').forEach((pre, i) => {
      const firstLine = (pre.textContent || '').split('\n')[0].slice(0, 36);
      tag(pre, 'Code block · ' + (firstLine || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body > blockquote').forEach((bq, i) => {
      const t = (bq.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(bq, 'Article quote · ' + (t || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body > ul, .article-body > ol').forEach((l, i) => {
      tag(l, 'Article list · #' + (i + 1));
    });
    document.querySelectorAll('.article-body li').forEach((li, i) => {
      const t = (li.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      tag(li, 'List item · ' + (t || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body > .comparison-table, .article-body > div > table, .article-body table').forEach((t, i) => {
      tag(t, 'Article table · #' + (i + 1));
    });
    document.querySelectorAll('.article-body img').forEach((img, i) => {
      tag(img, 'Article image · ' + (img.getAttribute('alt') || '#' + (i + 1)));
    });

    // Markdown-embedded structural blocks (raw HTML inside .md files).
    // Tagging them lets the user pin directly on a diagram or case card
    // instead of falling back to the article-body wrapper.
    document.querySelectorAll('.article-body .article-diagram').forEach((d, i) => {
      tag(d, 'Article diagram · #' + (i + 1));
    });
    document.querySelectorAll('.article-body .diagram-step').forEach((s, i) => {
      const label = (s.querySelector('strong')?.textContent || '').trim();
      tag(s, 'Diagram step · ' + (label || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body .split-cases').forEach((sc, i) => {
      tag(sc, 'Split cases · #' + (i + 1));
    });
    document.querySelectorAll('.article-body .case-card').forEach((c, i) => {
      const label = (c.querySelector('.case-label')?.textContent || '').trim();
      const variant = c.classList.contains('success') ? 'success' : c.classList.contains('danger') ? 'danger' : 'case';
      tag(c, 'Case card · ' + variant + ' · ' + (label || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body .measurement-card').forEach((m, i) => {
      const num = (m.querySelector('strong')?.textContent || '').trim().slice(0, 16);
      tag(m, 'Measurement card · ' + (num || '#' + (i + 1)));
    });
    document.querySelectorAll('.article-body .decision-list').forEach((d, i) => {
      tag(d, 'Decision list · #' + (i + 1));
    });
    document.querySelectorAll('.article-body .callout').forEach((c, i) => {
      const t = (c.querySelector('.callout-label')?.textContent || '').trim();
      tag(c, 'Callout · ' + (t || '#' + (i + 1)));
    });
    // Article shell + side-rail TOC parts
    document.querySelectorAll('.article-shell-inner').forEach(s => tag(s, 'Article shell · grid'));
    document.querySelectorAll('.article-toc-label').forEach(l => tag(l, 'Article TOC · label'));

    // Anchor pills on every page (including inner pages, on-light variant)
    document.querySelectorAll('.anchor-pill-row').forEach((r, i) => tag(r, 'Anchor pill row · #' + (i + 1)));

    // Uniqueness pass — append #N to any duplicates
    const seen = new Map();
    document.querySelectorAll('[data-comment-id]').forEach(el => {
      const id = el.dataset.commentId;
      if (!seen.has(id)) { seen.set(id, [el]); return; }
      seen.get(id).push(el);
    });
    seen.forEach((els, id) => {
      if (els.length === 1) return;
      els.forEach((el, i) => { el.dataset.commentId = id + ' #' + (i + 1); });
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  function findTaggedAncestor(el) {
    while (el && el !== document.body) {
      // Skip review UI elements
      if (el.closest && el.closest('.review-toolbar, .review-panel, .review-sidebar, .review-fab, #review-pins, .review-hover-label')) {
        return null;
      }
      if (el.dataset && el.dataset.commentId) return el;
      el = el.parentElement;
    }
    return null;
  }

  function cssPath(el) {
    if (!el || el === document.body) return 'body';
    const parts = [];
    let cur = el;
    let depth = 0;
    while (cur && cur.nodeType === 1 && cur !== document.body && depth < 8) {
      let part = cur.nodeName.toLowerCase();
      const cls = (cur.className || '').toString().split(/\s+/).filter(c => c && !c.startsWith('review-') && c.length < 30)[0];
      if (cls) part += '.' + cls;
      if (cur.parentElement) {
        const sibs = Array.from(cur.parentElement.children).filter(s => s.nodeName === cur.nodeName);
        if (sibs.length > 1) part += ':nth-of-type(' + (sibs.indexOf(cur) + 1) + ')';
      }
      parts.unshift(part);
      cur = cur.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  function outerSnippet(el) {
    const html = (el.outerHTML || '');
    // Strip review attributes before snippet
    const clean = html.replace(/\s+data-comment-id="[^"]*"/g, '');
    return clean.length > 280 ? clean.slice(0, 280) + '...' : clean;
  }

  function selectorEscape(id) {
    if (window.CSS && CSS.escape) return CSS.escape(id);
    return id.replace(/(["\\])/g, '\\$1');
  }

  function findTargetByCommentId(id) {
    try {
      return document.querySelector('[data-comment-id="' + selectorEscape(id) + '"]');
    } catch (e) { return null; }
  }

  // ── Toolbar + hover label + pins container + FAB + sidebar ──
  document.body.classList.add('review-mode');

  // Toolbar pill — doubles as the pin-mode toggle when the sidebar is
  // closed. Aria-role=button + keyboard support so it's accessible.
  const toolbar = document.createElement('button');
  toolbar.type = 'button';
  toolbar.className = 'review-toolbar';
  toolbar.setAttribute('aria-label', 'Toggle review pin mode');
  toolbar.setAttribute('aria-pressed', 'true');
  toolbar.innerHTML = '<span class="toolbar-dot"></span><span class="toolbar-label">Review Mode</span>';
  toolbar.addEventListener('click', function () {
    // Sidebar-open implies pinning, so disable the toggle while it's open
    // (avoid a confusing "off while sidebar is open" state). The pill is
    // hidden in that case anyway via CSS, but guard defensively.
    if (sidebar.classList.contains('is-open')) return;
    setPinMode(!state.pinMode);
  });
  document.body.appendChild(toolbar);

  const hoverLabel = document.createElement('div');
  hoverLabel.className = 'review-hover-label';
  document.body.appendChild(hoverLabel);

  const pinsContainer = document.createElement('div');
  pinsContainer.id = 'review-pins';
  document.body.appendChild(pinsContainer);

  const fab = document.createElement('button');
  fab.className = 'review-fab';
  fab.innerHTML = '<iconify-icon icon="solar:chat-round-line-linear" width="16" height="16"></iconify-icon><span>Comments</span><span class="count" id="review-count">0</span>';
  document.body.appendChild(fab);

  const sidebar = document.createElement('aside');
  sidebar.className = 'review-sidebar';
  sidebar.innerHTML = ''
    + '<div class="review-sidebar-header">'
    +   '<div class="review-sidebar-title">Feedback</div>'
    +   '<button class="review-btn review-btn-ghost" id="review-sb-close">Close</button>'
    + '</div>'
    + '<div class="review-filters">'
    +   '<button class="review-filter-pill is-selected" data-filter="open">Open</button>'
    +   '<button class="review-filter-pill" data-filter="needs-review">Needs review</button>'
    +   '<button class="review-filter-pill" data-filter="resolved">Resolved</button>'
    +   '<button class="review-filter-pill" data-filter="all">All</button>'
    + '</div>'
    + '<div class="review-list" id="review-list"></div>'
    + '<div class="review-sidebar-footer">'
    +   '<div class="review-save-status is-unset" id="review-save-status">'
    +     '<div class="target-info">'
    +       '<div class="target-label">Save to</div>'
    +       '<div class="target-path" id="review-save-target">Not set — pick a folder</div>'
    +     '</div>'
    +     '<button class="change-btn" id="review-change-target">Change…</button>'
    +   '</div>'
    +   '<input type="file" id="review-import-input" accept="application/json" style="display:none;" />'
    +   '<button class="review-btn review-btn-ghost" id="review-import">Load Claude responses…</button>'
    +   '<button class="review-btn review-btn-ghost" id="review-clear-resolved">Clear resolved</button>'
    +   '<button class="review-btn review-btn-primary" id="review-submit">Submit feedback</button>'
    + '</div>';
  document.body.appendChild(sidebar);

  // ── Active gate ──────────────────────────────────────────────
  // Pinning is "active" when either of two things is true:
  //   1. The sidebar is open (implicit — pinning behavior comes with it)
  //   2. The user has explicitly toggled pin mode ON via the toolbar pill
  //      (this lets them keep dropping pins on the right side of the page
  //      with the sidebar closed)
  // When sidebar is closed AND pinMode is false → page behaves normally.
  function isReviewActive() {
    return sidebar.classList.contains('is-open') || state.pinMode;
  }

  // Toggle pin mode (called by the toolbar pill). Persists to localStorage
  // and updates the toolbar's visual state. No-op while the sidebar is open
  // because pin mode is implicit then.
  function setPinMode(on) {
    state.pinMode = !!on;
    try { localStorage.setItem(PIN_MODE_KEY, state.pinMode ? '1' : '0'); } catch (e) {}
    // Clear any in-flight hover state so an outline doesn't get stuck
    // visible after pin mode goes off mid-hover.
    if (!state.pinMode && state.hoverEl) {
      state.hoverEl.classList.remove('review-hover-target');
      state.hoverEl = null;
      if (hoverLabel) hoverLabel.style.display = 'none';
    }
    // Clear any pending multi-select queue when pausing pin mode.
    if (!state.pinMode && typeof clearSelection === 'function') {
      try { clearSelection(); } catch (e) {}
    }
    updateToolbarVisual();
  }
  function updateToolbarVisual() {
    if (!toolbar) return;
    toolbar.classList.toggle('is-off', !state.pinMode);
    toolbar.setAttribute('aria-pressed', state.pinMode ? 'true' : 'false');
    const dot = toolbar.querySelector('.toolbar-dot');
    const label = toolbar.querySelector('.toolbar-label');
    if (label) label.textContent = state.pinMode ? 'Review Mode' : 'Review Mode · Off';
    // Hover-label-style title for the affordance
    toolbar.title = state.pinMode
      ? 'Click to pause pin mode (page navigates normally)'
      : 'Click to resume pin mode (drop pins anywhere)';
  }

  // ── Granular target — walks DOWN from a tagged ancestor to find the
  //    most deeply nested tagged element under the cursor. Used when the
  //    user holds Cmd/Ctrl: instead of "closest tagged ancestor", they
  //    get "deepest tagged descendant that contains the click point".
  function findGranularTarget(e) {
    // If the direct event target is itself tagged, that's the most granular.
    let el = e.target;
    if (el && el.dataset && el.dataset.commentId) return el;
    // Otherwise walk down from the body, narrowing on each step, picking
    // whichever tagged descendant geometrically contains the cursor.
    const ancestor = findTaggedAncestor(e.target);
    if (!ancestor) return null;
    const candidates = ancestor.querySelectorAll('[data-comment-id]');
    let best = ancestor;
    let bestArea = Infinity;
    candidates.forEach(function (c) {
      const r = c.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const area = r.width * r.height;
      if (area < bestArea) { bestArea = area; best = c; }
    });
    return best;
  }

  function clearSelection() {
    state.selection.forEach(function (el) { el.classList.remove('review-selection-target'); });
    state.selection = [];
    document.body.classList.remove('review-has-selection');
    renderSelectionChip();
  }

  function toggleSelection(el) {
    const idx = state.selection.indexOf(el);
    if (idx >= 0) {
      state.selection.splice(idx, 1);
      el.classList.remove('review-selection-target');
    } else {
      state.selection.push(el);
      el.classList.add('review-selection-target');
    }
    document.body.classList.toggle('review-has-selection', state.selection.length > 0);
    renderSelectionChip();
  }

  function renderSelectionChip() {
    let chip = document.getElementById('review-selection-chip');
    if (state.selection.length === 0) {
      if (chip) chip.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'review-selection-chip';
      chip.className = 'review-selection-chip';
      chip.addEventListener('click', function (e) {
        if (e.target.closest('[data-action="clear"]')) {
          e.stopPropagation();
          clearSelection();
          return;
        }
        // Commit selection → open panel on the set
        if (state.selection.length === 0) return;
        commitSelectionToPanel();
      });
      document.body.appendChild(chip);
    }
    chip.innerHTML = ''
      + '<span class="review-selection-count">' + state.selection.length + '</span>'
      + '<span>' + (state.selection.length === 1 ? 'element' : 'elements') + ' selected — click to comment</span>'
      + '<button type="button" data-action="clear" aria-label="Clear selection">✕</button>';
  }

  function commitSelectionToPanel() {
    if (state.selection.length === 0) return;
    const els = state.selection.slice();
    const primary = els[0];
    const rect = primary.getBoundingClientRect();
    openPanel({
      isNew: true,
      target: {
        comment_id: primary.dataset.commentId,
        selector_path: cssPath(primary),
        outerHTML_snippet: outerSnippet(primary),
        pin_position: { x_pct: 50, y_pct: 50 },
        additional_targets: els.slice(1).map(function (el) {
          return {
            comment_id: el.dataset.commentId,
            selector_path: cssPath(el),
            outerHTML_snippet: outerSnippet(el),
          };
        }),
      }
    });
    clearSelection();
  }

  // ── Hover preview ────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    if (!isReviewActive() || state.activeComment !== null) {
      hoverLabel.style.display = 'none';
      if (state.hoverEl) {
        state.hoverEl.classList.remove('review-hover-target');
        state.hoverEl = null;
      }
      return;
    }
    if (e.target.closest && e.target.closest('.review-toolbar, .review-panel, .review-sidebar, .review-fab, #review-pins, .review-selection-chip')) {
      hoverLabel.style.display = 'none';
      if (state.hoverEl) {
        state.hoverEl.classList.remove('review-hover-target');
        state.hoverEl = null;
      }
      return;
    }
    const cmdHeld = e.metaKey || e.ctrlKey;
    const tagged = cmdHeld ? findGranularTarget(e) : findTaggedAncestor(e.target);
    if (tagged !== state.hoverEl) {
      if (state.hoverEl) state.hoverEl.classList.remove('review-hover-target');
      state.hoverEl = tagged;
      if (tagged) tagged.classList.add('review-hover-target');
    }
    if (tagged) {
      hoverLabel.style.display = 'block';
      // Position near cursor but stay on screen
      const x = Math.min(e.clientX + 14, window.innerWidth - 380);
      const y = Math.min(e.clientY + 14, window.innerHeight - 40);
      hoverLabel.style.left = x + 'px';
      hoverLabel.style.top = y + 'px';
      const prefix = cmdHeld ? '⌘ ' : '';
      hoverLabel.textContent = prefix + tagged.dataset.commentId;
    } else {
      hoverLabel.style.display = 'none';
    }
  });

  document.addEventListener('mouseleave', function () {
    hoverLabel.style.display = 'none';
    if (state.hoverEl) {
      state.hoverEl.classList.remove('review-hover-target');
      state.hoverEl = null;
    }
  });

  // ── Click to drop pin / extend selection ──────────────────────
  document.addEventListener('click', function (e) {
    // Ignore clicks on the review UI itself
    if (e.target.closest('.review-toolbar, .review-panel, .review-sidebar, .review-fab, #review-pins, .review-hover-label, .review-pin, .review-selection-chip')) return;
    // When sidebar is closed, review mode is dormant — let the page handle it.
    if (!isReviewActive()) return;
    if (state.activeComment !== null) return;

    const cmdHeld = e.metaKey || e.ctrlKey;

    if (cmdHeld) {
      // Cmd+click — granular target → add to (or remove from) the multi-select set.
      const granular = findGranularTarget(e);
      if (!granular) return;
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(granular);
      return;
    }

    // Plain click while sidebar is open — closest tagged ancestor → pin.
    const tagged = findTaggedAncestor(e.target);
    if (!tagged) return;

    e.preventDefault();
    e.stopPropagation();

    // If there's an accumulated selection set, commit it on this click too.
    if (state.selection.length > 0) {
      // The clicked element becomes the primary if not already in the set.
      if (state.selection.indexOf(tagged) < 0) {
        state.selection.unshift(tagged);
      } else {
        // Move it to the front so the pin lands here.
        state.selection = [tagged].concat(state.selection.filter(function (el) { return el !== tagged; }));
      }
      commitSelectionToPanel();
      return;
    }

    const rect = tagged.getBoundingClientRect();
    const x_pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y_pct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    openPanel({
      isNew: true,
      target: {
        comment_id: tagged.dataset.commentId,
        selector_path: cssPath(tagged),
        outerHTML_snippet: outerSnippet(tagged),
        pin_position: { x_pct: +x_pct.toFixed(2), y_pct: +y_pct.toFixed(2) },
      }
    });
  }, true);

  // ── ESC closes the active panel; then sidebar on a second press ──
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (state.activeComment !== null) {
      closePanel();
      e.preventDefault();
      return;
    }
    if (state.selection.length > 0) {
      clearSelection();
      e.preventDefault();
      return;
    }
    if (sidebar.classList.contains('is-open')) {
      sidebar.classList.remove('is-open');
      e.preventDefault();
    }
  });

  // ── Comment panel ────────────────────────────────────────────
  function openPanel(opts) {
    closePanel();

    const isExisting = !!opts.id;
    const data = isExisting ? state.comments.find(function (c) { return c.id === opts.id; }) : opts;
    if (!data) return;
    state.activeComment = data;

    const history = isExisting ? (data.history || []) : [];
    const hasClaudeReply = history.some(function (h) { return h.role === 'claude'; });

    // Three flavors of panel:
    //   (a) New comment: empty textarea, no thread.
    //   (b) Existing without Claude reply: edit-in-place — pre-populate the
    //       textarea with the existing comment text. NO history thread shown,
    //       no separate "follow-up" framing. Saving overwrites the existing
    //       comment, matching user mental model of "click into it to change".
    //   (c) Existing with Claude reply: show the full history thread as
    //       alternating bubbles. Textarea is empty and is for a NEW follow-up.
    //       Saving appends to history; status flips back to open.
    const editInPlace = isExisting && !hasClaudeReply;

    // attachments + links: in edit-in-place mode, carry the existing values
    // so the user can edit them. Otherwise (new comment or follow-up), start
    // fresh.
    let attachments = editInPlace ? (data.attachments || []).slice() : (!isExisting ? (data.attachments || []).slice() : []);
    let links = editInPlace ? (data.links || []).slice() : (!isExisting ? (data.links || []).slice() : []);
    let inResponseTo = null;

    const panel = document.createElement('div');
    panel.className = 'review-panel';

    // Build the history timeline. Each entry is a chat-style bubble.
    // Claude replies get a "Didn't fix it" affordance (thumbs-down) so the
    // user can prompt for a follow-up without losing the prior context.
    const historyHtml = history.map(function (entry, idx) {
      if (entry.role === 'user') {
        const attachMeta = entry.attachments && entry.attachments.length
          ? '<div class="review-thread-meta">' + entry.attachments.length + ' attachment' + (entry.attachments.length === 1 ? '' : 's') + '</div>'
          : '';
        return '<div class="review-thread-entry is-user">'
          +    '<div class="review-thread-head">You</div>'
          +    '<div class="review-thread-text">' + escapeHtml(entry.text || '') + '</div>'
          +    attachMeta
          +  '</div>';
      }
      // Claude reply
      return '<div class="review-thread-entry is-claude">'
        +    '<div class="review-thread-head">'
        +      '<span><iconify-icon icon="solar:chat-square-call-linear" width="11" height="11"></iconify-icon> Claude</span>'
        +      '<button type="button" class="review-thread-thumbs-down" data-reply-idx="' + idx + '" title="Didn\'t fix it — add a follow-up">'
        +        '<iconify-icon icon="solar:dislike-linear" width="12" height="12"></iconify-icon> Didn\'t fix it'
        +      '</button>'
        +    '</div>'
        +    '<div class="review-thread-text">' + escapeHtml(entry.text || '') + '</div>'
        +  '</div>';
    }).join('');

    // Thread only renders when Claude has replied. For unreviewed edits,
    // the user just sees their text in the textarea — no duplicate display.
    const threadBlock = (history.length && hasClaudeReply)
      ? '<div class="review-thread">' + historyHtml + '</div>'
      : '';

    // Multi-target indicator
    const additionalTargets = (data.target && data.target.additional_targets) || [];
    const targetLabel = additionalTargets.length
      ? (data.target.comment_id + ' + ' + additionalTargets.length + ' more')
      : (data.target && data.target.comment_id) || 'Unknown target';
    const extraTargetsHtml = additionalTargets.length
      ? '<div class="review-extra-targets">also: ' + additionalTargets.map(function (t) { return escapeHtml(t.comment_id); }).join(', ') + '</div>'
      : '';

    // Action button labels depend on context:
    //   - New comment: "Add comment"
    //   - Existing without Claude reply: "Save"
    //   - Existing with Claude reply: "Add follow-up" (always lands status=open)
    const primaryBtnLabel = !isExisting
      ? 'Add comment'
      : (hasClaudeReply ? 'Add follow-up' : 'Save');

    const placeholderText = !isExisting
      ? 'What would you change about this? (paste screenshots with ⌘V)'
      : (hasClaudeReply
          ? 'Add a follow-up — what\'s still wrong, what to try next… (⌘V to paste)'
          : 'Edit your comment (⌘V to paste)');

    // In edit-in-place mode pre-populate the textarea with the existing text;
    // otherwise the textarea starts empty (new comment or follow-up).
    const initialText = editInPlace
      ? (data.comment || (history[0] && history[0].text) || '')
      : (!isExisting ? (data.comment || '') : '');

    const toggleLabel = isExisting
      ? (data.status === 'resolved' ? 'Reopen' : 'Mark resolved')
      : '';

    panel.innerHTML = ''
      + '<div class="review-panel-header">'
      +   '<div class="review-panel-target" title="' + escapeHtml(targetLabel) + '">' + escapeHtml(targetLabel) + '</div>'
      +   '<button class="review-panel-close" id="review-panel-close" aria-label="Close">✕</button>'
      + '</div>'
      + extraTargetsHtml
      + '<div class="review-panel-body">'
      +   threadBlock
      +   '<textarea id="review-panel-text" placeholder="' + escapeHtml(placeholderText) + '">' + escapeHtml(initialText) + '</textarea>'
      +   '<div class="review-section-label">Attachments (screenshots, PDFs — paste or pick)</div>'
      +   '<div id="review-attachments-list"></div>'
      +   '<input type="file" id="review-attach-input" multiple accept="image/*,application/pdf" />'
      +   '<div class="review-section-label">Reference links</div>'
      +   '<div id="review-links-list"></div>'
      +   '<input type="url" id="review-link-input" placeholder="Paste a URL and press Enter" />'
      + '</div>'
      + '<div class="review-panel-actions">'
      +   (isExisting ? '<button class="review-btn review-btn-danger" id="review-panel-delete">Delete</button>' : '')
      +   (isExisting ? '<button class="review-btn review-btn-ghost" id="review-panel-toggle">' + toggleLabel + '</button>' : '')
      +   '<button class="review-btn review-btn-primary" id="review-panel-save">' + primaryBtnLabel + '</button>'
      + '</div>';
    document.body.appendChild(panel);

    // "Didn't fix it" → focus textarea, link follow-up to that reply
    panel.querySelectorAll('.review-thread-thumbs-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        inResponseTo = parseInt(btn.dataset.replyIdx, 10);
        panel.querySelectorAll('.review-thread-thumbs-down').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        const ta = panel.querySelector('#review-panel-text');
        ta.focus();
        if (!ta.value.trim()) ta.placeholder = 'What\'s still wrong? — your follow-up will reply to this Claude response.';
      });
    });

    function renderAttachmentsList() {
      const list = panel.querySelector('#review-attachments-list');
      list.innerHTML = '';
      attachments.forEach(function (a, i) {
        const wrap = document.createElement('span');
        wrap.className = 'review-attach-pill';
        wrap.innerHTML = '<iconify-icon icon="solar:notes-linear" width="11" height="11"></iconify-icon><span class="pill-name">' + escapeHtml(a.name) + '</span><button type="button" aria-label="Remove">✕</button>';
        wrap.querySelector('button').addEventListener('click', function () {
          attachments.splice(i, 1);
          renderAttachmentsList();
        });
        list.appendChild(wrap);
      });
    }
    function renderLinksList() {
      const list = panel.querySelector('#review-links-list');
      list.innerHTML = '';
      links.forEach(function (l, i) {
        const wrap = document.createElement('span');
        wrap.className = 'review-attach-pill';
        wrap.innerHTML = '<iconify-icon icon="solar:arrow-right-up-linear" width="11" height="11"></iconify-icon><span class="pill-name">' + escapeHtml(l) + '</span><button type="button" aria-label="Remove">✕</button>';
        wrap.querySelector('button').addEventListener('click', function () {
          links.splice(i, 1);
          renderLinksList();
        });
        list.appendChild(wrap);
      });
    }
    renderAttachmentsList();
    renderLinksList();

    // File picker → base64
    panel.querySelector('#review-attach-input').addEventListener('change', function (e) {
      const files = Array.from(e.target.files || []);
      Promise.all(files.map(function (f) {
        return new Promise(function (resolve) {
          const reader = new FileReader();
          reader.onload = function () {
            resolve({
              name: f.name,
              type: f.type,
              size: f.size,
              data: reader.result, // base64 data URL
            });
          };
          reader.readAsDataURL(f);
        });
      })).then(function (items) {
        attachments.push.apply(attachments, items);
        renderAttachmentsList();
        panel.querySelector('#review-attach-input').value = '';
      });
    });

    // Clipboard paste — images from screenshots / Cmd+V
    panel.addEventListener('paste', function (e) {
      const items = (e.clipboardData || window.clipboardData)?.items || [];
      const imgs = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
          const f = items[i].getAsFile();
          if (f) imgs.push(f);
        }
      }
      if (imgs.length === 0) return; // not an image paste — let the textarea handle text paste normally
      e.preventDefault();
      Promise.all(imgs.map(function (f, idx) {
        return new Promise(function (resolve) {
          const reader = new FileReader();
          reader.onload = function () {
            const ext = (f.type.split('/')[1] || 'png').replace('+xml', '');
            const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            // Browsers paste screenshots with a generic "image.png" name —
            // every paste collides. Detect that pattern and substitute a
            // unique timestamped name; otherwise keep the original.
            const isGeneric = !f.name || /^image(\.\w+)?$/i.test(f.name);
            const name = isGeneric
              ? ('pasted-' + stamp + (imgs.length > 1 ? '-' + (idx + 1) : '') + '.' + ext)
              : f.name;
            resolve({
              name: name,
              type: f.type,
              size: f.size,
              data: reader.result,
            });
          };
          reader.readAsDataURL(f);
        });
      })).then(function (newItems) {
        attachments.push.apply(attachments, newItems);
        renderAttachmentsList();
      });
    });

    // Link input → Enter to add
    panel.querySelector('#review-link-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = e.target.value.trim();
        if (v) {
          links.push(v);
          e.target.value = '';
          renderLinksList();
        }
      }
    });

    // Save
    panel.querySelector('#review-panel-save').addEventListener('click', function () {
      const text = panel.querySelector('#review-panel-text').value.trim();
      if (!text) {
        panel.querySelector('#review-panel-text').focus();
        return;
      }
      // Pick up unsubmitted link
      const dangling = panel.querySelector('#review-link-input').value.trim();
      if (dangling) links.push(dangling);

      const now = new Date().toISOString();

      if (isExisting) {
        const idx = state.comments.findIndex(function (c) { return c.id === data.id; });
        const current = state.comments[idx];
        const existingHistory = current.history || [];

        if (hasClaudeReply) {
          // Follow-up to a Claude reply — append a NEW user entry to history.
          // Status flips back to 'open' so Claude knows there's a fresh
          // question; the prior reply stays visible above it.
          const newEntry = {
            role: 'user',
            text: text,
            attachments: attachments,
            links: links,
            created_at: now,
          };
          if (inResponseTo !== null) newEntry.in_response_to = inResponseTo;
          state.comments[idx] = Object.assign({}, current, {
            comment: text,            // canonical "latest user text"
            attachments: attachments, // canonical "latest user attachments"
            links: links,
            status: 'open',
            history: existingHistory.concat([newEntry]),
            updated_at: now,
          });
        } else {
          // No Claude reply yet — just an edit. Replace the last user entry.
          const last = existingHistory[existingHistory.length - 1];
          const newHistory = existingHistory.slice();
          if (last && last.role === 'user') {
            newHistory[newHistory.length - 1] = Object.assign({}, last, {
              text: text,
              attachments: attachments,
              links: links,
              updated_at: now,
            });
          } else {
            newHistory.push({ role: 'user', text: text, attachments: attachments, links: links, created_at: now });
          }
          state.comments[idx] = Object.assign({}, current, {
            comment: text,
            attachments: attachments,
            links: links,
            history: newHistory,
            updated_at: now,
          });
        }
      } else {
        const id = 'c-' + String(state.nextId).padStart(3, '0');
        state.nextId++;
        // v4: stamp page_url + page_title on each comment at pin-drop time so
        // cross-page review sessions don't lose attribution. The top-level
        // bundle page_url stays (it records where Submit was clicked), but
        // per-comment URLs are what the AI uses to route changes.
        state.comments.push({
          id: id,
          status: 'open',
          target: data.target,
          page_url: location.href.replace(/[?&]review=1\b/, '').replace(/\?$/, ''),
          page_title: document.title,
          comment: text,
          attachments: attachments,
          links: links,
          history: [{ role: 'user', text: text, attachments: attachments, links: links, created_at: now }],
          created_at: now,
          updated_at: now,
        });
      }
      save();
      renderPins();
      renderList();
      closePanel();
    });

    // Delete
    const delBtn = panel.querySelector('#review-panel-delete');
    if (delBtn) {
      delBtn.addEventListener('click', function () {
        if (!confirm('Delete this comment?')) return;
        state.comments = state.comments.filter(function (c) { return c.id !== data.id; });
        save();
        renderPins();
        renderList();
        closePanel();
      });
    }

    // Toggle status
    const tgBtn = panel.querySelector('#review-panel-toggle');
    if (tgBtn) {
      tgBtn.addEventListener('click', function () {
        const idx = state.comments.findIndex(function (c) { return c.id === data.id; });
        state.comments[idx].status = state.comments[idx].status === 'resolved' ? 'open' : 'resolved';
        state.comments[idx].updated_at = new Date().toISOString();
        save();
        renderPins();
        renderList();
        closePanel();
      });
    }

    // Close
    panel.querySelector('#review-panel-close').addEventListener('click', closePanel);

    // Focus the textarea
    setTimeout(function () { panel.querySelector('#review-panel-text').focus(); }, 50);
  }

  function closePanel() {
    document.querySelectorAll('.review-panel').forEach(function (p) { p.remove(); });
    state.activeComment = null;
    if (state.hoverEl) {
      state.hoverEl.classList.remove('review-hover-target');
      state.hoverEl = null;
    }
    hoverLabel.style.display = 'none';
  }

  // ── Pins ─────────────────────────────────────────────────────
  function renderPins() {
    pinsContainer.innerHTML = '';
    state.comments.forEach(function (c) {
      const target = findTargetByCommentId(c.target.comment_id);
      if (!target) return; // orphan — will show only in sidebar

      // Filter
      if (state.filter !== 'all' && c.status !== state.filter) return;

      const rect = target.getBoundingClientRect();
      const x = window.scrollX + rect.left + (rect.width * (c.target.pin_position?.x_pct ?? 50) / 100);
      const y = window.scrollY + rect.top + (rect.height * (c.target.pin_position?.y_pct ?? 50) / 100);

      const pin = document.createElement('div');
      let pinClass = 'review-pin';
      if (c.status === 'resolved') pinClass += ' is-resolved';
      else if (c.status === 'needs-review') pinClass += ' is-needs-review';
      pin.className = pinClass;
      pin.style.left = x + 'px';
      pin.style.top = y + 'px';
      const num = c.id.replace('c-', '').replace(/^0+/, '') || '0';
      pin.innerHTML = '<span>' + num + '</span>';
      pin.title = c.comment + (c.claude_reply ? '\n\n— Claude reply:\n' + c.claude_reply : '');
      pin.addEventListener('click', function (e) {
        e.stopPropagation();
        openPanel({ id: c.id });
      });
      pinsContainer.appendChild(pin);
    });
    updateCount();
  }

  function updateCount() {
    const open = state.comments.filter(function (c) { return c.status === 'open'; }).length;
    const counter = document.getElementById('review-count');
    if (counter) counter.textContent = open;
  }

  window.addEventListener('scroll', function () { renderPins(); }, { passive: true });
  window.addEventListener('resize', function () { renderPins(); });

  // ── Sidebar ──────────────────────────────────────────────────
  function syncSidebarBodyClass() {
    document.body.classList.toggle('review-sidebar-open', sidebar.classList.contains('is-open'));
  }
  fab.addEventListener('click', function () {
    sidebar.classList.toggle('is-open');
    syncSidebarBodyClass();
    renderList();
  });
  document.getElementById('review-sb-close').addEventListener('click', function () {
    sidebar.classList.remove('is-open');
    syncSidebarBodyClass();
  });
  sidebar.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sidebar.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('is-selected'); });
      btn.classList.add('is-selected');
      state.filter = btn.dataset.filter;
      renderPins();
      renderList();
    });
  });

  function renderList() {
    const list = document.getElementById('review-list');
    if (!list) return;
    list.innerHTML = '';
    const filtered = state.comments.filter(function (c) {
      if (state.filter === 'all') return true;
      return c.status === state.filter;
    });
    if (filtered.length === 0) {
      list.innerHTML = '<div class="review-empty">No ' + state.filter + ' comments yet.<br>Click any element on the page to start.</div>';
      return;
    }
    filtered.forEach(function (c) {
      const card = document.createElement('div');
      const orphaned = !findTargetByCommentId(c.target.comment_id);
      card.className = 'review-comment-card' + (c.status === 'resolved' ? ' is-resolved' : '') + (orphaned ? ' is-orphaned' : '');
      const num = c.id.replace('c-', '').replace(/^0+/, '') || '0';
      const metaBits = [];
      if (c.attachments?.length) metaBits.push(c.attachments.length + ' attachment' + (c.attachments.length === 1 ? '' : 's'));
      if (c.links?.length) metaBits.push(c.links.length + ' link' + (c.links.length === 1 ? '' : 's'));
      if (c.claude_reply) metaBits.push('Claude replied');
      const attachMeta = metaBits.length
        ? '<div class="attach-meta">' + metaBits.join(' · ') + '</div>'
        : '';
      card.innerHTML = ''
        + '<div class="num">#' + num + ' · ' + c.status + (orphaned ? ' · ORPHANED' : '') + '</div>'
        + '<div class="target">' + escapeHtml(c.target?.comment_id || 'unknown') + '</div>'
        + '<div class="text">' + escapeHtml(c.comment) + '</div>'
        + attachMeta;
      card.addEventListener('click', function () {
        openPanel({ id: c.id });
        // Scroll to pin if target exists
        const target = findTargetByCommentId(c.target.comment_id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      list.appendChild(card);
    });
  }

  // Clear resolved
  document.getElementById('review-clear-resolved').addEventListener('click', function () {
    const n = state.comments.filter(function (c) { return c.status === 'resolved'; }).length;
    if (n === 0) { return; }
    if (!confirm('Permanently delete ' + n + ' resolved comment' + (n === 1 ? '' : 's') + '?')) return;
    state.comments = state.comments.filter(function (c) { return c.status !== 'resolved'; });
    save();
    renderPins();
    renderList();
  });

  // Submit — write to the configured folder (persisted across reloads via
  // IndexedDB). Falls back to a regular download if folder access isn't
  // available or the user declines.
  async function submitBundle() {
    if (state.comments.length === 0) {
      showToast('No comments to submit yet — click any element to start', 'warn');
      return;
    }
    const bundle = {
      version: 3,                       // v3 adds threading via `comment.history`
      exported_at: new Date().toISOString(),
      page_url: location.href,
      page_title: document.title,
      comment_count: state.comments.length,
      open_count: state.comments.filter(function (c) { return c.status === 'open'; }).length,
      needs_review_count: state.comments.filter(function (c) { return c.status === 'needs-review'; }).length,
      resolved_count: state.comments.filter(function (c) { return c.status === 'resolved'; }).length,
      comments: state.comments,
    };
    const json = JSON.stringify(bundle, null, 2);

    // Try the File System Access API (Chrome / Edge)
    if (window.showDirectoryPicker) {
      // Ensure a folder is configured
      if (!state.fsDirHandle) {
        const picked = await pickSaveFolder();
        if (!picked) {
          // User cancelled / unsupported — fall through to download
        }
      }
      if (state.fsDirHandle) {
        const allowed = await ensurePermission(state.fsDirHandle, 'readwrite');
        if (!allowed) {
          showToast('Save permission denied — click Change to pick a new folder', 'warn');
          return;
        }
        try {
          const fileHandle = await state.fsDirHandle.getFileHandle('feedback-bundle-LATEST.json', { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(json);
          await writable.close();
          showToast('Saved → ' + state.fsDirHandle.name + ' / feedback-bundle-LATEST.json');
          return;
        } catch (err) {
          console.warn('FS Access save failed, falling back to download:', err);
          showToast('Save failed — downloading instead', 'warn');
        }
      }
    }

    // Fallback: regular download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = 'feedback-bundle-' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast('Downloaded → feedback-bundle-' + stamp + '.json');
  }
  document.getElementById('review-submit').addEventListener('click', submitBundle);

  // Change save target (force a fresh folder pick)
  document.getElementById('review-change-target').addEventListener('click', async function () {
    await pickSaveFolder();
  });

  // Restore the saved folder handle on boot (IndexedDB survives reloads)
  (async function restoreSaveFolder() {
    const handle = await idbGet(IDB_DIR_KEY);
    if (!handle) { updateSaveTargetUI(); return; }
    // Don't request permission proactively — that prompts the user on
    // every page load. Just record the handle; permission gets requested
    // when they actually click Submit.
    state.fsDirHandle = handle;
    updateSaveTargetUI();
  })();

  // Import response bundle from Claude — applies replies + flips status to needs-review
  document.getElementById('review-import').addEventListener('click', function () {
    document.getElementById('review-import-input').click();
  });
  document.getElementById('review-import-input').addEventListener('change', function (e) {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (!data.responses || !Array.isArray(data.responses)) {
          showToast('Not a valid response bundle (missing "responses")', 'warn');
          return;
        }
        let applied = 0;
        data.responses.forEach(function (r) {
          const idx = state.comments.findIndex(function (c) { return c.id === r.comment_id; });
          if (idx < 0) return;
          const current = state.comments[idx];
          const now = new Date().toISOString();
          if (r.reply) {
            // Append Claude's reply to history (threading-aware). Top-level
            // claude_reply stays populated with the latest reply for
            // backwards compat with any consumer reading the canonical field.
            const history = (current.history || []).slice();
            history.push({ role: 'claude', text: r.reply, created_at: now });
            current.history = history;
            current.claude_reply = r.reply;
          }
          if (r.new_status) current.status = r.new_status;
          current.updated_at = now;
          applied++;
        });
        save();
        renderPins();
        renderList();
        showToast('Applied ' + applied + ' response' + (applied === 1 ? '' : 's') + ' — review pins and mark resolved');
      } catch (err) {
        showToast('Could not parse response bundle: ' + err.message, 'warn');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  // ── Helpers ──────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Boot ─────────────────────────────────────────────────────
  // Run autoTag after the page's existing DOMContentLoaded scripts have finished
  // mutating the document (e.g., GSAP word reveal rewrites headings).
  function boot() {
    autoTag();
    renderPins();
    renderList();
    updateToolbarVisual();
  }
  // Give other scripts a tick to mutate the DOM (GSAP rewrites headings)
  setTimeout(boot, 100);

  // Re-run autoTag once more after GSAP has settled, in case anything moved
  setTimeout(autoTag, 1200);

  console.log('[review-mode] active — click any element to leave feedback.');
})();
