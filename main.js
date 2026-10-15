(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var EMAIL = 'nikozora.dev@gmail.com';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* ---------- theme ---------- */
  (function theme() {
    var btn = $('#themeBtn'), stored = null;
    try { stored = localStorage.getItem('nads-theme'); } catch (e) {}
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    root.setAttribute('data-theme', stored === 'dark' || stored === 'light' ? stored : (mq.matches ? 'dark' : 'light'));
    function label() {
      if (btn) btn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    label();
    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('nads-theme', next); } catch (e) {}
      label();
    });
  })();

  /* ---------- mobile menu ---------- */
  (function menu() {
    var btn = $('.menu-btn'), list = $('#menu');
    if (!btn || !list) return;
    function close() { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    list.addEventListener('click', function (e) { if (e.target.tagName === 'A') close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ---------- scroll progress ---------- */
  (function progress() {
    var bar = $('#progress'), ticking = false;
    if (!bar) return;
    function update() {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  /* ---------- reveal on scroll (only below-the-fold items start hidden) ---------- */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) return;
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh * 0.92) return;
      el.classList.add('rv');
      var delay = el.getAttribute('data-delay');
      if (delay) el.style.setProperty('--d', delay + 'ms');
      io.observe(el);
    });
  })();

  /* ---------- typed words ---------- */
  (function typed() {
    var el = $('#typed');
    if (!el) return;
    var words = JSON.parse(el.getAttribute('data-words'));
    if (reduce) { el.textContent = words[0]; return; }
    var w = 0, c = 0, deleting = false;
    function tick() {
      var word = words[w];
      el.textContent = word.slice(0, c);
      var wait = deleting ? 38 : 80;
      if (!deleting && c === word.length) { deleting = true; wait = 1700; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; wait = 380; }
      else { c += deleting ? -1 : 1; }
      setTimeout(tick, wait);
    }
    tick();
  })();

  /* ---------- count up ---------- */
  (function counts() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function show(el, v) { el.textContent = v + (el.getAttribute('data-suffix') || ''); }
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { show(el, el.getAttribute('data-count')); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        io.unobserve(el);
        function frame(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1400), eased = 1 - Math.pow(1 - p, 3);
          show(el, Math.round(end * eased));
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { show(el, 0); io.observe(el); });
  })();

  /* ---------- inquiry flow widget ---------- */
  (function flow() {
    var box = $('#flow');
    if (!box) return;
    var nodes = $$('.node', box), steps = $$('.step', box);
    var fill = $('.track-fill', box), packet = $('.packet', box), ctl = $('.flow-ctl', box);
    var n = nodes.length, i = 0, timer = null, playing = !reduce, visible = false, hovering = false;
    function go(k) {
      i = k;
      nodes.forEach(function (nd, idx) {
        nd.setAttribute('aria-selected', idx === k ? 'true' : 'false');
        nd.setAttribute('tabindex', idx === k ? '0' : '-1');
        nd.classList.toggle('done', idx < k);
      });
      steps.forEach(function (s, idx) {
        s.hidden = idx !== k;
        if (idx === k) { s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; }
      });
      fill.style.width = (80 * k / (n - 1)) + '%';
      packet.style.left = (10 + 80 * k / (n - 1)) + '%';
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (playing && visible && !hovering) timer = setInterval(function () { go((i + 1) % n); }, 4200);
    }
    function setPlaying(p) {
      playing = p;
      ctl.textContent = p ? 'Pause' : 'Play';
      ctl.setAttribute('aria-pressed', p ? 'false' : 'true');
      start();
    }
    nodes.forEach(function (nd, idx) {
      nd.addEventListener('click', function () { go(idx); });
      nd.addEventListener('keydown', function (e) {
        var k = null;
        if (e.key === 'ArrowRight') k = (i + 1) % n;
        else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
        if (k !== null) { e.preventDefault(); go(k); nodes[k].focus(); }
      });
    });
    box.addEventListener('pointerenter', function () { hovering = true; start(); });
    box.addEventListener('pointerleave', function () { hovering = false; start(); });
    box.addEventListener('focusin', function () { hovering = true; start(); });
    box.addEventListener('focusout', function () { hovering = false; start(); });
    ctl.addEventListener('click', function () { setPlaying(!playing); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { threshold: 0.3 }).observe(box);
    } else { visible = true; }
    setPlaying(playing);
    go(0);
  })();

  /* ---------- accordions (service rows, jobs) ---------- */
  $$('[data-accordion]').forEach(function (group) {
    var single = group.getAttribute('data-accordion') === 'single';
    var btns = $$('[aria-expanded]', group);
    function setOpen(btn, open) {
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.classList.toggle('open', open);
      var inner = panel.firstElementChild;
      if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', '');
    }
    btns.forEach(function (btn) {
      setOpen(btn, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        if (single && open) btns.forEach(function (o) { if (o !== btn) setOpen(o, false); });
        setOpen(btn, open);
      });
    });
  });

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box), panels = $$('[role="tabpanel"]', box);
    function select(k) {
      tabs.forEach(function (t, idx) {
        t.setAttribute('aria-selected', idx === k ? 'true' : 'false');
        t.setAttribute('tabindex', idx === k ? '0' : '-1');
      });
      panels.forEach(function (p, idx) { p.hidden = idx !== k; });
    }
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () { select(idx); });
      t.addEventListener('keydown', function (e) {
        var k = null, last = tabs.length - 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = idx === last ? 0 : idx + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = idx === 0 ? last : idx - 1;
        else if (e.key === 'Home') k = 0;
        else if (e.key === 'End') k = last;
        if (k !== null) { e.preventDefault(); select(k); tabs[k].focus(); }
      });
    });
    var start = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    select(start < 0 ? 0 : start);
    // open the right case study when arriving from a link like portfolio.html#bowling-green-painting
    var hash = location.hash.slice(1);
    if (hash) {
      var hit = panels.findIndex(function (p) { return p.id === hash; });
      if (hit >= 0) { select(hit); setTimeout(function () { panels[hit].scrollIntoView({ block: 'start' }); }, 60); }
    }
  });

  /* ---------- flip cards ---------- */
  $$('.flip').forEach(function (f) {
    f.addEventListener('click', function () {
      var on = f.classList.toggle('on');
      f.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  /* ---------- portfolio filter ---------- */
  (function filter() {
    var bar = $('#filters');
    if (!bar) return;
    var pills = $$('[data-filter]', bar), cards = $$('.grid-3 .card[data-cat]');
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        var f = p.getAttribute('data-filter');
        pills.forEach(function (o) { o.setAttribute('aria-pressed', o === p ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-cat') === f;
          c.style.transform = '';
          if (reduce) { c.hidden = !show; return; }
          if (show) {
            if (c.hidden) { c.hidden = false; c.classList.add('is-out'); requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('is-out'); }); }); }
          } else if (!c.hidden) {
            c.classList.add('is-out');
            setTimeout(function () { if (c.classList.contains('is-out')) c.hidden = true; }, 260);
          }
        });
        var count = $('#filterCount');
        if (count) count.textContent = cards.filter(function (c) { return f === 'all' || c.getAttribute('data-cat') === f; }).length + ' projects shown';
      });
    });
  })();

  /* ---------- project dialog ---------- */
  (function dialog() {
    var dlg = $('#projectDialog'), body = $('#dlgBody');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    $$('[data-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.card'), tpl = $('template', card);
        if (!tpl) return;
        body.innerHTML = '';
        body.appendChild(tpl.content.cloneNode(true));
        dlg.showModal();
      });
    });
    $('.dlg-close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ---------- card tilt ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------- process steps highlight ---------- */
  (function steps() {
    var items = $$('.steps li');
    if (!items.length) return;
    items[0].classList.add('on');
    if (reduce) { items.forEach(function (li) { li.classList.add('on'); }); return; }
    if (!('IntersectionObserver' in window)) { items.forEach(function (li) { li.classList.add('on'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { items.forEach(function (li) { li.classList.remove('on'); }); en.target.classList.add('on'); }
      });
    }, { rootMargin: '-42% 0px -42% 0px' });
    items.forEach(function (li) { io.observe(li); });
  })();

  /* ---------- timeline progress ---------- */
  (function timeline() {
    var tl = $('.tl');
    if (!tl) return;
    var fill = $('.tl-fill', tl), jobs = $$('.job', tl), ticking = false;
    function update() {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
      fill.style.height = Math.max(0, p * (r.height - 24)) + 'px';
      jobs.forEach(function (j) { j.classList.toggle('on', j.getBoundingClientRect().top < vh * 0.65); });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- footer: year, copy, form ---------- */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var copy = $('#copyEmail');
  if (copy) copy.addEventListener('click', function () {
    function done(t) { copy.textContent = t; setTimeout(function () { copy.textContent = 'Copy'; }, 2200); }
    try { navigator.clipboard.writeText(EMAIL).then(function () { done('Copied'); }, function () { done('Select it'); }); }
    catch (e) { done('Select it'); }
  });

  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('#formNote'), mail = form.elements.email, msg = form.elements.msg;
    var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim());
    var okMsg = msg.value.trim().length >= 10;
    mail.classList.toggle('bad', !okMail); msg.classList.toggle('bad', !okMsg);
    mail.setAttribute('aria-invalid', okMail ? 'false' : 'true'); msg.setAttribute('aria-invalid', okMsg ? 'false' : 'true');
    if (!okMail) { note.textContent = 'Please enter a valid email address so I can reply.'; mail.focus(); return; }
    if (!okMsg) { note.textContent = 'Please write a short message, at least a sentence.'; msg.focus(); return; }
    var topic = (form.querySelector('input[name="topic"]:checked') || {}).value || 'General';
    var subject = encodeURIComponent('[' + topic + '] Message from your portfolio');
    var text = encodeURIComponent(msg.value.trim() + '\n\nReply to: ' + mail.value.trim());
    note.textContent = 'Opening your email app. If nothing happens, copy my address above and send it there.';
    window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + text;
  });
})();
