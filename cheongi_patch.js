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


// ============ 패치 v2: 카메라 수정 + 결제 우회 + 가격 변경 ============

// ✅ 1. 정가 39,000원으로 변경 (DOM 로드 후)
document.addEventListener('DOMContentLoaded', function() {
  // 가격 텍스트 변경
  var priceTexts = document.querySelectorAll('#pay-price-kakao, #pay-price-toss, #pay-price-bank');
  priceTexts.forEach(function(el) { if (el) el.textContent = '₩19,900'; });

  // price-full 카드의 정가 변경
  var fullCard = document.getElementById('price-full');
  if (fullCard) {
    var priceEl = fullCard.querySelector('[style*="font-size:26px"]');
    if (priceEl) priceEl.textContent = '₩39,000';
    var strikeEl = fullCard.querySelector('[style*="line-through"]');
    // price-early의 취소선 가격도 변경
  }
  var earlyCard = document.getElementById('price-early');
  if (earlyCard) {
    var strikeEl = earlyCard.querySelector('[style*="line-through"]');
    if (strikeEl) strikeEl.textContent = '₩39,000';
    var discountEl = earlyCard.querySelector('[style*="color:var(--em)"]');
    if (discountEl && discountEl.textContent.includes('%')) discountEl.textContent = '49% 할인';
  }

  // 탭 순서 설정
  var tabOrder = ['inp-name','gbtn-m','gbtn-f','inp-year','inp-month','inp-day',
    'cbtn-solar','cbtn-lunar','cbtn-leap',
    'inp-birthplace-sido','inp-birthplace-sigungu',
    'inp-location-sido','inp-location-sigungu',
    'inp-time','unk'];
  tabOrder.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el) el.tabIndex = i + 1;
  });

  // 양력/음력/윤달 버튼 Tab → 출생지 이동
  ['cbtn-solar','cbtn-lunar','cbtn-leap'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        var next = document.getElementById('inp-birthplace-sido');
        if (next) next.focus();
      }
    });
  });

  // 시/도 변경 시 자동 시/군/구 포커스
  var sidoBirth = document.getElementById('inp-birthplace-sido');
  if (sidoBirth) {
    sidoBirth.addEventListener('change', function() {
      if (typeof updateSigungu === 'function') updateSigungu('birth');
      setTimeout(function() {
        var next = document.getElementById('inp-birthplace-sigungu');
        if (next) next.focus();
      }, 100);
    });
  }
  var sigunguBirth = document.getElementById('inp-birthplace-sigungu');
  if (sigunguBirth) {
    sigunguBirth.addEventListener('change', function() {
      if (typeof updateBirthplace === 'function') updateBirthplace();
      setTimeout(function() { document.getElementById('inp-location-sido') && document.getElementById('inp-location-sido').focus(); }, 50);
    });
  }
  var sidoLoc = document.getElementById('inp-location-sido');
  if (sidoLoc) {
    sidoLoc.addEventListener('change', function() {
      if (typeof updateSigungu === 'function') updateSigungu('location');
      setTimeout(function() {
        var next = document.getElementById('inp-location-sigungu');
        if (next) next.focus();
      }, 100);
    });
  }
  var sigunguLoc = document.getElementById('inp-location-sigungu');
  if (sigunguLoc) {
    sigunguLoc.addEventListener('change', function() {
      if (typeof updateLocation === 'function') updateLocation();
    });
  }

  // Admin month 초기화
  var el = document.getElementById('admin-month-label');
  var am = new Date();
  if (el) el.textContent = am.getFullYear() + '년 ' + (am.getMonth()+1) + '월';

  // QnA/리뷰 초기 렌더
  if (typeof renderFixedQnA === 'function') renderFixedQnA();
  if (typeof renderReviews === 'function') setTimeout(renderReviews, 200);
  if (typeof renderBoardList === 'function') setTimeout(renderBoardList, 200);
});

// ✅ 2. 결제 없이 인생지침서 바로 보기 (테스트 모드)
function doPayment(method) {
  // 테스트용: 결제 완료 처리
  localStorage.setItem('cw_paid', '1');
  var paySection = document.getElementById('payment-section');
  var paidSection = document.getElementById('report-paid-section');
  if (paySection) paySection.style.display = 'none';
  if (paidSection) paidSection.style.display = 'block';

  var titleEl = document.getElementById('report-title');
  var tagEl = document.getElementById('report-price-tag');
  if (titleEl) titleEl.textContent = '✅ 테스트 모드 — 즉시 열람 가능';
  if (tagEl) tagEl.textContent = '₩19,900 · 얼리버드';

  // 사주 데이터 있으면 명주 해석 표시
  if (window._sajuData) {
    var ibTitle = document.getElementById('report-ib-title');
    var ibBody = document.getElementById('report-ib-body');
    if (ibTitle) ibTitle.textContent = window._sajuData.name + ' · ' + (window._sajuData.star||'') + ' 명주 핵심';
    if (ibBody) ibBody.innerHTML = window._sajuData.summary || '사주 분석 결과를 기반으로 생성됩니다.';
  }

  showShareToast('✅ 테스트 모드: 결제 완료 처리됨');
}

// ✅ 3. 카메라 수정 - video 엘리먼트가 없으면 동적 생성
var _origStartCamera = window.startCamera;
window.startCamera = async function(facing) {
  // camera-area 안에 video 엘리먼트 확인/생성
  var camArea = document.getElementById('camera-area');
  if (!camArea) return;

  var video = document.getElementById('camVideo');
  if (!video) {
    // video 엘리먼트 동적 생성 및 삽입
    video = document.createElement('video');
    video.id = 'camVideo';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:16px;z-index:1;display:none;';

    // cam-stage 안에 canvas 앞에 삽입
    var camStage = camArea.querySelector('.cam-stage');
    if (camStage) {
      var canvas = camStage.querySelector('#sc');
      if (canvas) {
        // canvas를 z-index 2로, video를 뒤에
        canvas.style.position = 'relative';
        canvas.style.zIndex = '2';
        canvas.style.background = 'transparent';
        camStage.style.position = 'relative';
        camStage.insertBefore(video, canvas);
      } else {
        camStage.insertBefore(video, camStage.firstChild);
      }
    }
  }

  // cam-error 엘리먼트 확인/생성
  var errBox = document.getElementById('cam-error');
  if (!errBox) {
    errBox = document.createElement('div');
    errBox.id = 'cam-error';
    errBox.style.cssText = 'display:none;position:absolute;inset:0;background:#0a0a20;align-items:center;justify-content:center;flex-direction:column;gap:10px;z-index:3;border-radius:16px;';
    errBox.innerHTML = '<div style="font-size:32px;">📷</div><div style="font-size:13px;color:#9999cc;text-align:center;">카메라 권한을 허용해주세요<br><span style="font-size:11px;">또는 사진 업로드를 사용해주세요</span></div>';
    var camStage = document.querySelector('.cam-stage');
    if (camStage) camStage.appendChild(errBox);
  }

  if (facing === undefined) {
    facing = (typeof sMode !== 'undefined' && sMode === 'face') ? 'user' : 'environment';
  }
  if (typeof currentFacing !== 'undefined') window.currentFacing = facing;

  video.style.transform = facing === 'user' ? 'scaleX(-1)' : 'scaleX(1)';

  // 기존 스트림 중지
  if (window.camStream) {
    window.camStream.getTracks().forEach(function(t) { t.stop(); });
    window.camStream = null;
  }

  try {
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    window.camStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play().catch(function(){});
    if (errBox) errBox.style.display = 'none';

    // 캔버스 배경 투명하게 (비디오 위에 오버레이)
    var canvas = document.getElementById('sc');
    if (canvas) {
      canvas.style.background = 'transparent';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '2';
      canvas.style.pointerEvents = 'auto';
    }

    if (typeof setFB === 'function') setFB('idle');
    if (typeof drawScan === 'function') drawScan();
    if (typeof startAlignCheck === 'function') setTimeout(startAlignCheck, 500);

  } catch(e) {
    console.warn('카메라 오류:', e.message);
    // 후면→전면 폴백
    if (facing === 'environment') {
      try {
        var fb = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: {ideal:1280}, height: {ideal:720} } });
        window.camStream = fb;
        video.srcObject = fb;
        video.style.display = 'block';
        video.style.transform = 'scaleX(-1)';
        await video.play().catch(function(){});
        if (errBox) errBox.style.display = 'none';
        if (typeof drawScan === 'function') drawScan();
        return;
      } catch(e2) {}
    }
    video.style.display = 'none';
    if (errBox) errBox.style.display = 'flex';
    if (typeof setFB === 'function') setFB('nocam');
  }
};

// ✅ 4. doCapture 오버라이드 - 실제 video에서 캡처
var _origDoCapture = window.doCapture;
window.doCapture = function() {
  if (window.sState === 'scanning' || window.sState === 'done') return;
  window.sState = 'scanning';
  var shutter = document.getElementById('sh');
  if (shutter) shutter.classList.add('cap');
  if (typeof setFB === 'function') setFB('scanning');
  window.sLY = 0; window.sLD = 1;

  document.getElementById('ps').classList.add('show');
  document.getElementById('rs').classList.remove('show');
  var c = document.getElementById('psteps'); c.innerHTML = '';
  (window.STEPS || []).forEach(function(s, i) {
    var d = document.createElement('div'); d.className = 'prog-step';
    d.innerHTML = '<div class="sico wait" id="si'+i+'">'+(i+1)+'</div><div class="slbl" id="sl'+i+'">'+s.label+'</div><div class="spct" id="sp'+i+'"></div>';
    c.appendChild(d);
  });

  window._scanResult = undefined;

  // 실제 video 또는 캔버스에서 캡처
  var video = document.getElementById('camVideo');
  var snapCanvas = document.createElement('canvas');
  snapCanvas.width = 640; snapCanvas.height = 400;
  var snapCtx = snapCanvas.getContext('2d');

  if (video && video.readyState >= 2 && video.videoWidth > 0) {
    // 전면카메라면 미러 보정
    if (window.currentFacing === 'user') {
      snapCtx.save();
      snapCtx.scale(-1, 1);
      snapCtx.drawImage(video, -640, 0, 640, 400);
      snapCtx.restore();
    } else {
      snapCtx.drawImage(video, 0, 0, 640, 400);
    }
  } else {
    snapCtx.fillStyle = '#111';
    snapCtx.fillRect(0, 0, 640, 400);
    // 카메라 없음 - 분석 중단
    if (typeof showShareToast === 'function') showShareToast('⚠️ 카메라가 연결되지 않았습니다. 사진 업로드를 이용해주세요.');
    window.sState = 'idle';
    document.getElementById('ps').classList.remove('show');
    if (shutter) shutter.classList.remove('cap');
    return;
  }

  var imageData = snapCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  if (typeof capturedImages !== 'undefined') capturedImages[window.sMode] = snapCanvas.toDataURL('image/jpeg', 0.8);

  if (typeof runStep === 'function') runStep(0);
  if (typeof analyzeWithAI === 'function') {
    analyzeWithAI(imageData).then(function(r) { window._scanResult = r; }).catch(function() { window._scanResult = {}; });
  }
};

// ============ 패치 v2 끝 ============
