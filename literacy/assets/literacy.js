/* 이사야 문해력 점검: 장 화면의 공통 동작. 장 번호는 각 장 폴더의 window.LIT_CH 에서 받는다. */
(function () {
  'use strict';
var SHELL = "<p class=\"top\"><a href=\"../\">← 장 목록</a></p>\n  <h1 id=\"h1\">이사야 문해력 점검</h1>\n  <p class=\"sub\">신학 이전에, 문장부터 제대로 읽고 있는지 확인해 봅니다</p>\n\n  <div id=\"nr\" hidden>\n    <p><b>이 장은 아직 준비 중입니다.</b></p>\n    <p class=\"note\">장 목록으로 돌아가 준비된 장을 먼저 풀어 보십시오.</p>\n  </div>\n\n  <div id=\"content\" hidden>\n    <div class=\"intro\">\n      <p>성경은 간단히 이해되는 책이 아닙니다. <span class=\"em\">그러므로 정독은 필수입니다.</span> 한국교회는 다독을 많이 권하기에 읽은 양만 잽니다. 여러분이 과연 제대로 읽고 있는지, 우리도 모르게 잘못 읽고 있지는 않은지, 문해력만이라도 점검받아 보시기 바랍니다.</p>\n      <p>이 점검은 신학적인 해석을 묻지 않습니다. 한국어 문장을 제대로 이해하고 읽는지, 문해력만 확인합니다.</p>\n      <p id=\"introread\"></p>\n    </div>\n    <div class=\"tools\">\n      <a class=\"btn\" id=\"readlink\" href=\"#\" target=\"_blank\" rel=\"noopener\">먼저 이사야 읽기</a>\n      <button class=\"btn ghost\" id=\"reset\" type=\"button\">처음부터 다시 하기</button>\n    </div>\n    <div id=\"list\"></div>\n    <div class=\"sum\" id=\"sum\" hidden>\n      <h2>나의 확인표</h2>\n      <div class=\"row\" id=\"sumrow\"></div>\n      <p id=\"sumtxt\"></p>\n      <ul id=\"sumlist\"></ul>\n      <p class=\"close\" id=\"sumclose\"></p>\n      <p class=\"close\" id=\"sumcomm\"></p>\n      <div class=\"tools\" style=\"margin:16px 0 0\"><button class=\"btn ghost\" id=\"reset2\" type=\"button\">처음부터 다시 풀어 보기</button></div>\n    </div>\n  </div>\n\n  <nav class=\"nav\" id=\"nav\" aria-label=\"장 이동\"></nav>\n  <p class=\"foot\">구절 번호를 누르면 성경 사이트에서 해당 구절을 찾아볼 수 있습니다. 성경 본문의 표현은 번역마다 조금씩 다르므로, 풀이는 쓰시는 성경과 대조해 읽어 주십시오.</p>";
  var CH = window.LIT_CH || 1;
  document.getElementById('app').innerHTML = SHELL;
  var MAN = window.MANIFEST || { total: 66, ready: {} };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (text != null) { e.textContent = text; } return e; }
  function link(q) { return 'https://search.naver.com/search.naver?query=' + encodeURIComponent(q); }
  function vlink(v) { return link('이사야 ' + CH + '장 ' + v.replace(/~/g, '-').replace(/절/g, '').replace(/,.*/, '') + '절'); }

  document.getElementById('h1').textContent = '이사야 문해력 점검 ' + CH + '장';

  function navLinks() {
    var nav = document.getElementById('nav'); nav.innerHTML = '';
    function item(ch, label) {
      if (ch >= 1 && ch <= 66 && MAN.ready[ch]) { var a = el('a', null, label); a.href = '../ch' + pad(ch) + '/'; nav.appendChild(a); }
      else { nav.appendChild(el('span', null, label)); }
    }
    if (CH > 1) { item(CH - 1, '← ' + (CH - 1) + '장'); }
    var l = el('a', null, '장 목록'); l.href = '../'; nav.appendChild(l);
    if (CH < 66) { item(CH + 1, (CH + 1) + '장 →'); }
  }
  navLinks();

  function notReady() { document.getElementById('nr').hidden = false; }
  var tag = document.createElement('script'); tag.src = 'data.js';
  tag.onload = function () { if (window.LITERACY && window.LITERACY.ch === CH) { start(window.LITERACY); } else { notReady(); } };
  tag.onerror = notReady;
  document.head.appendChild(tag);

  /* 주관식 채점: 서버 없이 낱말로 확인한다. 핵심 낱말 묶음(k) 가운데 need 개 이상이 들어 있으면 맞다고 인정한다(후하게).
     알려진 오독(n)이 보이면 그 이유를 알려 준다. 어느 쪽도 아니면 'maybe'로 두고 본인이 정답과 비교해 판단하게 한다. */
  function norm(s) { return String(s || '').toLowerCase().replace(/[\s.,?!"'“”‘’()\-~·…:;]/g, ''); }
  function hasAny(n, list) { return list.some(function (w) { return n.indexOf(norm(w)) >= 0; }); }
  function judge(it, text) {
    var n = norm(text), neg = /아니|아닌/.test(n), i, rule;
    if (n.length < 2) { return { r: 'short' }; }
    for (i = 0; i < (it.n || []).length && !neg; i++) { rule = it.n[i]; if (rule.hard && hasAny(n, rule.p)) { return { r: 'bad', f: rule.f }; } }
    var hit = 0; (it.k || []).forEach(function (g) { if (hasAny(n, g)) { hit++; } });
    if (hit >= (it.need || (it.k || []).length)) { return { r: 'ok', hit: hit }; }
    for (i = 0; i < (it.n || []).length && !neg; i++) { rule = it.n[i]; if (!rule.hard && hasAny(n, rule.p)) { return { r: 'bad', f: rule.f }; } }
    return { r: 'maybe', hit: hit };
  }
  window.LIT_judge = judge;

  /* AI 채점: 전달 서버(gradeUrl)에 답을 보내 판정을 받는다. 실패하면 호출한 쪽이 낱말 채점으로 돌아간다. */
  function aiGrade(url, ch, q, text) {
    return new Promise(function (resolve, reject) {
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) { ctl.abort(); } reject(new Error('timeout')); }, 20000);
      fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ch: ch, q: q, a: text }), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (x) {
          clearTimeout(timer);
          if (!x.ok || !x.d || ['ok', 'bad', 'unsure'].indexOf(x.d.verdict) < 0) { reject(new Error('bad response')); return; }
          resolve({ v: x.d.verdict === 'unsure' ? 'maybe' : x.d.verdict, f: x.d.why || '' });
        })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function start(D) {
    var Q = D.q, KEY = 'isaiah-lit2-' + CH, state = { pick:{}, done:{} };
    try { var s = localStorage.getItem(KEY); if (s) { state = JSON.parse(s); } } catch (e) {}
    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
    ['pick', 'done', 'text', 'v', 'fin', 'f', 'src'].forEach(function (k) { state[k] = state[k] || {}; });
    var freeMode = !!(Q.length && Q[0].k);
    document.getElementById('content').hidden = false;
    document.getElementById('introread').innerHTML = freeMode
      ? '먼저 이사야 ' + CH + '장을 한 번 읽으십시오. 그다음 문항마다 <span class="em">내가 이해한 대로 한두 문장으로 적어 보십시오.</span> 글을 다듬을 필요는 없고, 뜻이 같으면 맞다고 인정합니다. 한 번 확인하면 바꿀 수 없습니다. 틀려도 괜찮습니다. 틀린 곳을 아는 것이 이 점검의 목적입니다. 휴대폰에서는 키보드의 마이크 단추로 말해서 적어도 됩니다.' + ((window.LIT_CONFIG || {}).gradeUrl ? ' <b>적으신 답은 채점을 위해 AI 서비스로 전송됩니다. 이름이나 연락처 같은 개인 정보는 쓰지 마십시오.</b>' : '')
      : '먼저 이사야 ' + CH + '장을 한 번 읽으십시오. 그다음 문항마다 <span class="em">답을 하나 고르고 확정</span>하십시오. 확정하면 바꿀 수 없습니다. 그래야 내가 어떻게 읽고 있었는지가 분명히 드러납니다. 틀려도 괜찮습니다. 틀린 곳을 아는 것이 이 점검의 목적입니다.';
    document.getElementById('readlink').textContent = '먼저 이사야 ' + CH + '장 읽기';
    document.getElementById('readlink').href = link('이사야 ' + CH + '장');


    function renderFree(it, i) {
      var card = el('section', 'q'); card.setAttribute('aria-label', (i + 1) + '번 문항');
      var h = el('div', 'qh'); h.appendChild(el('span', 'num', (i + 1) + '번'));
      var a = el('a', 'vs', '이사야 ' + CH + '장 ' + it.v); a.href = vlink(it.v); a.target = '_blank'; a.rel = 'noopener'; h.appendChild(a); card.appendChild(h);
      card.appendChild(el('p', 'qt', it.q));
      var ta = el('textarea', 'fa'); ta.rows = 3; ta.placeholder = '내가 이해한 대로 한두 문장으로 적어 보십시오'; ta.setAttribute('aria-label', (i + 1) + '번 내 답');
      ta.value = state.text[i] || ''; if (state.done[i]) { ta.readOnly = true; }
      card.appendChild(ta);
      card.appendChild(el('p', 'lockhint', '맞춤법과 글의 모양은 보지 않습니다. 확인하면 바꿀 수 없습니다.'));
      var row = el('div', 'tools go');
      var go = el('button', 'btn', '내 답으로 확인하기'); go.type = 'button'; go.disabled = norm(ta.value).length < 2;
      var dk = el('button', 'btn ghost', '잘 모르겠다'); dk.type = 'button';
      row.appendChild(go); row.appendChild(dk); card.appendChild(row);
      var res = el('div', 'res'); res.setAttribute('aria-live', 'polite'); card.appendChild(res);
      ta.addEventListener('input', function () { if (state.done[i]) { return; } state.text[i] = ta.value; save(); go.disabled = norm(ta.value).length < 2; });
      function render() {
        res.innerHTML = '';
        var v = state.v[i], fin = state.fin[i];
        if (v === 'x') { res.appendChild(el('div', 'ban x', '모르는 곳입니다. 모른다는 것을 아는 것이 첫걸음입니다.')); }
        else {
          var mine = el('p', 'mine'); mine.appendChild(el('b', null, '내 답: ')); mine.appendChild(document.createTextNode(state.text[i] || '')); res.appendChild(mine);
          if (v === 'ok') {
            res.appendChild(el('div', 'ban ok', '본문과 같은 뜻으로 읽으셨습니다. 맞다고 인정합니다.'));
            if (state.src[i] === 'ai' && state.f[i]) { res.appendChild(el('p', 'note', '채점 설명: ' + state.f[i])); }
          }
          else if (v === 'bad') {
            res.appendChild(el('div', 'ban bad', '본문과 다르게 읽으셨습니다.'));
            if (state.f[i]) { var w = el('p', 'why'); w.appendChild(el('b', null, '왜 다른가: ')); w.appendChild(document.createTextNode(state.f[i])); res.appendChild(w); }
          } else if (fin === 'self') { res.appendChild(el('div', 'ban ok', '내 답도 같은 뜻이었다고 판단하셨습니다. 맞다고 인정합니다.')); }
          else if (fin === 'bad') { res.appendChild(el('div', 'ban bad', '내 답이 본문과 달랐다고 판단하셨습니다.')); }
          else if (state.src[i] === 'ai') { res.appendChild(el('div', 'ban x', '채점하기 어려운 답입니다.' + (state.f[i] ? ' ' + state.f[i] : '') + ' 아래 본문의 뜻과 내 답을 견주어 보십시오.')); }
          else {
            res.appendChild(el('div', 'ban x', '틀렸다는 뜻이 아닙니다. 제가 낱말로만 확인하기 때문에, 표현이 달라서 뜻이 같은지 판단하지 못했습니다. 아래 본문의 뜻과 내 답을 견주어 보십시오.'));
            if ((window.LIT_CONFIG || {}).gradeUrl) { res.appendChild(el('p', 'note', '(AI 채점에 연결하지 못해 낱말로 확인했습니다.)')); }
          }
        }
        var tx = el('div', 'txt'); tx.appendChild(el('b', null, '본문이 말하는 것. ')); tx.appendChild(document.createTextNode(it.a)); res.appendChild(tx);
        if (it.m) { var md = el('p', 'note', '한 줄로 줄이면: ' + it.m); res.appendChild(md); }
        if (it.note) { res.appendChild(el('p', 'note', '참고: ' + it.note)); }
        if (v === 'maybe' && !fin) {
          var sj = el('div', 'selfj'); sj.appendChild(el('p', 'lab', '내 답과 견주어 보니 어떻습니까?'));
          var b1 = el('button', 'btn', '내 답도 같은 뜻이었다'); b1.type = 'button';
          var b2 = el('button', 'btn ghost', '내 답은 달랐다'); b2.type = 'button';
          b1.addEventListener('click', function () { state.fin[i] = 'self'; save(); render(); summary(); });
          b2.addEventListener('click', function () { state.fin[i] = 'bad'; save(); render(); summary(); });
          sj.appendChild(b1); sj.appendChild(b2); res.appendChild(sj);
        }
        var c = el('p', 'chk'); c.appendChild(document.createTextNode('성경을 펴고 직접 확인하십시오: ')); var ca = el('a', null, '이사야 ' + CH + '장 ' + it.v); ca.href = vlink(it.v); ca.target = '_blank'; ca.rel = 'noopener'; c.appendChild(ca); res.appendChild(c);
      }
      function finish(v, f, src) {
        state.done[i] = 1; state.text[i] = ta.value; state.v[i] = v; state.f[i] = f || ''; state.src[i] = src || 'kw';
        state.fin[i] = (v === 'ok') ? 'ok' : (v === 'bad') ? 'bad' : (v === 'x') ? 'x' : undefined;
        if (state.fin[i] === undefined) { delete state.fin[i]; }
        save(); ta.readOnly = true; card.classList.add('done'); render(); summary(); res.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      function busy(on) {
        card.classList.toggle('busy', on); ta.readOnly = on;
        [].forEach.call(row.querySelectorAll('button'), function (b) { b.disabled = on; });
        if (on) { res.innerHTML = ''; res.appendChild(el('div', 'ban x', 'AI가 채점하는 중입니다. 잠시만 기다려 주십시오.')); }
      }
      go.addEventListener('click', function () {
        if (norm(ta.value).length < 2) { return; }
        var url = (window.LIT_CONFIG || {}).gradeUrl, text = ta.value;
        if (!url) { var r = judge(it, text); finish(r.r, r.f, 'kw'); return; }
        busy(true);
        aiGrade(url, CH, i + 1, text).then(function (g) { busy(false); finish(g.v, g.f, 'ai'); })
          .catch(function () { busy(false); var r2 = judge(it, text); finish(r2.r, r2.f, 'kw'); });
      });
      dk.addEventListener('click', function () { finish('x'); });
      if (state.done[i]) { card.classList.add('done'); render(); }
      list.appendChild(card);
    }

    var list = document.getElementById('list');
    Q.forEach(function (it, i) {
      if (it.k) { renderFree(it, i); return; }
      var card = el('section', 'q'); card.setAttribute('aria-label', (i + 1) + '번 문항');
      var h = el('div', 'qh'); h.appendChild(el('span', 'num', (i + 1) + '번'));
      var a = el('a', 'vs', '이사야 ' + CH + '장 ' + it.v); a.href = vlink(it.v); a.target = '_blank'; a.rel = 'noopener'; h.appendChild(a); card.appendChild(h);
      var fs = el('fieldset'); fs.appendChild(el('legend', null, it.q));
      var opts = el('div', 'opts');
      /* 선택지는 문항 파일의 순서 그대로 보여 준다. 정답 위치는 문항 파일에서 고르게, 불규칙하게 정해 둔다. */
      var all = it.o.map(function (o, k) { return { k: String(k), t: o.t }; }).concat([{ k:'x', t:'잘 모르겠다' }]);
      all.forEach(function (o) {
        var lab = el('label', 'opt'), inp = el('input'); inp.type = 'radio'; inp.name = 'q' + i; inp.value = o.k;
        if (state.pick[i] === o.k) { inp.checked = true; }
        if (state.done[i]) { inp.disabled = true; }
        inp.addEventListener('change', function () { if (state.done[i]) { return; } state.pick[i] = o.k; save(); go.disabled = false; });
        lab.appendChild(inp); lab.appendChild(el('span', 'ot', o.t)); opts.appendChild(lab);
      });
      fs.appendChild(opts); card.appendChild(fs);
      card.appendChild(el('p', 'lockhint', '답을 고르고 확정하면 바꿀 수 없습니다.'));
      var go = el('button', 'btn go', '이 답으로 확정하고 확인하기'); go.type = 'button'; go.disabled = (state.pick[i] == null);
      card.appendChild(go);
      var res = el('div', 'res'); res.setAttribute('aria-live', 'polite'); card.appendChild(res);
      function render() {
        res.innerHTML = '';
        var p = state.pick[i];
        if (p === 'x') { res.appendChild(el('div', 'ban x', '모르는 곳입니다. 모른다는 것을 아는 것이 첫걸음입니다.')); }
        else if (it.o[+p] && it.o[+p].ok) { res.appendChild(el('div', 'ban ok', '본문대로 읽으셨습니다.')); }
        else {
          res.appendChild(el('div', 'ban bad', '본문과 다르게 읽으셨습니다.'));
          var w = el('p', 'why'); w.appendChild(el('b', null, '고르신 답: ')); w.appendChild(document.createTextNode(it.o[+p].t + ' ')); w.appendChild(document.createElement('br'));
          w.appendChild(el('b', null, '왜 다른가: ')); w.appendChild(document.createTextNode(it.o[+p].f)); res.appendChild(w);
        }
        var tx = el('div', 'txt'); tx.appendChild(el('b', null, '본문이 말하는 것. ')); tx.appendChild(document.createTextNode(it.a)); res.appendChild(tx);
        if (it.note) { res.appendChild(el('p', 'note', '참고: ' + it.note)); }
        var c = el('p', 'chk'); c.appendChild(document.createTextNode('성경을 펴고 직접 확인하십시오: ')); var ca = el('a', null, '이사야 ' + CH + '장 ' + it.v); ca.href = vlink(it.v); ca.target = '_blank'; ca.rel = 'noopener'; c.appendChild(ca); res.appendChild(c);
      }
      go.addEventListener('click', function () {
        if (state.pick[i] == null) { return; }
        state.done[i] = 1; save(); card.classList.add('done');
        [].forEach.call(card.querySelectorAll('input'), function (x) { x.disabled = true; });
        render(); summary(); res.scrollIntoView({ block:'nearest', behavior:'smooth' });
      });
      if (state.done[i]) { card.classList.add('done'); render(); }
      list.appendChild(card);
    });

    function summary() {
      var ok = 0, bad = 0, x = 0, done = 0, miss = [];
      Q.forEach(function (it, i) {
        var fin;
        if (it.k) { fin = state.fin[i]; }
        else if (state.done[i]) { var p = state.pick[i]; fin = (p === 'x') ? 'x' : (it.o[+p].ok ? 'ok' : 'bad'); }
        if (!fin) { return; } done++;
        if (fin === 'ok' || fin === 'self') { ok++; } else if (fin === 'x') { x++; miss.push(i); } else { bad++; miss.push(i); }
      });
      state.sum = { n: Q.length, done: done, ok: ok, bad: bad, x: x }; save();
      var box = document.getElementById('sum');
      if (!done) { box.hidden = true; return; }
      box.hidden = false;
      var row = document.getElementById('sumrow'); row.innerHTML = '';
      [['ok', '본문대로 읽은 곳 ' + ok], ['bad', '다르게 읽은 곳 ' + bad], ['x', '모르겠다고 한 곳 ' + x]].forEach(function (p) { row.appendChild(el('span', 'chip ' + p[0], p[1] + '곳')); });
      var t, gap = bad + x, ul = document.getElementById('sumlist'), cl = document.getElementById('sumclose');
      ul.innerHTML = ''; cl.textContent = '';
      if (done < Q.length) { t = Q.length + '문항 가운데 ' + done + '문항을 확인했습니다. 끝까지 해 보십시오.'; }
      else if (gap === 0) { t = '모든 문항을 본문대로 읽으셨습니다. 이제 이사야서의 신학적인 물음으로 들어가 보셔도 좋겠습니다.'; cl.textContent = '그래도 성경은 정독으로 읽고, 읽을 때마다 성령께 뜻을 물으며 읽으십시오.'; }
      else {
        t = '지금까지 "읽었다"고 생각했지만 본문과 달랐거나 몰랐던 곳이 ' + gap + '곳입니다. 아래 구절을 천천히 다시 읽어 보십시오.';
        cl.textContent = '성경은 얼마나 많이 읽었느냐보다 얼마나 정확히 읽었느냐가 먼저입니다. 생각 없이 읽어 내리는 습관을 버리고, 한 문장씩 뜻을 확인하며 읽으십시오. 같은 문장을 읽고도 뜻을 놓쳤다면 해설서에서 이 장을 먼저 읽어 보십시오. 그리고 읽으면서 성령께 그 뜻을 물어 보십시오.';
      }
      document.getElementById('sumtxt').textContent = t;
      var cm = document.getElementById('sumcomm'); cm.innerHTML = '';
      var cfg = window.LIT_CONFIG || {};
      var cu = (cfg.commentaryByChapter && cfg.commentaryByChapter[CH]) || cfg.commentary;
      if (done === Q.length && gap > 0 && cu) {
        var ca2 = el('a', 'btn', '해설서 ' + CH + '장 읽기'); ca2.href = cu.replace('{NN}', pad(CH)).replace('{N}', CH); ca2.target = '_blank'; ca2.rel = 'noopener'; cm.appendChild(ca2);
      }
      if (done === Q.length) {
        miss.forEach(function (i) { var li = el('li'), a = el('a', null, (i + 1) + '번 · 이사야 ' + CH + '장 ' + Q[i].v); a.href = vlink(Q[i].v); a.target = '_blank'; a.rel = 'noopener'; li.appendChild(a); ul.appendChild(li); });
      }
    }
    function doReset() {
      if (!confirm('고른 답과 확인표를 모두 지우고 처음부터 다시 할까요?')) { return; }
      state = { pick:{}, done:{}, text:{}, v:{}, fin:{}, f:{}, src:{} }; save();
      try { sessionStorage.setItem('lit-reset', '1'); } catch (e) {}
      try { history.scrollRestoration = 'manual'; } catch (e) {}
      location.reload();
    }
    document.getElementById('reset').addEventListener('click', doReset);
    document.getElementById('reset2').addEventListener('click', doReset);
    try { if (sessionStorage.getItem('lit-reset')) { sessionStorage.removeItem('lit-reset'); window.scrollTo(0, 0); history.scrollRestoration = 'auto'; } } catch (e) {}
    summary();
  }
})();
