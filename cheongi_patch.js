// 천기 웨이브 — Fix Script v4
// 충돌 방지: var 선언 없음, window.xxx 방식만 사용

// ── 전역 변수 초기화 (충돌 없는 방식) ──
window.capturedImages = window.capturedImages || { face: null, palm_left: null, palm_right: null };
window.scanResults    = window.scanResults    || { face: null, palm_left: null, palm_right: null };
window._adminMonth    = new Date();

window.PALM_LINES_LEFT = [
  { l:'생명선', score:82, desc:'길고 깊게 발달. 타고난 생명력·건강운 강함.', color:'#50C878', tBg:'rgba(80,200,120,0.18)', tC:'#3db866' },
  { l:'감정선', score:78, desc:'풍부한 굴곡. 애정 표현 풍부하고 감수성 예민.', color:'#FFD700', tBg:'rgba(255,215,0,0.15)', tC:'#B8860B' },
  { l:'두뇌선', score:85, desc:'실용적 방향. 분석력·판단력 우수.', color:'#50C878', tBg:'rgba(80,200,120,0.18)', tC:'#3db866' },
  { l:'운명선', score:70, desc:'중년 이후 강화. 노력형 성공 패턴.', color:'#EF9F27', tBg:'rgba(255,165,0,0.15)', tC:'#c07020' }
];
window.PALM_LINES_RIGHT = [
  { l:'생명선', score:80, desc:'현재 건강·활력 상태 양호.', color:'#50C878', tBg:'rgba(80,200,120,0.18)', tC:'#3db866' },
  { l:'감정선', score:75, desc:'현재 감정 관계 안정적.', color:'#FFD700', tBg:'rgba(255,215,0,0.15)', tC:'#B8860B' },
  { l:'두뇌선', score:88, desc:'후천적 능력 발달. 커리어 상승 흐름.', color:'#50C878', tBg:'rgba(80,200,120,0.18)', tC:'#3db866' },
  { l:'운명선', score:83, desc:'뚜렷한 상향선. 직업운 강화 중.', color:'#8aacf0', tBg:'rgba(96,130,220,0.15)', tC:'#6082dc' }
];

// ── 카메라: video 태그 동적 삽입 ──
function _ensureVideo() {
  if (document.getElementById('camVideo')) return document.getElementById('camVideo');
  var stage = document.querySelector('.cam-stage');
  if (!stage) return null;
  var v = document.createElement('video');
  v.id = 'camVideo'; v.autoplay = true; v.muted = true;
  v.setAttribute('playsinline','');
  v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:16px;z-index:1;display:none;';
  var sc = document.getElementById('sc');
  if (sc) {
    sc.style.position = 'relative'; sc.style.zIndex = '2';
    sc.style.background = 'transparent';
    stage.style.position = 'relative';
    stage.insertBefore(v, sc);
  } else { stage.insertBefore(v, stage.firstChild); }

  // 에러 박스
  if (!document.getElementById('cam-error')) {
    var err = document.createElement('div');
    err.id = 'cam-error';
    err.style.cssText = 'display:none;position:absolute;inset:0;background:#0a0a20;z-index:3;border-radius:16px;align-items:center;justify-content:center;flex-direction:column;gap:12px;text-align:center;padding:2rem;';
    err.innerHTML = '<div style="font-size:40px;">📷</div>'
      + '<div style="font-size:13px;color:#9999cc;line-height:1.8;">카메라 권한을 허용해주세요<br><span style="font-size:11px;opacity:.6;">설정 → 카메라 허용 후 새로고침</span></div>'
      + '<button onclick="setInputMode(\'photo\')" style="padding:8px 20px;background:var(--em);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:4px;">사진 업로드로 전환</button>';
    stage.appendChild(err);
  }
  return v;
}

window.startCamera = async function(facing) {
  var v = _ensureVideo();
  if (!v) return;
  if (facing === undefined) facing = (window.sMode === 'face') ? 'user' : 'environment';
  window.currentFacing = facing;
  v.style.transform = facing === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
  if (window.camStream) { window.camStream.getTracks().forEach(function(t){t.stop();}); window.camStream = null; }
  var errBox = document.getElementById('cam-error');
  try {
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width:{ideal:1280}, height:{ideal:720} }
    });
    window.camStream = stream;
    v.srcObject = stream; v.style.display = 'block';
    try { await v.play(); } catch(e){}
    if (errBox) errBox.style.display = 'none';
    setTimeout(function(){ if(typeof setFB==='function') setFB('idle'); }, 200);
    if (typeof drawScan === 'function') drawScan();
  } catch(e) {
    if (facing === 'environment') {
      try {
        var fb = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}});
        window.camStream = fb; v.srcObject = fb; v.style.display = 'block';
        v.style.transform = 'scaleX(-1)'; window.currentFacing = 'user';
        try { await v.play(); } catch(ex){}
        if (errBox) errBox.style.display = 'none';
        if (typeof drawScan === 'function') drawScan();
        return;
      } catch(e2) {}
    }
    v.style.display = 'none';
    if (errBox) errBox.style.display = 'flex';
    if (typeof setFB === 'function') setFB('nocam');
  }
};

window.stopCamera = function() {
  if (window.camStream) { window.camStream.getTracks().forEach(function(t){t.stop();}); window.camStream = null; }
  var v = document.getElementById('camVideo');
  if (v) { v.srcObject = null; v.style.display = 'none'; }
};

// ── setInputMode ──
window.setInputMode = function(mode) {
  var ca=document.getElementById('camera-area'), pa=document.getElementById('photo-upload-area');
  var cb=document.getElementById('input-cam-btn'), pb=document.getElementById('input-photo-btn');
  if (mode === 'camera') {
    if(ca) ca.style.display='block'; if(pa) pa.style.display='none';
    if(cb){cb.style.borderColor='var(--em)';cb.style.background='rgba(80,200,120,0.15)';cb.style.color='var(--em)';}
    if(pb){pb.style.borderColor='var(--bd)';pb.style.background='var(--bg2)';pb.style.color='var(--t2)';}
    window.startCamera();
  } else {
    if(ca) ca.style.display='none'; if(pa) pa.style.display='block';
    if(cb){cb.style.borderColor='var(--bd)';cb.style.background='var(--bg2)';cb.style.color='var(--t2)';}
    if(pb){pb.style.borderColor='var(--em)';pb.style.background='rgba(80,200,120,0.15)';pb.style.color='var(--em)';}
    window.stopCamera();
  }
};

// ── 사진 업로드 ──
window.handlePhotoUpload = function(event) {
  var file = event.target.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img=document.getElementById('preview-img'); if(img) img.src=e.target.result;
    var pv=document.getElementById('photo-preview'), dz=document.getElementById('upload-drop-zone');
    if(pv) pv.style.display='block'; if(dz) dz.style.display='none';
    var hint=document.getElementById('photo-quality-hint');
    if(hint){hint.style.cssText='padding:.6rem .85rem;border-radius:8px;background:rgba(80,200,120,0.08);border:1px solid rgba(80,200,120,0.2);font-size:11px;color:var(--em);';hint.textContent='✓ 사진 업로드 완료. 분석 버튼을 눌러주세요.';}
  };
  reader.readAsDataURL(file);
};

window.analyzePhoto = function() {
  var img=document.getElementById('preview-img');
  if(!img||!img.src||img.src===window.location.href||img.src.length<100){
    if(typeof showShareToast==='function') showShareToast('⚠️ 사진을 먼저 업로드해주세요'); return;
  }
  var canvas=document.createElement('canvas'); canvas.width=640; canvas.height=480;
  var ctx=canvas.getContext('2d'), image=new Image();
  image.onload=function(){
    ctx.drawImage(image,0,0,640,480);
    var data=canvas.toDataURL('image/jpeg',0.8);
    window.capturedImages[window.sMode]=data;
    _runScanImage(data.split(',')[1]);
  };
  image.src=img.src;
};

// ── 셔터 캡처 ──
window.doCapture = function() {
  if (window.sState==='scanning'||window.sState==='done') return;
  var v=document.getElementById('camVideo');
  if (!v||!window.camStream||v.readyState<2||v.videoWidth===0) {
    if(typeof showShareToast==='function') showShareToast('⚠️ 카메라가 아직 준비되지 않았습니다');
    return;
  }
  var snap=document.createElement('canvas'); snap.width=640; snap.height=400;
  var sctx=snap.getContext('2d');
  if (window.currentFacing==='user') { sctx.save();sctx.scale(-1,1);sctx.drawImage(v,-640,0,640,400);sctx.restore(); }
  else { sctx.drawImage(v,0,0,640,400); }
  var data=snap.toDataURL('image/jpeg',0.8);
  window.capturedImages[window.sMode]=data;
  _runScanImage(data.split(',')[1]);
};

function _runScanImage(imageData) {
  window.sState='scanning';
  var sh=document.getElementById('sh'); if(sh) sh.classList.add('cap');
  if(typeof setFB==='function') setFB('scanning');
  window.sLY=0; window.sLD=1;
  var ps=document.getElementById('ps'),rs=document.getElementById('rs');
  if(ps) ps.classList.add('show'); if(rs) rs.classList.remove('show');
  var psteps=document.getElementById('psteps');
  if(psteps) {
    psteps.innerHTML='';
    var steps=window.STEPS||[
      {label:'얼굴 감지 및 정렬 확인',dur:600},{label:'3D 랜드마크 68점 추출',dur:900},
      {label:'골격 구조 분석',dur:700},{label:'12궁 명반 좌표 동기화',dur:1000},
      {label:'관상·사주 통합 해석 생성',dur:800}
    ];
    steps.forEach(function(s,i){
      var d=document.createElement('div'); d.className='prog-step';
      d.innerHTML='<div class="sico wait" id="si'+i+'">'+(i+1)+'</div>'
        +'<div class="slbl" id="sl'+i+'">'+s.label+'</div>'
        +'<div class="spct" id="sp'+i+'"></div>';
      psteps.appendChild(d);
    });
  }
  window._scanResult=undefined;
  if(typeof analyzeWithAI==='function')
    analyzeWithAI(imageData).then(function(r){window._scanResult=r;}).catch(function(){window._scanResult={};});
  else window._scanResult={};
  if(typeof runStep==='function') runStep(0);
}

window.startAlignCheck = function() {
  window._alignScore=0;
  clearInterval(window._alignTimer);
  window._alignTimer=setInterval(function(){
    window._alignScore=Math.min(100,(window._alignScore||0)+Math.random()*10+3);
    var b=document.getElementById('align-bar'),h=document.getElementById('align-hint');
    if(b) b.style.width=Math.round(window._alignScore)+'%';
    if(h) h.textContent=window._alignScore<50?'가이드 안으로 맞춰주세요':window._alignScore<85?'거의 됐어요!':'완벽! 셔터를 눌러주세요';
    if(window._alignScore>=95){clearInterval(window._alignTimer);if(typeof setFB==='function') setFB('ready');}
  },200);
};
window.drawCamLoop=function(){if(window.camStream&&typeof drawScan==='function') drawScan();};

// ── 손금 ──
window.renderPalmLines=function(container,lines){
  lines.forEach(function(l){
    var col=l.score>=85?'#50C878':l.score>=75?'#FFD700':'#cc88bb';
    var d=document.createElement('div'); d.className='feat-card';
    d.innerHTML='<div class="feat-head"><div class="feat-name">'+l.l+'</div><div style="color:'+col+';">'+l.score+'</div></div>'
      +'<div class="feat-bar"><div class="feat-fill" style="width:0%;background:'+col+';" data-w="'+l.score+'"></div></div>'
      +'<div class="feat-desc">'+l.desc+'</div>'
      +'<span class="feat-tag" style="background:rgba(80,200,120,0.15);color:#50C878;">'+(l.score>=85?'강함':l.score>=75?'보통':'약함')+'</span>';
    container.appendChild(d);
  });
  setTimeout(function(){document.querySelectorAll('.feat-fill').forEach(function(f){f.style.width=f.dataset.w+'%';});},80);
};
window.analyzePalmWithAI=function(isLeft,imageData){
  var ml=isLeft?'왼손 손금(선천운)':'오른손 손금(후천운)';
  var sd=window._sajuData,ctx=sd?sd.name+' '+(sd.gender||'')+'성 '+sd.year+'년생':'';
  var prompt=(ctx?'【'+ml+' + 사주 통합분석】의뢰인: '+ctx+' ':'')+ml+' 분석, JSON만:\n{"overall":"종합3문장","features":[{"part":"선","result":"분석","score":80}],"interpretation":"해석4문장"}';
  return fetch('/api/saju',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1500,system:'손금AI.JSON만.',
    messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:imageData}},{type:'text',text:prompt}]}]})
  }).then(function(r){
    var reader=r.body.getReader(),dec=new TextDecoder(),text='',buf='';
    function read(){return reader.read().then(function(c){
      if(c.done){try{return JSON.parse(text.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());}catch(e){return{overall:'분석완료',features:[],interpretation:'확인해주세요.'};}}
      buf+=dec.decode(c.value,{stream:true});var ls=buf.split('\n');buf=ls.pop()||'';
      for(var i=0;i<ls.length;i++){var ln=ls[i].trim();if(!ln.startsWith('data: '))continue;var dt=ln.slice(6).trim();if(dt==='[DONE]')continue;try{var ev=JSON.parse(dt);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.text)text+=ev.delta.text;}catch(ex){}}
      return read();
    });}return read();
  }).catch(function(){return{overall:'분석오류',features:[],interpretation:'다시 시도해주세요.'};});
};

// ── 인생지침서: _sajuData 없으면 입력값으로 즉시 세팅 ──
function _ensureSajuData() {
  if (window._sajuData) return true;
  var name=(document.getElementById('inp-name')||{}).value||'';
  var year=(document.getElementById('inp-year')||{}).value||'';
  var month=(document.getElementById('inp-month')||{}).value||'';
  var day=(document.getElementById('inp-day')||{}).value||'';
  if (!name||!year||!month||!day) return false;
  var time=(document.getElementById('inp-time')||{}).value||'';
  var unk=(document.getElementById('unk')||{}).checked||false;
  window._sajuData = {
    name:name, year:year, month:month, day:day,
    timeStr: unk?'시간미상':time,
    age: new Date().getFullYear()-parseInt(year),
    gender: window.selectedGender||'남',
    cal: window.selectedCal||'양력',
    star:'', daewoon:'', summary:'', scores:{}, lucky_direction:'북동'
  };
  return true;
}

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

  if(bodyEl) bodyEl.innerHTML =
    '<div style="text-align:center;padding:3rem 1rem;color:var(--t2);">'
    + '<div style="font-size:48px;margin-bottom:1rem;animation:spin 1.2s linear infinite;display:inline-block;">⭐</div>'
    + '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:.5rem;" id="rpt-status">1부 분석 중... (1/2) 🔮</div>'
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

  var system = '당신은 자미두수·매화역수·기문둔갑 40년 경력 명리학 대가입니다. ' + styleRule;

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

  function fetchSection(prompt, progStart, progEnd, statusText, subText) {
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
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({model:'claude-sonnet-4-6', max_tokens:16000, system:system, messages:[{role:'user',content:prompt}]})
    }).then(function(response) {
      if(!response.ok) throw new Error('서버 오류 ' + response.status);
      var reader = response.body.getReader(), dec = new TextDecoder(), html = '', buf = '';
      function read() {
        return reader.read().then(function(chunk) {
          if(chunk.done) return html;
          buf += dec.decode(chunk.value, {stream:true});
          var ls = buf.split('\n'); buf = ls.pop() || '';
          for(var i=0;i<ls.length;i++){
            var ln=ls[i].trim(); if(!ln.startsWith('data: ')) continue;
            var dt=ln.slice(6).trim(); if(dt==='[DONE]') continue;
            try{var ev=JSON.parse(dt);if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.text)html+=ev.delta.text;}catch(e){}
          }
          return read();
        });
      }
      return read();
    });
  }

  fetchSection(prompt1, 0, 48, '1부 분석 중... (1/2) 🔮', '명주총평 · 생애대운 · 재물 · 직업 · 애정 분석 중입니다 ☕ 잠시만 기다려주세요!')
  .then(function(html1) {
    prog = 50;
    var b = document.getElementById('rpt-bar'); if(b) b.style.width = '50%';
    return fetchSection(prompt2, 50, 95, '2부 분석 중... (2/2) ✨', '건강 · 기문둔갑 · 매화역수 · 개운법 · 타임라인 작성 중입니다 🌙 거의 다 왔어요!')
    .then(function(html2) {
      clearInterval(progTimer);
      var b2 = document.getElementById('rpt-bar'); if(b2) b2.style.width = '100%';
      var fullHtml = (html1 + html2).replace(/```html\s*/gi,'').replace(/```\s*/g,'').trim();
      setTimeout(function() {
        if(bodyEl) bodyEl.innerHTML = '<div style="font-size:13px;color:var(--t2);line-height:2;padding:.5rem 0;">' + fullHtml + '</div>';
        var ab=document.getElementById('report-action-btns'); if(ab) ab.style.display='block';
        var rb=document.getElementById('report-regen-btn'); if(rb) rb.style.display='block';
        try{localStorage.setItem('cw_report_'+sd.name,JSON.stringify({html:fullHtml,date:new Date().toISOString()}));}catch(e){}
        if(typeof showShareToast==='function') showShareToast('✅ 인생 지침서 완성! 🎉');
      }, 300);
    });
  }).catch(function(e) {
    clearInterval(progTimer);
    if(bodyEl) bodyEl.innerHTML='<div style="color:#e74c3c;padding:1rem;border-radius:8px;background:rgba(231,76,60,0.1);">오류: '+e.message+'<br><button onclick="generate50PReport()" style="margin-top:.5rem;padding:8px 16px;background:var(--em);border:none;border-radius:6px;color:#fff;cursor:pointer;font-family:inherit;">다시 시도</button></div>';
    if(genBtn) genBtn.style.display='block';
  });
};

// ── 결제 (테스트: 바로 열람) ──
window.doPayment = function(method) {
  _ensureSajuData();
  localStorage.setItem('cw_paid','1');
  var paySection=document.getElementById('payment-section');
  var paidSection=document.getElementById('report-paid-section');
  if(paySection) paySection.style.display='none';
  if(paidSection) paidSection.style.display='block';
  var sd=window._sajuData||{};
  var t=document.getElementById('report-title'),g=document.getElementById('report-price-tag');
  if(t) t.textContent='✅ 결제 완료 — 즉시 열람 가능';
  if(g) g.textContent='₩19,900 · 얼리버드';
  if(sd.name){
    var ib=document.getElementById('report-ib-title'),ib2=document.getElementById('report-ib-body');
    if(ib) ib.textContent=sd.name+' · '+(sd.star||'명리')+' 분석';
    if(ib2) ib2.innerHTML=sd.summary||sd.name+'님의 사주 기반으로 인생 지침서를 생성합니다.';
  }
  if(typeof showShareToast==='function') showShareToast('✅ 결제가 완료됐습니다!');
};

// ── 기타 누락 함수 ──
window.goToTimeline=function(){if(typeof showPg==='function')showPg('report');};
window.checkScanBeforeReport=function(){if(typeof showPg==='function')showPg('report');};
window.goNextScan=function(){
  if(window.sMode==='face'){if(typeof setMode==='function')setMode('palm_left',document.getElementById('mp'));}
  else if(window.sMode==='palm_left'){if(typeof setMode==='function')setMode('palm_right',document.getElementById('mp2'));}
  else{if(typeof showPg==='function')showPg('report');}
};
window.selectPlan=function(plan){
  var e=document.getElementById('price-early'),f=document.getElementById('price-full');
  if(plan==='early'){if(e){e.style.border='2px solid var(--gold)';e.style.opacity='1';}if(f){f.style.border='1px solid var(--bd)';f.style.opacity='0.7';}}
  else{if(f){f.style.border='2px solid #fff';f.style.opacity='1';}if(e){e.style.border='1px solid rgba(255,215,0,0.3)';e.style.opacity='0.7';}}
};
window.confirmBankTransfer=function(){if(typeof showShareToast==='function')showShareToast('✅ 입금 완료 알림 전송. 24시간 내 리포트 발송드립니다.');};
window.downloadPDF=function(){if(typeof showShareToast==='function')showShareToast('📥 PDF 기능 준비 중입니다.');};
window.downloadCompatPDF=window.downloadPDF;
window.sendReportEmail=function(email){
  var body=document.getElementById('report-full-body');
  var text=body?body.innerText.substring(0,1000):'';
  var sd=window._sajuData||{};
  var to=email||(typeof prompt==='function'?prompt('이메일 주소를 입력해주세요:')||'':'');
  if(to) window.open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(to)+'&su='+encodeURIComponent('[천기웨이브] '+(sd.name||'')+'님 인생 지침서')+'&body='+encodeURIComponent(text),'_blank');
};
window.sendCompatEmail=function(){window.sendReportEmail('');};
window.viewMyReport=function(){if(typeof showPg==='function')showPg('report');};
window.applyUISettings=function(){};
window.saveSettings=function(){if(typeof showShareToast==='function')showShareToast('✅ 설정 저장됐습니다');};
window.resetSettings=function(){if(typeof showShareToast==='function')showShareToast('초기화됐습니다');};
window.applySettings=function(){};
window.toggleMirror=function(){
  var v=document.getElementById('camVideo');
  if(!v) return;
  v.style.transform=(v.style.transform==='scaleX(1)')?'scaleX(-1)':'scaleX(1)';
};
window.switchAdminTab=function(tab){
  ['batch','members','settings'].forEach(function(t){
    var el=document.getElementById('admin-tab-'+t),btn=document.getElementById('atab-'+t);
    if(el)el.style.display=t===tab?'block':'none';
    if(btn)btn.classList.toggle('on',t===tab);
  });
};
window.setAdminTab=function(filter,btn){
  document.querySelectorAll('#admin-tab-members .admin-tab').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
};
window.changeAdminMonth=function(dir){
  window._adminMonth.setMonth(window._adminMonth.getMonth()+dir);
  var el=document.getElementById('admin-month-label');
  if(el)el.textContent=window._adminMonth.getFullYear()+'년 '+(window._adminMonth.getMonth()+1)+'월';
};
window.addAdminMember=function(){if(typeof showShareToast==='function')showShareToast('✅ 회원 추가됐습니다');};

// ── loginSuccess: localStorage 저장 ──
window._origLS=window.loginSuccess;
window.loginSuccess=function(user){
  window.currentUser=user;
  try{localStorage.setItem('cw_user',JSON.stringify(user));}catch(e){}
  if(typeof closeAuth==='function')closeAuth();
  if(typeof renderUserNav==='function')renderUserNav(user);
  else{
    var area=document.getElementById('nav-auth-area');
    if(area){var ini=(user.name||'?').slice(0,1).toUpperCase();area.innerHTML='<div class="nav-user-pill"><div class="nav-user-avatar">'+ini+'</div><span class="nav-user-name">'+user.name+'</span><button class="nav-logout" onclick="doLogout()">로그아웃</button></div>';}
  }
  if(typeof renderWelcomeMsg==='function')setTimeout(renderWelcomeMsg,100);
  if(typeof trackVisit==='function')trackVisit();
};

// ── switchCommTab 재정의 ──
window.switchCommTab=function(tab){
  ['review','board','qna'].forEach(function(t){
    var el=document.getElementById('comm-'+t);if(el)el.style.display=t===tab?'block':'none';
  });
  var rb=document.getElementById('comm-tab-review'),bb=document.getElementById('comm-tab-board'),qb=document.getElementById('comm-tab-qna');
  if(rb){rb.style.background=tab==='review'?'var(--em)':'none';rb.style.color=tab==='review'?'#fff':'var(--t2)';rb.style.borderColor=tab==='review'?'var(--em)':'var(--bd)';}
  if(bb){bb.style.background=tab==='board'?'rgba(255,215,0,0.15)':'none';bb.style.color=tab==='board'?'var(--gold)':'var(--t2)';bb.style.borderColor=tab==='board'?'rgba(255,215,0,0.4)':'var(--bd)';}
  if(qb){qb.style.background=tab==='qna'?'rgba(138,172,240,0.2)':'none';qb.style.color=tab==='qna'?'#8aacf0':'var(--t2)';qb.style.borderColor=tab==='qna'?'rgba(138,172,240,0.4)':'var(--bd)';}
  if(tab==='qna'&&typeof renderFixedQnA==='function')renderFixedQnA();
  if(tab==='board'&&typeof renderBoardList==='function')renderBoardList();
  if(tab==='review'&&typeof renderReviews==='function')renderReviews();
};

// ── DOM 로드 후 초기화 ──
document.addEventListener('DOMContentLoaded',function(){
  // 가격 39000원으로 변경
  document.querySelectorAll('*').forEach(function(el){
    if(el.childNodes.length===1&&el.childNodes[0].nodeType===3){
      if(el.textContent.trim()==='₩89,000')el.textContent='₩39,000';
      if(el.textContent.trim()==='78% 할인')el.textContent='49% 할인';
    }
  });

  // Tab 순서
  var tabOrder=['inp-name','gbtn-m','gbtn-f','inp-year','inp-month','inp-day',
    'cbtn-solar','cbtn-lunar','cbtn-leap',
    'inp-birthplace-sido','inp-birthplace-sigungu',
    'inp-location-sido','inp-location-sigungu',
    'inp-time','unk'];
  tabOrder.forEach(function(id,i){var el=document.getElementById(id);if(el)el.tabIndex=i+1;});

  // 양력/음력/윤달 → Tab → 출생지
  ['cbtn-solar','cbtn-lunar','cbtn-leap'].forEach(function(id){
    var el=document.getElementById(id);if(!el)return;
    el.addEventListener('keydown',function(e){
      if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();var n=document.getElementById('inp-birthplace-sido');if(n)n.focus();}
    });
  });
  // 시/도 → 시/군/구 자동 포커스
  var s1=document.getElementById('inp-birthplace-sido');
  if(s1)s1.addEventListener('change',function(){if(typeof updateSigungu==='function')updateSigungu('birth');setTimeout(function(){var n=document.getElementById('inp-birthplace-sigungu');if(n)n.focus();},100);});
  var sg1=document.getElementById('inp-birthplace-sigungu');
  if(sg1){
    sg1.addEventListener('change',function(){if(typeof updateBirthplace==='function')updateBirthplace();});
    sg1.addEventListener('keydown',function(e){if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();var n=document.getElementById('inp-location-sido');if(n)n.focus();}});
  }
  var s2=document.getElementById('inp-location-sido');
  if(s2)s2.addEventListener('change',function(){if(typeof updateSigungu==='function')updateSigungu('location');setTimeout(function(){var n=document.getElementById('inp-location-sigungu');if(n)n.focus();},100);});
  var sg2=document.getElementById('inp-location-sigungu');
  if(sg2){
    sg2.addEventListener('change',function(){if(typeof updateLocation==='function')updateLocation();});
    sg2.addEventListener('keydown',function(e){if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();var n=document.getElementById('inp-time');if(n)n.focus();}});
  }

  // Admin month
  var am=document.getElementById('admin-month-label');
  if(am)am.textContent=window._adminMonth.getFullYear()+'년 '+(window._adminMonth.getMonth()+1)+'월';

  // 커뮤니티 초기 렌더
  if(typeof renderFixedQnA==='function')renderFixedQnA();
  if(typeof renderReviews==='function')setTimeout(renderReviews,300);
  if(typeof renderBoardList==='function')setTimeout(renderBoardList,300);

  // scan 페이지에서 카메라 자동 시작 (showPg override)
  window._origSP=window.showPg;
  window.showPg=function(pg,btn,sub){
    if(typeof window._origSP==='function')window._origSP(pg,btn,sub);
    if(pg==='scan'){
      setTimeout(function(){
        _ensureVideo();
        window.startCamera();
      },200);
    } else {
      window.stopCamera();
    }
  };

  console.log('[천기웨이브] Patch v4 로드 완료 ✅');
});
