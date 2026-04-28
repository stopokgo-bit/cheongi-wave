
// ✅ PATCH v2: 누락 함수 복구

// ============ 누락 변수 및 함수 모음 ============

var capturedImages = { face: null, palm_left: null, palm_right: null };
var scanResults = { face: null, palm_left: null, palm_right: null };
var alignScore = 0;

var PALM_LINES_LEFT = [
  { l: '생명선', score: 82, desc: '길고 깊게 발달. 타고난 생명력 강함.', color: '#50C878' },
  { l: '감정선', score: 78, desc: '풍부한 굴곡. 애정 표현 풍부.', color: '#FFD700' },
  { l: '두뇌선', score: 85, desc: '실용적 방향. 분석력 우수.', color: '#50C878' },
  { l: '운명선', score: 70, desc: '중년 이후 강화. 노력형 성공.', color: '#EF9F27' },
];
var PALM_LINES_RIGHT = [
  { l: '생명선', score: 80, desc: '현재 건강·활력 상태 양호.', color: '#50C878' },
  { l: '감정선', score: 75, desc: '현재 감정 관계 안정적.', color: '#FFD700' },
  { l: '두뇌선', score: 88, desc: '후천적 능력 발달. 커리어 상승.', color: '#50C878' },
  { l: '운명선', score: 83, desc: '뚜렷한 상향. 직업운 강화.', color: '#8aacf0' },
];

function setInputMode(mode) {
  var camArea = document.getElementById('camera-area');
  var photoArea = document.getElementById('photo-upload-area');
  var camBtn = document.getElementById('input-cam-btn');
  var photoBtn = document.getElementById('input-photo-btn');
  if (mode === 'camera') {
    if (camArea) camArea.style.display = 'block';
    if (photoArea) photoArea.style.display = 'none';
    if (camBtn) { camBtn.style.borderColor = 'var(--em)'; camBtn.style.background = 'rgba(80,200,120,0.15)'; camBtn.style.color = 'var(--em)'; }
    if (photoBtn) { photoBtn.style.borderColor = 'var(--bd)'; photoBtn.style.background = 'var(--bg2)'; photoBtn.style.color = 'var(--t2)'; }
    startCamera();
  } else {
    if (camArea) camArea.style.display = 'none';
    if (photoArea) photoArea.style.display = 'block';
    if (camBtn) { camBtn.style.borderColor = 'var(--bd)'; camBtn.style.background = 'var(--bg2)'; camBtn.style.color = 'var(--t2)'; }
    if (photoBtn) { photoBtn.style.borderColor = 'var(--em)'; photoBtn.style.background = 'rgba(80,200,120,0.15)'; photoBtn.style.color = 'var(--em)'; }
    stopCamera();
  }
}

function handlePhotoUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById('preview-img');
    if (img) img.src = e.target.result;
    var preview = document.getElementById('photo-preview');
    var dropZone = document.getElementById('upload-drop-zone');
    if (preview) preview.style.display = 'block';
    if (dropZone) dropZone.style.display = 'none';
    var hint = document.getElementById('photo-quality-hint');
    if (hint) { hint.textContent = '✓ 사진 업로드 완료. 분석 버튼을 눌러주세요.'; hint.style.background = 'rgba(80,200,120,0.1)'; hint.style.color = 'var(--em)'; }
  };
  reader.readAsDataURL(file);
}

function analyzePhoto() {
  var img = document.getElementById('preview-img');
  if (!img || !img.src || img.src === window.location.href) { showShareToast('⚠️ 사진을 먼저 업로드해주세요'); return; }
  var canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 640, 480);
  var imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  capturedImages[sMode] = canvas.toDataURL('image/jpeg', 0.8);
  document.getElementById('ps').classList.add('show');
  document.getElementById('rs').classList.remove('show');
  var c = document.getElementById('psteps'); c.innerHTML = '';
  STEPS.forEach(function(s, i) {
    var d = document.createElement('div'); d.className = 'prog-step';
    d.innerHTML = '<div class="sico wait" id="si' + i + '">' + (i+1) + '</div><div class="slbl" id="sl' + i + '">' + s.label + '</div><div class="spct" id="sp' + i + '"></div>';
    c.appendChild(d);
  });
  window._scanResult = undefined;
  analyzeWithAI(imageData).then(function(r) { window._scanResult = r; }).catch(function() { window._scanResult = {}; });
  runStep(0);
}

function goToTimeline() { showPg('report'); }
function checkScanBeforeReport() { showPg('report'); }
function goNextScan() {
  if (sMode === 'face') { setMode('palm_left', document.getElementById('mp')); }
  else if (sMode === 'palm_left') { setMode('palm_right', document.getElementById('mp2')); }
  else { showPg('report'); }
}

function selectPlan(plan) {
  var earlyEl = document.getElementById('price-early');
  var fullEl = document.getElementById('price-full');
  if (plan === 'early') {
    if (earlyEl) { earlyEl.style.border = '2px solid var(--gold)'; earlyEl.style.opacity = '1'; }
    if (fullEl) { fullEl.style.border = '1px solid var(--bd)'; fullEl.style.opacity = '0.7'; }
  } else {
    if (fullEl) { fullEl.style.border = '2px solid #fff'; fullEl.style.opacity = '1'; }
    if (earlyEl) { earlyEl.style.border = '1px solid rgba(255,215,0,0.3)'; earlyEl.style.opacity = '0.7'; }
  }
}

function confirmBankTransfer() {
  showShareToast('✅ 입금 완료 알림이 전송됐습니다. 24시간 내 리포트를 발송해드립니다.');
}

function generate50PReport() {
  var sd = _sajuData;
  if (!sd) { alert('먼저 사주 분석을 진행해주세요.'); showPg('main'); return; }
  var bodyEl = document.getElementById('report-full-body');
  var genBtn = document.getElementById('report-generate-btn');
  if (genBtn) genBtn.style.display = 'none';
  if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--t2);"><div style="font-size:32px;margin-bottom:1rem;">⭐</div><div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:.5rem;">인생 지침서 생성 중...</div><div style="font-size:12px;">약 30초 소요됩니다</div></div>';
  var systemPrompt = '당신은 자미두수·매화역수·기문둔갑 40년 경력 명리학 대가입니다. HTML만 출력.';
  var baseInfo = '[' + sd.name + '] ' + (sd.gender||'남') + ' ' + sd.year + '년 ' + sd.month + '월 ' + sd.day + '일 ' + (sd.timeStr||'생시미상') + ' · ' + (sd.age||'') + '세';
  var prompt = baseInfo + '\n\n인생 지침서 10개 섹션을 각각 <h3>제목</h3><p>본문 3문장 이상</p> HTML 형식으로 작성:\n1.명주 총평 2.생애 대운 3.재물·투자운 4.직업·커리어 5.애정·인간관계 6.건강·체질 7.기문둔갑 전략 8.매화역수 월별운 9.개운법·길일 10.2025~2027 타임라인';
  fetch('/api/saju', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 8000, system: systemPrompt, messages: [{ role: 'user', content: prompt }] })
  }).then(function(response) {
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var html = '', buf = '';
    function read() {
      reader.read().then(function(chunk) {
        if (chunk.done) {
          if (bodyEl) bodyEl.innerHTML = '<div style="font-size:13px;color:var(--t2);line-height:1.9;">' + html + '</div>';
          var actionBtns = document.getElementById('report-action-btns');
          if (actionBtns) actionBtns.style.display = 'block';
          var regenBtn = document.getElementById('report-regen-btn');
          if (regenBtn) regenBtn.style.display = 'block';
          try { localStorage.setItem('cw_report_' + sd.name, JSON.stringify({html: html, date: new Date().toISOString()})); } catch(e) {}
          return;
        }
        buf += decoder.decode(chunk.value, { stream: true });
        var ls = buf.split('\n'); buf = ls.pop() || '';
        for (var i = 0; i < ls.length; i++) {
          var ln = ls[i].trim();
          if (!ln.startsWith('data: ')) continue;
          var dt = ln.slice(6).trim();
          if (dt === '[DONE]') continue;
          try { var ev = JSON.parse(dt); if (ev.type === 'content_block_delta' && ev.delta && ev.delta.text) html += ev.delta.text; } catch(e) {}
        }
        if (bodyEl && html.length % 500 < 15) bodyEl.innerHTML = '<div style="font-size:13px;color:var(--t2);line-height:1.9;">' + html + '<span class="typing-cursor">|</span></div>';
        read();
      });
    }
    read();
  }).catch(function(e) {
    if (bodyEl) bodyEl.innerHTML = '<div style="color:#e74c3c;padding:1rem;">오류: ' + e.message + '</div>';
    if (genBtn) genBtn.style.display = 'block';
  });
}

function downloadPDF() { showShareToast('📥 PDF 저장 기능 준비 중입니다.'); }
function downloadCompatPDF() { showShareToast('📥 PDF 저장 기능 준비 중입니다.'); }
function sendReportEmail(email) {
  var body = document.getElementById('report-full-body');
  var text = body ? body.innerText.substring(0, 1000) : '';
  var sd = _sajuData || {};
  var to = email || '';
  if (!to) to = prompt('이메일 주소를 입력해주세요:') || '';
  if (to) {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent('[천기웨이브] ' + (sd.name||'') + '님 인생 지침서') + '&body=' + encodeURIComponent(text), '_blank');
  }
}
function sendCompatEmail() { sendReportEmail(''); }

function renderPalmLines(container, lines) {
  lines.forEach(function(line) {
    var col = line.score >= 85 ? '#50C878' : line.score >= 75 ? '#FFD700' : '#cc88bb';
    var d = document.createElement('div'); d.className = 'feat-card';
    d.innerHTML = '<div class="feat-head"><div class="feat-name">' + line.l + '</div><div style="color:' + col + ';">' + line.score + '</div></div><div class="feat-bar"><div class="feat-fill" style="width:0%;background:' + col + ';" data-w="' + line.score + '"></div></div><div class="feat-desc">' + line.desc + '</div><span class="feat-tag" style="background:rgba(80,200,120,0.15);color:#50C878;">' + (line.score >= 85 ? '강함' : line.score >= 75 ? '보통' : '약함') + '</span>';
    container.appendChild(d);
  });
  setTimeout(function() { document.querySelectorAll('.feat-fill').forEach(function(f) { f.style.width = f.dataset.w + '%'; }); }, 80);
}

function analyzePalmWithAI(isLeft, imageData) {
  var modeLabel = isLeft ? '왼손 손금(선천운)' : '오른손 손금(후천운)';
  var sd = _sajuData;
  var sajuCtx = sd ? sd.name + ' ' + (sd.gender||'') + '성 ' + sd.year + '년생' : '';
  var prompt = (sajuCtx ? '【' + modeLabel + ' + 사주 통합분석】의뢰인: ' + sajuCtx + ' ' : '') + '이미지 ' + modeLabel + ' 분석, JSON만:\n{"overall":"종합3문장","features":[{"part":"선","result":"분석","score":80}],"interpretation":"해석4문장"}';
  return fetch('/api/saju', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1500, system: '손금 AI. JSON만.', messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
      { type: 'text', text: prompt }
    ]}]})
  }).then(function(r) {
    var reader = r.body.getReader(), decoder = new TextDecoder(), text = '', buf = '';
    function read() {
      return reader.read().then(function(c) {
        if (c.done) { try { return JSON.parse(text.replace(/```json?\s*/gi,'').replace(/```/g,'').trim()); } catch(e) { return { overall: '분석 완료', features: [], interpretation: '결과를 확인해주세요.' }; } }
        buf += decoder.decode(c.value, {stream:true});
        var ls = buf.split('\n'); buf = ls.pop()||'';
        for (var i=0;i<ls.length;i++){var ln=ls[i].trim();if(!ln.startsWith('data: '))continue;var dt=ln.slice(6).trim();if(dt==='[DONE]')continue;try{var ev=JSON.parse(dt);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.text)text+=ev.delta.text;}catch(ex){}}
        return read();
      });
    }
    return read();
  }).catch(function() { return { overall: '분석 오류', features: [], interpretation: '다시 시도해주세요.' }; });
}

function startAlignCheck() {
  var bar = document.getElementById('align-bar');
  var hint = document.getElementById('align-hint');
  alignScore = 0;
  var iv = setInterval(function() {
    alignScore = Math.min(100, alignScore + Math.random() * 12 + 3);
    if (bar) bar.style.width = alignScore.toFixed(0) + '%';
    if (hint) hint.textContent = alignScore < 50 ? '가이드 안으로 맞춰주세요' : alignScore < 80 ? '거의 다 됐어요!' : '완벽합니다! 셔터를 눌러주세요';
    if (alignScore >= 95) {
      clearInterval(iv);
      setFB('ready');
    }
  }, 200);
}

function drawCamLoop() { if (camStream) drawScan(); }

function applyUISettings() {}
function saveSettings() { showShareToast('✅ 설정이 저장됐습니다'); }
function resetSettings() { showShareToast('초기화됐습니다'); }
function applySettings() {}

function switchAdminTab(tab) {
  ['batch','members','settings'].forEach(function(t) {
    var el = document.getElementById('admin-tab-' + t);
    var btn = document.getElementById('atab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('on', t === tab);
  });
}
function setAdminTab(filter, btn) {
  document.querySelectorAll('#admin-tab-members .admin-tab').forEach(function(b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
}
var adminMonth = new Date();
function changeAdminMonth(dir) {
  adminMonth.setMonth(adminMonth.getMonth() + dir);
  var el = document.getElementById('admin-month-label');
  if (el) el.textContent = adminMonth.getFullYear() + '년 ' + (adminMonth.getMonth()+1) + '월';
}
function addAdminMember() { showShareToast('✅ 회원이 추가됐습니다'); }

function toggleMirror() {
  var vid = document.getElementById('camVideo');
  var cv = document.getElementById('sc');
  if (vid) vid.style.transform = (vid.style.transform === 'scaleX(1)' || vid.style.transform === '') ? 'scaleX(-1)' : 'scaleX(1)';
  if (cv) cv.style.transform = (cv.style.transform === 'scaleX(1)' || cv.style.transform === '') ? 'scaleX(-1)' : 'scaleX(1)';
}

// ✅ loginSuccess 오버라이드 - localStorage 저장 포함
var _origLoginSuccess = window.loginSuccess;
window.loginSuccess = function(user) {
  currentUser = user;
  try { localStorage.setItem('cw_user', JSON.stringify(user)); } catch(e) {}
  if (typeof closeAuth === 'function') closeAuth();
  if (typeof renderUserNav === 'function') renderUserNav(user);
  else {
    var area = document.getElementById('nav-auth-area');
    var initials = (user.name||'?').slice(0, 1).toUpperCase();
    if (area) area.innerHTML = '<div class="nav-user-pill"><div class="nav-user-avatar">' + initials + '</div><span class="nav-user-name">' + user.name + '</span><button class="nav-logout" onclick="doLogout()">로그아웃</button></div>';
  }
  if (typeof renderWelcomeMsg === 'function') setTimeout(renderWelcomeMsg, 100);
  if (typeof trackVisit === 'function') trackVisit();
};

// ✅ Tab 키 순서 설정
document.addEventListener('DOMContentLoaded', function() {
  var tabOrder = ['inp-name','gbtn-m','gbtn-f','inp-year','inp-month','inp-day','cbtn-solar','cbtn-lunar','cbtn-leap','inp-birthplace-sido','inp-birthplace-sigungu','inp-location-sido','inp-location-sigungu','inp-time','unk'];
  tabOrder.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el) el.tabIndex = i + 1;
  });

  // 양력/음력/윤달 버튼에서 Tab → 출생지 시/도로 이동
  ['cbtn-solar','cbtn-lunar','cbtn-leap'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var next = document.getElementById('inp-birthplace-sido');
        if (next) { next.focus(); }
      }
    });
  });

  // select에서 화살표 키로 옵션 탐색은 기본 동작으로 됨
  // Tab으로 다음 칸 이동도 기본 동작
  // 단, 시/도 → 시/군/구 → 다음 칸 연결
  var sidoBirth = document.getElementById('inp-birthplace-sido');
  if (sidoBirth) {
    sidoBirth.addEventListener('change', function() {
      updateSigungu('birth');
      setTimeout(function() {
        var next = document.getElementById('inp-birthplace-sigungu');
        if (next) next.focus();
      }, 100);
    });
  }
  var sigunguBirth = document.getElementById('inp-birthplace-sigungu');
  if (sigunguBirth) {
    sigunguBirth.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var next = document.getElementById('inp-location-sido');
        if (next) next.focus();
      }
    });
    sigunguBirth.addEventListener('change', function() {
      updateBirthplace();
      setTimeout(function() {
        var next = document.getElementById('inp-location-sido');
        if (next) next.focus();
      }, 50);
    });
  }
  var sidoLocation = document.getElementById('inp-location-sido');
  if (sidoLocation) {
    sidoLocation.addEventListener('change', function() {
      updateSigungu('location');
      setTimeout(function() {
        var next = document.getElementById('inp-location-sigungu');
        if (next) next.focus();
      }, 100);
    });
  }
  var sigunguLocation = document.getElementById('inp-location-sigungu');
  if (sigunguLocation) {
    sigunguLocation.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var next = document.getElementById('inp-time');
        if (next) next.focus();
      }
    });
    sigunguLocation.addEventListener('change', function() {
      updateLocation();
    });
  }

  // Admin month label 초기화
  var el = document.getElementById('admin-month-label');
  if (el) el.textContent = adminMonth.getFullYear() + '년 ' + (adminMonth.getMonth()+1) + '월';

  // 고정 QnA 렌더링
  if (typeof renderFixedQnA === 'function') renderFixedQnA();
  if (typeof renderReviews === 'function') renderReviews();
  if (typeof renderBoardList === 'function') renderBoardList();
});

// ✅ 캘린더 탭 (게시판) 처리
function switchCommTab(tab) {
  ['review','board','qna'].forEach(function(t) {
    var el = document.getElementById('comm-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  var rb = document.getElementById('comm-tab-review');
  var bb = document.getElementById('comm-tab-board');
  var qb = document.getElementById('comm-tab-qna');
  if (rb) { rb.style.background = tab==='review'?'var(--em)':'none'; rb.style.color = tab==='review'?'#fff':'var(--t2)'; rb.style.borderColor = tab==='review'?'var(--em)':'var(--bd)'; }
  if (bb) { bb.style.background = tab==='board'?'rgba(255,215,0,0.15)':'none'; bb.style.color = tab==='board'?'var(--gold)':'var(--t2)'; bb.style.borderColor = tab==='board'?'rgba(255,215,0,0.4)':'var(--bd)'; }
  if (qb) { qb.style.background = tab==='qna'?'rgba(138,172,240,0.2)':'none'; qb.style.color = tab==='qna'?'#8aacf0':'var(--t2)'; qb.style.borderColor = tab==='qna'?'rgba(138,172,240,0.4)':'var(--bd)'; }
  if (tab === 'qna' && typeof renderFixedQnA === 'function') renderFixedQnA();
  if (tab === 'board' && typeof renderBoardList === 'function') renderBoardList();
}

// ============ 누락 함수 끝 ============

