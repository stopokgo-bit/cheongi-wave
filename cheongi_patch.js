window.generate50PReport = function() {
  if (!_ensureSajuData()) {
    alert('이름과 생년월일을 먼저 입력해주세요.');
    if(typeof showPg==='function') showPg('main');
    return;
  }
  var sd = window._sajuData;
  var bodyEl = document.getElementById('report-full-body');
  var genBtn = document.getElementById('report-generate-btn');
  if(genBtn) genBtn.style.display = 'none';

  // ✅ 로딩 UI - 움직이는 안내
  if(bodyEl) bodyEl.innerHTML =
    '<div style="text-align:center;padding:3rem 1rem;color:var(--t2);">'
    + '<div style="font-size:48px;margin-bottom:1rem;animation:spin 1.2s linear infinite;display:inline-block;">⭐</div>'
    + '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:.5rem;" id="rpt-status">1부 분석 중... (1/2)</div>'
    + '<div style="font-size:12px;color:var(--t2);margin-bottom:1.25rem;" id="rpt-sub">명주총평 · 생애대운 · 재물 · 직업 · 애정 분석 중입니다 ☕ 잠시만 기다려주세요!</div>'
    + '<div style="width:260px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin:0 auto 1rem;">'
    +   '<div id="rpt-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--em),#FFD700);border-radius:3px;transition:width .4s;"></div>'
    + '</div>'
    + '<div style="font-size:11px;color:rgba(255,255,255,0.3);">총 50페이지 분량 · 약 60~90초 소요됩니다</div>'
    + '</div>';

  var prog = 0;
  var progTimer = setInterval(function() {
    prog = Math.min(45, prog + Math.random() * 2 + 0.5);
    var b = document.getElementById('rpt-bar');
    if(b) b.style.width = prog + '%';
  }, 600);

  var baseInfo = '[' + sd.name + '] ' + (sd.gender||'남') + ' '
    + sd.year + '년 ' + sd.month + '월 ' + sd.day + '일 '
    + (sd.timeStr||'생시미상') + ' (' + (sd.age||'') + '세)'
    + (sd.star ? ' · 명궁주성: ' + sd.star : '')
    + (sd.daewoon ? ' · 현재대운: ' + sd.daewoon : '');

  var styleRule = '각 섹션은 반드시 <h3 style="color:#FFD700;margin:1.2rem 0 .5rem;">제목</h3>'
    + '<p style="color:#ccccee;line-height:1.9;margin-bottom:.75rem;">본문</p> HTML 형식으로만 출력.'
    + ' 절대 ```html 이나 ``` 같은 마크다운 코드블록 사용 금지. 순수 HTML 태그만 출력.';

  var system = '당신은 자미두수·매화역수·기문둔갑 40년 경력 명리학 대가입니다. '
    + styleRule;

  var prompt1 = baseInfo + '\n\n'
    + '인생 지침서 1부 (섹션 1~5) - 각 섹션 최소 5문장 이상 깊고 상세하게:\n\n'
    + '1. <h3>✨ 명주(命主) 총평</h3> - 타고난 그릇, 명궁주성 특성, 인생 키워드 3가지\n'
    + '2. <h3>🌊 생애 대운 흐름</h3> - 10대부터 80대까지 10년 단위 대운 흐름과 주요 전환점\n'
    + '3. <h3>💰 재물·투자운</h3> - 돈을 버는 방식, 재물운 강한 시기, 투자 주의사항\n'
    + '4. <h3>💼 직업·커리어운</h3> - 적성에 맞는 직업군, 승진/전직 타이밍, 커리어 전략\n'
    + '5. <h3>💕 애정·인간관계</h3> - 연애 스타일, 결혼 적령기, 귀인 유형, 주의할 관계\n\n'
    + styleRule;

  var prompt2 = baseInfo + '\n\n'
    + '인생 지침서 2부 (섹션 6~10) - 각 섹션 최소 5문장 이상 깊고 상세하게:\n\n'
    + '6. <h3>🌿 건강·체질 분석</h3> - 타고난 체질, 주의할 질환, 건강 관리법\n'
    + '7. <h3>🧭 기문둔갑 전략</h3> - 길방(吉方), 흉방(凶方), 이동·이사 타이밍\n'
    + '8. <h3>🌸 매화역수 월별운</h3> - 올해 월별 길흉, 가장 좋은 달, 조심할 달\n'
    + '9. <h3>⭐ 개운법·길일 캘린더</h3> - 운을 높이는 색상·숫자·방향, 이달의 길일 5개\n'
    + '10. <h3>📅 2025~2027 타임라인</h3> - 연도별 핵심 운세, 놓치면 안 될 기회, 위기 시기\n\n'
    + styleRule;

  function fetchSection(prompt, partLabel, progStart, progEnd, statusText, subText) {
    var statusEl = document.getElementById('rpt-status');
    var subEl = document.getElementById('rpt-sub');
    if(statusEl) statusEl.textContent = statusText;
    if(subEl) subEl.textContent = subText;

    clearInterval(progTimer);
    progTimer = setInterval(function() {
      prog = Math.min(progEnd - 2, prog + Math.random() * 1.5 + 0.3);
      var b = document.getElementById('rpt-bar');
      if(b) b.style.width = prog + '%';
    }, 600);

    return fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: system,
        messages: [{ role: 'user', content: prompt }]
      })
    }).then(function(response) {
      if(!response.ok) throw new Error('서버 오류 ' + response.status);
      var reader = response.body.getReader();
      var dec = new TextDecoder();
      var html = '', buf = '';
      function read() {
        return reader.read().then(function(chunk) {
          if(chunk.done) return html;
          buf += dec.decode(chunk.value, { stream: true });
          var ls = buf.split('\n'); buf = ls.pop() || '';
          for(var i = 0; i < ls.length; i++) {
            var ln = ls[i].trim();
            if(!ln.startsWith('data: ')) continue;
            var dt = ln.slice(6).trim();
            if(dt === '[DONE]') continue;
            try {
              var ev = JSON.parse(dt);
              if(ev.type === 'content_block_delta' && ev.delta && ev.delta.text)
                html += ev.delta.text;
            } catch(e) {}
          }
          return read();
        });
      }
      return read();
    });
  }

  // ── 1부 호출 ──
  fetchSection(prompt1, '1', 0, 48,
    '1부 분석 중... (1/2) 🔮',
    '명주총평 · 생애대운 · 재물 · 직업 · 애정 분석 중입니다 ☕ 잠시만 기다려주세요!'
  ).then(function(html1) {
    prog = 50;
    var b = document.getElementById('rpt-bar'); if(b) b.style.width = '50%';

    // ── 2부 호출 ──
    return fetchSection(prompt2, '2', 50, 95,
      '2부 분석 중... (2/2) ✨',
      '건강 · 기문둔갑 · 매화역수 · 개운법 · 타임라인 작성 중입니다 🌙 거의 다 왔어요!'
    ).then(function(html2) {
      clearInterval(progTimer);
      var b2 = document.getElementById('rpt-bar'); if(b2) b2.style.width = '100%';

      // ✅ html/``` 마크다운 찌꺼기 제거
      var fullHtml = (html1 + html2)
        .replace(/```html\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      setTimeout(function() {
        if(bodyEl) bodyEl.innerHTML =
          '<div style="font-size:13px;color:var(--t2);line-height:2;padding:.5rem 0;">'
          + fullHtml
          + '</div>';
        var ab = document.getElementById('report-action-btns'); if(ab) ab.style.display = 'block';
        var rb = document.getElementById('report-regen-btn'); if(rb) rb.style.display = 'block';
        try {
          localStorage.setItem('cw_report_' + sd.name,
            JSON.stringify({ html: fullHtml, date: new Date().toISOString() }));
        } catch(e) {}
        if(typeof showShareToast === 'function') showShareToast('✅ 인생 지침서 완성! 50페이지 분석 완료 🎉');
      }, 300);
    });
  }).catch(function(e) {
    clearInterval(progTimer);
    if(bodyEl) bodyEl.innerHTML =
      '<div style="color:#e74c3c;padding:1rem;border-radius:8px;background:rgba(231,76,60,0.1);">'
      + '오류: ' + e.message
      + '<br><button onclick="generate50PReport()" style="margin-top:.5rem;padding:8px 16px;background:var(--em);border:none;border-radius:6px;color:#fff;cursor:pointer;font-family:inherit;">다시 시도</button>'
      + '</div>';
    if(genBtn) genBtn.style.display = 'block';
  });
};
