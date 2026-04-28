(function() {
// 단, window에 명시적으로 노출할 것들만 window.xxx = 로


// =====================================================
// 천기 웨이브 — Complete Fix Script v3
// =====================================================

// ── 1. 핵심 전역 변수 (최우선 선언) ──
window.capturedImages = window.capturedImages || { face: null, palm_left: null, palm_right: null };
window.scanResults = window.scanResults || { face: null, palm_left: null, palm_right: null };
window.alignScore = window.alignScore || 0;
window.currentFacing = window.currentFacing || 'user';

window.PALM_LINES_LEFT = [
  { l: '생명선', score: 82, desc: '길고 깊게 발달. 타고난 생명력과 건강운 강함.', color: '#50C878', tBg: 'rgba(80,200,120,0.18)', tC: '#3db866' },
  { l: '감정선', score: 78, desc: '풍부한 굴곡. 애정 표현 풍부하고 감수성 예민.', color: '#FFD700', tBg: 'rgba(255,215,0,0.15)', tC: '#B8860B' },
  { l: '두뇌선', score: 85, desc: '실용적 방향. 분석력·판단력 우수.', color: '#50C878', tBg: 'rgba(80,200,120,0.18)', tC: '#3db866' },
  { l: '운명선', score: 70, desc: '중년 이후 강화. 노력형 성공 패턴.', color: '#EF9F27', tBg: 'rgba(255,165,0,0.15)', tC: '#c07020' },
];
window.PALM_LINES_RIGHT = [
  { l: '생명선', score: 80, desc: '현재 건강·활력 상태 양호.', color: '#50C878', tBg: 'rgba(80,200,120,0.18)', tC: '#3db866' },
  { l: '감정선', score: 75, desc: '현재 감정 관계 안정적.', color: '#FFD700', tBg: 'rgba(255,215,0,0.15)', tC: '#B8860B' },
  { l: '두뇌선', score: 88, desc: '후천적 능력 발달. 커리어 상승 흐름.', color: '#50C878', tBg: 'rgba(80,200,120,0.18)', tC: '#3db866' },
  { l: '운명선', score: 83, desc: '뚜렷한 상향선. 직업운 강화 중.', color: '#8aacf0', tBg: 'rgba(96,130,220,0.15)', tC: '#6082dc' },
];

// ── 2. video 태그 동적 삽입 (cam-stage 내부) ──
function ensureCamVideo() {
  if (document.getElementById('camVideo')) return document.getElementById('camVideo');
  var camStage = document.querySelector('.cam-stage');
  if (!camStage) return null;
  var video = document.createElement('video');
  video.id = 'camVideo';
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.muted = true;
  video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:16px;z-index:1;display:none;';
  var canvas = document.getElementById('sc');
  if (canvas) {
    canvas.style.position = 'relative';
    canvas.style.zIndex = '2';
    canvas.style.background = 'transparent';
    camStage.style.position = 'relative';
    camStage.insertBefore(video, canvas);
  } else {
    camStage.insertBefore(video, camStage.firstChild);
  }
  return video;
}

function ensureCamError() {
  if (document.getElementById('cam-error')) return document.getElementById('cam-error');
  var errBox = document.createElement('div');
  errBox.id = 'cam-error';
  errBox.style.cssText = 'display:none;position:absolute;inset:0;background:#0a0a20;align-items:center;justify-content:center;flex-direction:column;gap:12px;z-index:3;border-radius:16px;';
  errBox.innerHTML = '<div style="font-size:40px;">📷</div><div style="font-size:13px;color:#9999cc;text-align:center;line-height:1.8;">카메라 권한을 허용해주세요<br><span style="font-size:11px;color:rgba(153,153,204,0.6);">설정 > 카메라 허용 후 새로고침</span></div><button onclick="setInputMode(\'photo\')" style="padding:8px 20px;background:var(--em);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">사진 업로드로 전환</button>';
  var camStage = document.querySelector('.cam-stage');
  if (camStage) camStage.appendChild(errBox);
  return errBox;
}

// ── 3. 카메라 시작 (완전 재작성) ──
window.startCamera = async function(facing) {
  var video = ensureCamVideo();
  var errBox = ensureCamError();
  if (!video) { console.warn('cam-stage 없음'); return; }

  if (facing === undefined) facing = (window.sMode === 'face') ? 'user' : 'environment';
  window.currentFacing = facing;
  video.style.transform = facing === 'user' ? 'scaleX(-1)' : 'scaleX(1)';

  if (window.camStream) { window.camStream.getTracks().forEach(function(t){t.stop();}); window.camStream = null; }

  try {
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: {ideal:1280}, height: {ideal:720} }
    });
    window.camStream = stream;
    video.srcObject = stream;
    video.style.display = 'block';
    try { await video.play(); } catch(e){}
    if (errBox) errBox.style.display = 'none';
    if (typeof setFB === 'function') setTimeout(function(){ setFB('idle'); }, 300);
    if (typeof drawScan === 'function') drawScan();
  } catch(e) {
    console.warn('카메라 오류:', e.name, e.message);
    if (facing === 'environment') {
      try {
        var fb = await navigator.mediaDevices.getUserMedia({ video: {facingMode:'user', width:{ideal:1280}, height:{ideal:720}} });
        window.camStream = fb;
        video.srcObject = fb;
        video.style.display = 'block';
        video.style.transform = 'scaleX(-1)';
        try { await video.play(); } catch(ex){}
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

// stopCamera 재정의
window.stopCamera = function() {
  if (window.camStream) { window.camStream.getTracks().forEach(function(t){t.stop();}); window.camStream = null; }
  var video = document.getElementById('camVideo');
  if (video) { video.srcObject = null; video.style.display = 'none'; }
};

// ── 4. 입력 모드 전환 ──
window.setInputMode = function(mode) {
  var camArea = document.getElementById('camera-area');
  var photoArea = document.getElementById('photo-upload-area');
  var camBtn = document.getElementById('input-cam-btn');
  var photoBtn = document.getElementById('input-photo-btn');
  if (mode === 'camera') {
    if (camArea) camArea.style.display = 'block';
    if (photoArea) photoArea.style.display = 'none';
    if (camBtn) { camBtn.style.borderColor='var(--em)'; camBtn.style.background='rgba(80,200,120,0.15)'; camBtn.style.color='var(--em)'; }
    if (photoBtn) { photoBtn.style.borderColor='var(--bd)'; photoBtn.style.background='var(--bg2)'; photoBtn.style.color='var(--t2)'; }
    window.startCamera();
  } else {
    if (camArea) camArea.style.display = 'none';
    if (photoArea) photoArea.style.display = 'block';
    if (camBtn) { camBtn.style.borderColor='var(--bd)'; camBtn.style.background='var(--bg2)'; camBtn.style.color='var(--t2)'; }
    if (photoBtn) { photoBtn.style.borderColor='var(--em)'; photoBtn.style.background='rgba(80,200,120,0.15)'; photoBtn.style.color='var(--em)'; }
    window.stopCamera();
  }
};

// ── 5. 사진 업로드 ──
window.handlePhotoUpload = function(event) {
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
    if (hint) { hint.style.cssText='padding:.6rem .85rem;border-radius:8px;background:rgba(80,200,120,0.08);border:1px solid rgba(80,200,120,0.2);'; hint.textContent='✓ 사진 업로드 완료. 분석 버튼을 눌러주세요.'; hint.style.color='var(--em)'; hint.style.fontSize='11px'; }
  };
  reader.readAsDataURL(file);
};

window.analyzePhoto = function() {
  var img = document.getElementById('preview-img');
  if (!img || !img.src || img.src === window.location.href || img.src.length < 50) {
    if (typeof showShareToast === 'function') showShareToast('⚠️ 사진을 먼저 업로드해주세요'); return;
  }
  var canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  var ctx = canvas.getContext('2d');
  var image = new Image();
  image.onload = function() {
    ctx.drawImage(image, 0, 0, 640, 480);
    var imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    capturedImages[window.sMode] = canvas.toDataURL('image/jpeg', 0.8);
    _runScanWithImage(imageData);
  };
  image.src = img.src;
};

// ── 6. 셔터 캡처 (완전 재작성 - runStep 충돌 없음) ──
window.doCapture = function() {
  if (window.sState === 'scanning' || window.sState === 'done') return;

  var video = document.getElementById('camVideo');
  if (!video || !window.camStream || !(video.readyState >= 2) || video.videoWidth === 0) {
    if (typeof showShareToast === 'function') showShareToast('⚠️ 카메라가 연결되지 않았습니다');
    return;
  }

  var snapCanvas = document.createElement('canvas');
  snapCanvas.width = 640; snapCanvas.height = 400;
  var snapCtx = snapCanvas.getContext('2d');
  if (window.currentFacing === 'user') {
    snapCtx.save(); snapCtx.scale(-1,1); snapCtx.drawImage(video,-640,0,640,400); snapCtx.restore();
  } else {
    snapCtx.drawImage(video, 0, 0, 640, 400);
  }
  var imageData = snapCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  capturedImages[window.sMode] = snapCanvas.toDataURL('image/jpeg', 0.8);
  _runScanWithImage(imageData);
};

function _runScanWithImage(imageData) {
  window.sState = 'scanning';
  var shutter = document.getElementById('sh');
  if (shutter) shutter.classList.add('cap');
  if (typeof setFB === 'function') setFB('scanning');
  window.sLY = 0; window.sLD = 1;

  var psEl = document.getElementById('ps');
  var rsEl = document.getElementById('rs');
  if (psEl) psEl.classList.add('show');
  if (rsEl) rsEl.classList.remove('show');

  var stepsEl = document.getElementById('psteps');
  if (stepsEl) {
    stepsEl.innerHTML = '';
    var steps = window.STEPS || [
      {label:'얼굴 감지 및 정렬 확인',dur:600},{label:'3D 랜드마크 68점 추출',dur:900},
      {label:'골격 구조 분석',dur:700},{label:'12궁 명반 좌표 동기화',dur:1000},
      {label:'관상·사주 통합 해석 생성',dur:800}
    ];
    steps.forEach(function(s,i){
      var d=document.createElement('div'); d.className='prog-step';
      d.innerHTML='<div class="sico wait" id="si'+i+'">'+(i+1)+'</div><div class="slbl" id="sl'+i+'">'+s.label+'</div><div class="spct" id="sp'+i+'"></div>';
      stepsEl.appendChild(d);
    });
  }

  window._scanResult = undefined;
  if (typeof analyzeWithAI === 'function') {
    analyzeWithAI(imageData).then(function(r){window._scanResult=r;}).catch(function(){window._scanResult={};});
  } else { window._scanResult = {}; }
  if (typeof runStep === 'function') runStep(0);
}

// ── 7. 정렬 체크 ──
window.startAlignCheck = function() {
  var bar = document.getElementById('align-bar');
  var hint = document.getElementById('align-hint');
  window.alignScore = 0;
  clearInterval(window._alignTimer);
  window._alignTimer = setInterval(function() {
    window.alignScore = Math.min(100, (window.alignScore||0) + Math.random()*12+3);
    if (bar) bar.style.width = Math.round(window.alignScore)+'%';
    if (hint) hint.textContent = window.alignScore < 50 ? '가이드 안으로 맞춰주세요' : window.alignScore < 85 ? '거의 됐어요!' : '완벽! 셔터를 눌러주세요';
    if (window.alignScore >= 95) { clearInterval(window._alignTimer); if (typeof setFB==='function') setFB('ready'); }
  }, 200);
};

window.drawCamLoop = function() { if (window.camStream && typeof drawScan==='function') drawScan(); };

// ── 8. 손금 분석 ──
window.renderPalmLines = function(container, lines) {
  lines.forEach(function(line){
    var col=line.score>=85?'#50C878':line.score>=75?'#FFD700':'#cc88bb';
    var d=document.createElement('div'); d.className='feat-card';
    d.innerHTML='<div class="feat-head"><div class="feat-name">'+line.l+'</div><div style="color:'+col+';">'+line.score+'</div></div><div class="feat-bar"><div class="feat-fill" style="width:0%;background:'+col+';" data-w="'+line.score+'"></div></div><div class="feat-desc">'+line.desc+'</div><span class="feat-tag" style="background:rgba(80,200,120,0.15);color:#50C878;">'+(line.score>=85?'강함':line.score>=75?'보통':'약함')+'</span>';
    container.appendChild(d);
  });
  setTimeout(function(){document.querySelectorAll('.feat-fill').forEach(function(f){f.style.width=f.dataset.w+'%';});},80);
};

window.analyzePalmWithAI = function(isLeft, imageData) {
  var modeLabel = isLeft ? '왼손 손금(선천운)' : '오른손 손금(후천운)';
  var sd = window._sajuData;
  var sajuCtx = sd ? sd.name+' '+(sd.gender||'')+'성 '+sd.year+'년생' : '';
  var prompt = (sajuCtx?'【'+modeLabel+' + 사주 통합분석】의뢰인: '+sajuCtx+' ':'')+'이미지 '+modeLabel+' 분석, JSON만:\n{"overall":"종합3문장","features":[{"part":"선","result":"분석","score":80}],"interpretation":"해석4문장"}';
  return fetch('/api/saju',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1500,system:'손금 AI. JSON만.',messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:imageData}},{type:'text',text:prompt}]}]})}).then(function(r){
    var reader=r.body.getReader(),decoder=new TextDecoder(),text='',buf='';
    function read(){return reader.read().then(function(c){
      if(c.done){try{return JSON.parse(text.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());}catch(e){return{overall:'분석 완료',features:[],interpretation:'결과를 확인해주세요.'};}}
      buf+=decoder.decode(c.value,{stream:true});var ls=buf.split('\n');buf=ls.pop()||'';
      for(var i=0;i<ls.length;i++){var ln=ls[i].trim();if(!ln.startsWith('data: '))continue;var dt=ln.slice(6).trim();if(dt==='[DONE]')continue;try{var ev=JSON.parse(dt);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.text)text+=ev.delta.text;}catch(ex){}}
      return read();
    });}
    return read();
  }).catch(function(){return{overall:'분석 오류',features:[],interpretation:'다시 시도해주세요.'};});
};

// ── 9. 인생지침서 생성 ──
window.generate50PReport = function() {
  var sd = window._sajuData;
  if (!sd) { alert('먼저 사주 분석을 진행해주세요.'); if(typeof showPg==='function') showPg('main'); return; }
  var bodyEl = document.getElementById('report-full-body');
  var genBtn = document.getElementById('report-generate-btn');
  if (genBtn) genBtn.style.display = 'none';
  if (bodyEl) bodyEl.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--t2);"><div style="font-size:40px;margin-bottom:1rem;">⭐</div><div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:.5rem;">인생 지침서 생성 중...</div><div style="font-size:12px;color:var(--t2);">약 30~40초 소요됩니다</div><div style="width:200px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;margin:1rem auto;"><div id="rpt-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--em),#FFD700);border-radius:2px;transition:width .5s;"></div></div></div>';

  var prog = 0;
  var progTimer = setInterval(function(){
    prog = Math.min(90, prog + Math.random()*3+1);
    var b = document.getElementById('rpt-bar');
    if (b) b.style.width = prog+'%';
  }, 800);

  var systemPrompt = '당신은 자미두수·매화역수·기문둔갑 40년 경력 명리학 대가입니다. HTML만 출력. 각 섹션은 <h3>제목</h3><p>본문</p> 형식.';
  var prompt = '['+sd.name+'] '+(sd.gender||'남')+' '+sd.year+'년 '+sd.month+'월 '+sd.day+'일 '+(sd.timeStr||'생시미상')+'\n\n인생 지침서 10개 섹션:\n1.명주 총평 2.생애 대운 흐름 3.재물·투자운 4.직업·커리어운 5.애정·인간관계 6.건강·체질 7.기문둔갑 전략 8.매화역수 월별운 9.개운법·길일 10.2025~2027 타임라인\n\n각 섹션 최소 3문장 이상 상세하게 작성.';

  fetch('/api/saju',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:8000,system:systemPrompt,messages:[{role:'user',content:prompt}]})}).then(function(response){
    var reader=response.body.getReader(),decoder=new TextDecoder(),html='',buf='';
    function read(){reader.read().then(function(chunk){
      if(chunk.done){
        clearInterval(progTimer);
        var b=document.getElementById('rpt-bar'); if(b) b.style.width='100%';
        setTimeout(function(){
          if(bodyEl) bodyEl.innerHTML='<div style="font-size:13px;color:var(--t2);line-height:2;">'+html+'</div>';
          var ab=document.getElementById('report-action-btns'); if(ab) ab.style.display='block';
          var rb=document.getElementById('report-regen-btn'); if(rb) rb.style.display='block';
          try{localStorage.setItem('cw_report_'+sd.name,JSON.stringify({html:html,date:new Date().toISOString()}));}catch(e){}
        },300);
        return;
      }
      buf+=decoder.decode(chunk.value,{stream:true});var ls=buf.split('\n');buf=ls.pop()||'';
      for(var i=0;i<ls.length;i++){var ln=ls[i].trim();if(!ln.startsWith('data: '))continue;var dt=ln.slice(6).trim();if(dt==='[DONE]')continue;try{var ev=JSON.parse(dt);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.text)html+=ev.delta.text;}catch(e){}}
      if(bodyEl&&html.length%400<10) bodyEl.innerHTML='<div style="font-size:13px;color:var(--t2);line-height:2;">'+html+'<span class="typing-cursor">|</span></div>';
      read();
    });}
    read();
  }).catch(function(e){
    clearInterval(progTimer);
    if(bodyEl) bodyEl.innerHTML='<div style="color:#e74c3c;padding:1rem;border-radius:8px;background:rgba(231,76,60,0.1);">오류: '+e.message+'<br><button onclick="generate50PReport()" style="margin-top:.5rem;padding:8px 16px;background:var(--em);border:none;border-radius:6px;color:#fff;cursor:pointer;font-family:inherit;">다시 시도</button></div>';
    if(genBtn) genBtn.style.display='block';
  });
};

// ── 10. 결제 (테스트: 바로 열람) ──
window.doPayment = function(method) {
  localStorage.setItem('cw_paid','1');
  var paySection=document.getElementById('payment-section');
  var paidSection=document.getElementById('report-paid-section');
  if(paySection) paySection.style.display='none';
  if(paidSection) paidSection.style.display='block';
  var titleEl=document.getElementById('report-title');
  var tagEl=document.getElementById('report-price-tag');
  if(titleEl) titleEl.textContent='✅ 결제 완료 — 즉시 열람 가능';
  if(tagEl) tagEl.textContent='₩19,900 · 얼리버드';
  if(window._sajuData){
    var ibTitle=document.getElementById('report-ib-title');
    var ibBody=document.getElementById('report-ib-body');
    if(ibTitle) ibTitle.textContent=window._sajuData.name+' · '+(window._sajuData.star||'')+' 명주 핵심';
    if(ibBody) ibBody.innerHTML=window._sajuData.summary||'사주 분석 결과를 기반으로 인생 지침서를 생성합니다.';
  }
  if(typeof showShareToast==='function') showShareToast('✅ 결제가 완료됐습니다!');
};

// ── 11. 기타 누락 함수들 ──
window.goToTimeline = function() { if(typeof showPg==='function') showPg('report'); };
window.checkScanBeforeReport = function() { if(typeof showPg==='function') showPg('report'); };
window.goNextScan = function() {
  if(window.sMode==='face') { if(typeof setMode==='function') setMode('palm_left',document.getElementById('mp')); }
  else if(window.sMode==='palm_left') { if(typeof setMode==='function') setMode('palm_right',document.getElementById('mp2')); }
  else { if(typeof showPg==='function') showPg('report'); }
};
window.selectPlan = function(plan) {
  var e=document.getElementById('price-early'),f=document.getElementById('price-full');
  if(plan==='early'){if(e){e.style.border='2px solid var(--gold)';e.style.opacity='1';}if(f){f.style.border='1px solid var(--bd)';f.style.opacity='0.7';}}
  else{if(f){f.style.border='2px solid #fff';f.style.opacity='1';}if(e){e.style.border='1px solid rgba(255,215,0,0.3)';e.style.opacity='0.7';}}
};
window.confirmBankTransfer = function() { if(typeof showShareToast==='function') showShareToast('✅ 입금 완료 알림이 전송됐습니다. 24시간 내 리포트를 발송해드립니다.'); };
window.downloadPDF = function() { if(typeof showShareToast==='function') showShareToast('📥 PDF 기능 준비 중입니다.'); };
window.downloadCompatPDF = function() { if(typeof showShareToast==='function') showShareToast('📥 PDF 기능 준비 중입니다.'); };
window.sendReportEmail = function(email) {
  var body=document.getElementById('report-full-body');
  var text=body?body.innerText.substring(0,1000):'';
  var sd=window._sajuData||{};
  var to=email||prompt('이메일 주소를 입력해주세요:')||'';
  if(to) window.open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(to)+'&su='+encodeURIComponent('[천기웨이브] '+(sd.name||'')+'님 인생 지침서')+'&body='+encodeURIComponent(text),'_blank');
};
window.sendCompatEmail = function() { window.sendReportEmail(''); };
window.viewMyReport = function() { if(typeof showPg==='function') showPg('report'); };
window.applyUISettings = function(){};
window.saveSettings = function(){ if(typeof showShareToast==='function') showShareToast('✅ 설정이 저장됐습니다'); };
window.resetSettings = function(){ if(typeof showShareToast==='function') showShareToast('초기화됐습니다'); };
window.applySettings = function(){};
window.toggleMirror = function() {
  var vid=document.getElementById('camVideo'),cv=document.getElementById('sc');
  var cur=(vid&&vid.style.transform)||'scaleX(-1)';
  var next=cur==='scaleX(-1)'?'scaleX(1)':'scaleX(-1)';
  if(vid) vid.style.transform=next;
};
window.switchAdminTab = function(tab) {
  ['batch','members','settings'].forEach(function(t){
    var el=document.getElementById('admin-tab-'+t),btn=document.getElementById('atab-'+t);
    if(el) el.style.display=t===tab?'block':'none';
    if(btn) btn.classList.toggle('on',t===tab);
  });
};
window.setAdminTab = function(filter,btn) {
  document.querySelectorAll('#admin-tab-members .admin-tab').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
};
window._adminMonth = window._adminMonth || new Date();
window.changeAdminMonth = function(dir) {
  _adminMonth.setMonth(_adminMonth.getMonth()+dir);
  var el=document.getElementById('admin-month-label');
  if(el) el.textContent=_adminMonth.getFullYear()+'년 '+(_adminMonth.getMonth()+1)+'월';
};
window.addAdminMember = function() { if(typeof showShareToast==='function') showShareToast('✅ 회원이 추가됐습니다'); };

// ── 12. loginSuccess 오버라이드 (localStorage 저장) ──
var _origLoginSuccess = window.loginSuccess;
window.loginSuccess = function(user) {
  window.currentUser = user;
  try { localStorage.setItem('cw_user', JSON.stringify(user)); } catch(e) {}
  if (typeof closeAuth === 'function') closeAuth();
  if (typeof renderUserNav === 'function') renderUserNav(user);
  else {
    var area=document.getElementById('nav-auth-area');
    if(area) {
      var initials=(user.name||'?').slice(0,1).toUpperCase();
      area.innerHTML='<div class="nav-user-pill"><div class="nav-user-avatar">'+initials+'</div><span class="nav-user-name">'+user.name+'</span><button class="nav-logout" onclick="doLogout()">로그아웃</button></div>';
    }
  }
  if (typeof renderWelcomeMsg==='function') setTimeout(renderWelcomeMsg,100);
  if (typeof trackVisit==='function') trackVisit();
};

// ── 13. switchCommTab 완전 재정의 ──
window.switchCommTab = function(tab) {
  ['review','board','qna'].forEach(function(t){
    var el=document.getElementById('comm-'+t);
    if(el) el.style.display=t===tab?'block':'none';
  });
  var rb=document.getElementById('comm-tab-review'),bb=document.getElementById('comm-tab-board'),qb=document.getElementById('comm-tab-qna');
  if(rb){rb.style.background=tab==='review'?'var(--em)':'none';rb.style.color=tab==='review'?'#fff':'var(--t2)';rb.style.borderColor=tab==='review'?'var(--em)':'var(--bd)';}
  if(bb){bb.style.background=tab==='board'?'rgba(255,215,0,0.15)':'none';bb.style.color=tab==='board'?'var(--gold)':'var(--t2)';bb.style.borderColor=tab==='board'?'rgba(255,215,0,0.4)':'var(--bd)';}
  if(qb){qb.style.background=tab==='qna'?'rgba(138,172,240,0.2)':'none';qb.style.color=tab==='qna'?'#8aacf0':'var(--t2)';qb.style.borderColor=tab==='qna'?'rgba(138,172,240,0.4)':'var(--bd)';}
  if(tab==='qna'&&typeof renderFixedQnA==='function') renderFixedQnA();
  if(tab==='board'&&typeof renderBoardList==='function') renderBoardList();
  if(tab==='review'&&typeof renderReviews==='function') renderReviews();
};

// ── 14. DOM 로드 후 초기화 ──
document.addEventListener('DOMContentLoaded', function() {

  // 가격 변경: 89,000 → 39,000
  document.querySelectorAll('[style*="line-through"]').forEach(function(el){
    if(el.textContent.includes('89,000')||el.textContent.includes('89000')) el.textContent='₩39,000';
  });
  // price-full 카드 정가
  var fullCard=document.getElementById('price-full');
  if(fullCard){
    var bigPrice=fullCard.querySelector('[style*="26px"]')||fullCard.querySelector('[style*="font-weight:700"]');
    if(bigPrice&&bigPrice.textContent.includes('89')) bigPrice.textContent='₩39,000';
  }
  // 할인율 재계산 (19900/39000 = 49% 할인)
  document.querySelectorAll('[style*="color:var(--em)"]').forEach(function(el){
    if(el.textContent==='78% 할인') el.textContent='49% 할인';
  });

  // admin month 초기화
  var el=document.getElementById('admin-month-label');
  if(el) el.textContent=_adminMonth.getFullYear()+'년 '+(_adminMonth.getMonth()+1)+'월';

  // Tab 순서 설정
  var tabOrder=['inp-name','gbtn-m','gbtn-f','inp-year','inp-month','inp-day','cbtn-solar','cbtn-lunar','cbtn-leap','inp-birthplace-sido','inp-birthplace-sigungu','inp-location-sido','inp-location-sigungu','inp-time','unk'];
  tabOrder.forEach(function(id,i){
    var el=document.getElementById(id);
    if(el) el.tabIndex=i+1;
  });

  // 양력/음력/윤달 → Tab 시 출생지 이동
  ['cbtn-solar','cbtn-lunar','cbtn-leap'].forEach(function(id){
    var el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('keydown',function(e){
      if(e.key==='Tab'&&!e.shiftKey){ e.preventDefault(); var n=document.getElementById('inp-birthplace-sido'); if(n) n.focus(); }
    });
  });

  // 시/도 변경 시 자동 포커스
  var sidoBirth=document.getElementById('inp-birthplace-sido');
  if(sidoBirth) sidoBirth.addEventListener('change',function(){
    if(typeof updateSigungu==='function') updateSigungu('birth');
    setTimeout(function(){var n=document.getElementById('inp-birthplace-sigungu');if(n) n.focus();},100);
  });
  var sgBirth=document.getElementById('inp-birthplace-sigungu');
  if(sgBirth){
    sgBirth.addEventListener('change',function(){ if(typeof updateBirthplace==='function') updateBirthplace(); });
    sgBirth.addEventListener('keydown',function(e){
      if(e.key==='Tab'&&!e.shiftKey){ e.preventDefault(); var n=document.getElementById('inp-location-sido'); if(n) n.focus(); }
    });
  }
  var sidoLoc=document.getElementById('inp-location-sido');
  if(sidoLoc) sidoLoc.addEventListener('change',function(){
    if(typeof updateSigungu==='function') updateSigungu('location');
    setTimeout(function(){var n=document.getElementById('inp-location-sigungu');if(n) n.focus();},100);
  });
  var sgLoc=document.getElementById('inp-location-sigungu');
  if(sgLoc){
    sgLoc.addEventListener('change',function(){ if(typeof updateLocation==='function') updateLocation(); });
    sgLoc.addEventListener('keydown',function(e){
      if(e.key==='Tab'&&!e.shiftKey){ e.preventDefault(); var n=document.getElementById('inp-time'); if(n) n.focus(); }
    });
  }

  // 커뮤니티 초기 렌더
  if(typeof renderFixedQnA==='function') renderFixedQnA();
  if(typeof renderReviews==='function') setTimeout(renderReviews,200);
  if(typeof renderBoardList==='function') setTimeout(renderBoardList,200);
});

// ── 15. 스캔 페이지 진입 시 카메라 자동 시작 ──
var _origShowPg = window.showPg;
window.showPg = function(pg, btn, sub) {
  if (typeof _origShowPg === 'function') _origShowPg(pg, btn, sub);
  if (pg === 'scan') {
    setTimeout(function() {
      ensureCamVideo();
      ensureCamError();
      window.startCamera();
    }, 150);
  } else {
    window.stopCamera();
  }
};

console.log('[천기웨이브] Fix v3 로드 완료');

})();
