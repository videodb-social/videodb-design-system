/* ==========================================================================
   Review Mode — activated only via ?review=1 URL flag
   ========================================================================== */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('review') !== '1') return;

  const STORAGE_KEY = 'videodb-review-comments-v2';
  const STORAGE_KEY_OLD = 'videodb-review-comments-v1';
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
        state.comments = parsed.comments || [];
        state.nextId = parsed.nextId || (state.comments.length + 1);
      }
    } catch (e) { /* ignore */ }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      comments: state.comments,
      nextId: state.nextId,
    }));
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

  const toolbar = document.createElement('div');
  toolbar.className = 'review-toolbar';
  toolbar.innerHTML = '<span class="toolbar-dot"></span><span>Review Mode</span>';
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

  // ── Hover preview ────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    if (state.activeComment !== null) return;
    if (e.target.closest && e.target.closest('.review-toolbar, .review-panel, .review-sidebar, .review-fab, #review-pins')) {
      hoverLabel.style.display = 'none';
      if (state.hoverEl) {
        state.hoverEl.classList.remove('review-hover-target');
        state.hoverEl = null;
      }
      return;
    }
    const tagged = findTaggedAncestor(e.target);
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
      hoverLabel.textContent = tagged.dataset.commentId;
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

  // ── Click to drop pin ────────────────────────────────────────
  document.addEventListener('click', function (e) {
    // Ignore clicks on the review UI itself
    if (e.target.closest('.review-toolbar, .review-panel, .review-sidebar, .review-fab, #review-pins, .review-hover-label, .review-pin')) return;
    if (state.activeComment !== null) return;

    const tagged = findTaggedAncestor(e.target);
    if (!tagged) return;

    e.preventDefault();
    e.stopPropagation();

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

  // ── Comment panel ────────────────────────────────────────────
  function openPanel(opts) {
    closePanel();

    const isExisting = !!opts.id;
    const data = isExisting ? state.comments.find(function (c) { return c.id === opts.id; }) : opts;
    if (!data) return;
    state.activeComment = data;

    let attachments = (data.attachments || []).slice();
    let links = (data.links || []).slice();

    const panel = document.createElement('div');
    panel.className = 'review-panel';
    const replyBlock = data.claude_reply
      ? '<div class="review-reply">'
        + '<div class="review-reply-head"><iconify-icon icon="solar:chat-square-call-linear" width="11" height="11"></iconify-icon>Claude · response</div>'
        + '<div class="review-reply-text">' + escapeHtml(data.claude_reply) + '</div>'
      + '</div>'
      : '';

    const toggleLabel = isExisting
      ? (data.status === 'resolved' ? 'Reopen' : (data.status === 'needs-review' ? 'Mark resolved' : 'Mark resolved'))
      : '';

    panel.innerHTML = ''
      + '<div class="review-panel-header">'
      +   '<div class="review-panel-target" title="' + (data.target?.comment_id || '') + '">' + (data.target?.comment_id || 'Unknown target') + '</div>'
      +   '<button class="review-panel-close" id="review-panel-close" aria-label="Close">✕</button>'
      + '</div>'
      + '<div class="review-panel-body">'
      +   replyBlock
      +   '<textarea id="review-panel-text" placeholder="What would you change about this? (paste screenshots with ⌘V)">' + escapeHtml(data.comment || '') + '</textarea>'
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
      +   '<button class="review-btn review-btn-primary" id="review-panel-save">' + (isExisting ? 'Save' : 'Add comment') + '</button>'
      + '</div>';
    document.body.appendChild(panel);

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

      if (isExisting) {
        const idx = state.comments.findIndex(function (c) { return c.id === data.id; });
        state.comments[idx] = Object.assign({}, state.comments[idx], {
          comment: text,
          attachments: attachments,
          links: links,
          updated_at: new Date().toISOString(),
        });
      } else {
        const id = 'c-' + String(state.nextId).padStart(3, '0');
        state.nextId++;
        state.comments.push({
          id: id,
          status: 'open',
          target: data.target,
          comment: text,
          attachments: attachments,
          links: links,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
  fab.addEventListener('click', function () {
    sidebar.classList.toggle('is-open');
    renderList();
  });
  document.getElementById('review-sb-close').addEventListener('click', function () {
    sidebar.classList.remove('is-open');
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
      version: 2,
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
          if (r.reply) state.comments[idx].claude_reply = r.reply;
          if (r.new_status) state.comments[idx].status = r.new_status;
          state.comments[idx].updated_at = new Date().toISOString();
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
  }
  // Give other scripts a tick to mutate the DOM (GSAP rewrites headings)
  setTimeout(boot, 100);

  // Re-run autoTag once more after GSAP has settled, in case anything moved
  setTimeout(autoTag, 1200);

  console.log('[review-mode] active — click any element to leave feedback.');
})();
