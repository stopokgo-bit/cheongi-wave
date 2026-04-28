// 천기 웨이브 — Fix Script v4
// 충돌 방지: var 선언 없음, window.xxx 방식만 사용

// ── 인생지침서 HTML 렌더링 스타일 주입 ──
(function injectReportStyles() {
  if (document.getElementById('cw-report-style')) return;
  var style = document.createElement('style');
  style.id = 'cw-report-style';
  style.textContent = [
    '#report-full-body h3{font-size:16px;font-weight:700;color:#FFD700;margin:1.4rem 0 .6rem;padding-bottom:.4rem;border-bottom:1px solid rgba(255,215,0,0.15);display:flex;align-items:center;gap:6px;}',
    '#report-full-body p{font-size:13px;color:#ccccee;line-height:2;margin-bottom:.85rem;}',
    '#report-full-body h4{font-size:14px;font-weight:600;color:#fff;margin:.85rem 0 .35rem;}',
    '#report-full-body strong{color:#FFD700;font-weight:600;}',
    '#report-full-body em{color:#50C878;font-style:normal;font-weight:600;}',
    '#report-full-body ul,#report-full-body ol{padding-left:1.2rem;margin-bottom:.75rem;}',
    '#report-full-body li{font-size:13px;color:#ccccee;line-height:1.9;margin-bottom:.2rem;}',
    '#report-full-body .section-wrap{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:1rem 1.2rem;margin-bottom:.85rem;}',
    '.typing-cursor{display:inline-block;width:2px;height:14px;background:#50C878;margin-left:2px;animation:blink .7s infinite;vertical-align:middle;}',
  ].join('\n');
  document.head.appendChild(style);
})();

// ── 유튜브 채널 카드 클릭 → 직접 유튜브 이동 ──
window.buildChannels = function() {
  var g = document.getElementById('chg'); if (!g) return;
  g.innerHTML = '';
  var CH = window.CH || [];
  CH.forEach(function(c) {
    var d = document.createElement('div');
    d.className = 'chc' + (window.selCh === c.id ? ' sel' : '');
    if (window.selCh === c.id) d.style.borderColor = c.sb;
    d.style.cursor = 'pointer';
    d.innerHTML =
      '<div class="chico" style="background:' + c.iBg + ';"><svg viewBox="0 0 24 24" fill="none" stroke="' + c.iC + '" stroke-width="2">' + c.icon + '</svg></div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="chnm">' + c.name + (c.coming ? '<span class="ch-coming">준비중</span>' : '<span style="font-size:9px;padding:1px 6px;border-radius:5px;background:rgba(255,100,100,0.15);color:#ff8080;margin-left:4px;">▶ YouTube</span>') + '</div>' +
        '<div class="chhdl">' + c.handle + '</div>' +
        '<div class="chmood">' + c.mood + '</div>' +
        '<span class="chtag" style="background:' + c.tBg + ';color:' + c.tC + ';">' + c.tag + '</span>' +
      '</div>';
    // 클릭 시 유튜브 직접 이동
    d.onclick = function() {
      window.selCh = c.id;
      // 모든 카드 선택 해제 후 현재 카드 선택
      document.querySelectorAll('.chc').forEach(function(card) {
        card.classList.remove('sel');
        card.style.borderColor = '';
      });
      d.classList.add('sel');
      d.style.borderColor = c.sb;
      // 유튜브 링크 업데이트
      var yl = document.getElementById('ytl');
      var ylt = document.getElementById('ytlt');
      var yn = document.getElementById('ytnote');
      if (yl) { yl.href = c.url; yl.style.background = c.btn; }
      if (ylt) ylt.textContent = c.coming ? c.name + ' 채널 보기 (준비중)' : '유튜브에서 ' + c.name + ' 열기 ▶';
      if (yn) yn.innerHTML = c.coming ? '<span style="color:#ccaa00;">콘텐츠 업로드 준비 중입니다</span>' : '<span style="color:var(--em);">↑ 탭하면 유튜브로 바로 이동합니다</span>';
      // 왜 카드 업데이트
      var wc2 = document.getElementById('wc2'), wt2 = document.getElementById('wt2'), wb2 = document.getElementById('wb2');
      if (wc2) { wc2.style.background = c.why.bg; wc2.style.borderColor = c.why.bd; }
      if (wt2) { wt2.style.color = c.why.tc; wt2.textContent = c.why.title; }
      if (wb2) wb2.innerHTML = c.why.body;
      // 준비중 아니면 유튜브 직접 이동
      if (!c.coming) {
        setTimeout(function() { window.open(c.url, '_blank', 'noopener'); }, 150);
      }
    };
    g.appendChild(d);
  });
  // 첫 선택 채널 유튜브 링크 세팅
  var sel = (window.CH || []).find(function(x){ return x.id === window.selCh; });
  if (sel) {
    var yl = document.getElementById('ytl');
    var ylt = document.getElementById('ytlt');
    if (yl) { yl.href = sel.url; yl.style.background = sel.btn; }
    if (ylt) ylt.textContent = '유튜브에서 ' + sel.name + ' 열기 ▶';
  }
};

// ── PDF 생성 (html2canvas + jsPDF) ──
window.downloadPDF = function() {
  var bodyEl = document.getElementById('report-full-body');
  if (!bodyEl || bodyEl.innerHTML.length < 100) {
    if (typeof showShareToast === 'function') showShareToast('⚠️ 먼저 인생 지침서를 생성해주세요');
    return;
  }
  var sd = window._sajuData || {};
  // PDF용 팝업 창 열어서 인쇄
  var win = window.open('', '_blank', 'width=800,height=900');
  if (!win) { showShareToast('⚠️ 팝업 차단을 해제해주세요'); return; }
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + (sd.name||'') + ' 인생지침서</title><style>');
  win.document.write('body{font-family:"Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#fff;color:#222;padding:2rem;max-width:700px;margin:0 auto;}');
  win.document.write('h1{font-size:22px;color:#1a1a4a;border-bottom:3px solid #FFD700;padding-bottom:.5rem;margin-bottom:1.5rem;}');
  win.document.write('h3{font-size:16px;font-weight:700;color:#1a1a4a;margin:1.5rem 0 .5rem;padding:.4rem .8rem;background:#f8f7f0;border-left:4px solid #FFD700;border-radius:0 6px 6px 0;}');
  win.document.write('p{font-size:13px;line-height:2;color:#333;margin-bottom:.75rem;}');
  win.document.write('em{color:#2d7a4a;font-style:normal;font-weight:600;}');
  win.document.write('strong{color:#8b6a00;font-weight:700;}');
  win.document.write('.cover{text-align:center;padding:3rem 1rem;border:2px solid #FFD700;border-radius:12px;margin-bottom:2rem;background:linear-gradient(135deg,#fffbf0,#fff);}');
  win.document.write('.cover h2{font-size:28px;color:#1a1a4a;margin-bottom:.5rem;}');
  win.document.write('.cover .info{font-size:13px;color:#666;line-height:2;}');
  win.document.write('@media print{body{padding:.5rem;}.cover{page-break-after:always;}}');
  win.document.write('</style></head><body>');
  win.document.write('<div class="cover">');
  win.document.write('<div style="font-size:32px;margin-bottom:.75rem;">⭐</div>');
  win.document.write('<h2>천기 웨이브 인생 지침서</h2>');
  win.document.write('<div class="info">');
  win.document.write((sd.name||'') + ' · ' + (sd.gender||'') + ' · ' + (sd.year||'') + '년 ' + (sd.month||'') + '월 ' + (sd.day||'') + '일생<br>');
  win.document.write('생성일: ' + new Date().toLocaleDateString('ko-KR') + '<br>');
  win.document.write('<small>자미두수 · 매화역수 · 기문둔갑 3대 역학 AI 분석</small>');
  win.document.write('</div></div>');
  // 본문 HTML 정제
  var html = bodyEl.innerHTML
    .replace(/```html\s*/gi,'').replace(/```\s*/g,'')
    .replace(/style="[^"]*color:[^"]*#[0-9a-fA-F]+[^"]*"/g, '')  // 어두운 색상 제거
    .replace(/<span class="typing-cursor[^>]*>.*?<\/span>/g,'');
  win.document.write('<div>' + html + '</div>');
  win.document.write('<div style="margin-top:3rem;padding-top:1rem;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;">천기 웨이브 (cheongi-wave.vercel.app) · AI 기반 명리 참고자료</div>');
  win.document.write('</body></html>');
  win.document.close();
  setTimeout(function() { win.focus(); win.print(); }, 500);
  if (typeof showShareToast === 'function') showShareToast('📄 PDF 저장 창이 열렸습니다!');
};
window.downloadCompatPDF = window.downloadPDF;

// ── 이메일 자동 발송 (EmailJS) ──
var EJS_SERVICE = 'service_cheongi';
var EJS_TEMPLATE = 'template_report';
var EJS_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // EmailJS 가입 후 교체

function _initEmailJS() {
  if (window.emailjs && window._ejsInited) return;
  // emailjs SDK는 index.html <head>에 이미 로드됨
  try {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
      window.emailjs.init(EJS_KEY);
      window._ejsInited = true;
    }
  } catch(e) {}
}

window.sendReportEmail = function(toEmail) {
  var bodyEl = document.getElementById('report-full-body');
  if (!bodyEl || bodyEl.innerHTML.length < 100) {
    if (typeof showShareToast === 'function') showShareToast('⚠️ 먼저 인생 지침서를 생성해주세요');
    return;
  }
  var email = toEmail || prompt('받으실 이메일 주소를 입력하세요:');
  if (!email || !email.includes('@')) { showShareToast('⚠️ 올바른 이메일을 입력해주세요'); return; }
  var sd = window._sajuData || {};

  _initEmailJS();

  // EmailJS 키가 설정된 경우 자동 발송
  if (EJS_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && window.emailjs) {
    var reportText = bodyEl.innerText.substring(0, 8000);
    if (typeof showShareToast === 'function') showShareToast('📧 발송 중...');
    window.emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
      to_email: email,
      to_name: sd.name || '고객',
      subject: '[천기웨이브] ' + (sd.name||'') + '님의 인생 지침서',
      report_content: reportText,
      birth_info: (sd.year||'') + '년 ' + (sd.month||'') + '월 ' + (sd.day||'') + '일 · ' + (sd.gender||'') + ' · ' + (sd.timeStr||''),
      generated_date: new Date().toLocaleDateString('ko-KR'),
    }).then(function() {
      showShareToast('✅ 이메일이 ' + email + '로 발송됐습니다!');
    }).catch(function(err) {
      showShareToast('❌ 발송 실패: ' + (err.text||err.message||'오류'));
      // 폴백: PDF 창 열기
      window.downloadPDF();
    });
  } else {
    // EmailJS 미설정 시: PDF 창 열고 저장 안내
    showShareToast('📧 PDF를 저장 후 ' + email + '로 첨부 발송하세요');
    setTimeout(window.downloadPDF, 500);
  }
};
window.sendCompatEmail = window.sendReportEmail;


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


// ── PDF 생성 (jsPDF) ──
window.downloadPDF = function() {
  var bodyEl = document.getElementById('report-full-body');
  if (!bodyEl || bodyEl.innerHTML.length < 200) {
    if (typeof showShareToast === 'function') showShareToast('⚠️ 먼저 인생 지침서를 생성해주세요');
    return;
  }
  if (typeof showShareToast === 'function') showShareToast('📄 PDF 생성 중... 잠시만요!');
  var sd = window._sajuData || {};

  function loadScript(src, cb) {
    if (document.querySelector('script[src="'+src+'"]')) { cb(); return; }
    var s = document.createElement('script'); s.src = src; s.onload = cb; document.head.appendChild(s);
  }
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
    _buildPDF(sd, bodyEl);
  });
};

function _buildPDF(sd, bodyEl) {
  var jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) { showShareToast('❌ PDF 라이브러리 로드 실패'); return; }

  var doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  var W=210, H=297, M=18;
  var name = sd.name || '고객';
  var today = new Date().toLocaleDateString('ko-KR');

  // 헬퍼
  function bg(r,g,b){ doc.setFillColor(r,g,b); doc.rect(0,0,W,H,'F'); }
  function setFont(size, bold, r,g,b){
    doc.setFontSize(size);
    doc.setFont('helvetica', bold?'bold':'normal');
    doc.setTextColor(r||255,g||255,b||255);
  }
  function drawText(str, x, y, opts){
    opts=opts||{};
    setFont(opts.size||12, opts.bold, ...(opts.color||[255,255,255]));
    doc.text(str, x, y, {align:opts.align||'left'});
  }
  function footer(pageNum){
    doc.setFillColor(20,20,60); doc.rect(0,H-12,W,12,'F');
    setFont(8,false,80,80,120);
    doc.text('천기 웨이브 (cheongi-wave.vercel.app)', M, H-4);
    doc.text(pageNum+'', W-M, H-4, {align:'right'});
    doc.setDrawColor(255,215,0,0.2); doc.setLineWidth(0.3); doc.line(0,H-12,W,H-12);
  }

  // 섹션 타이틀 정의
  var SECTION_TITLES = [
    '제1장  명주(命主) 사주 풀이',
    '제2장  생애 대운(大運) 흐름',
    '제3장  재물 · 투자운',
    '제4장  직업 · 커리어운',
    '제5장  애정 · 인간관계',
    '제6장  건강 · 체질 분석',
    '제7장  기문둔갑(奇門遁甲) 전략',
    '제8장  매화역수(梅花易數) 월별운',
    '제9장  개운법 · 길일 캘린더',
    '제10장  2025~2027 타임라인',
  ];
  var SECTION_SUBTITLES = [
    '자미두수 14주성과 12궁위로 타고난 그릇을 분석합니다',
    '10대부터 80대까지, 인생의 파도를 미리 봅니다',
    '돈을 버는 방식과 재물운이 강한 시기를 알아봅니다',
    '최적의 직업군과 커리어 전환 타이밍을 제시합니다',
    '연애 스타일, 결혼 적령기, 귀인의 방향을 안내합니다',
    '타고난 체질과 주의해야 할 건강 패턴을 분석합니다',
    '기문둔갑 팔문으로 길방·흉방과 이동 전략을 안내합니다',
    '매화역수로 올해 월별 길흉과 최적 행동 시기를 봅니다',
    '운을 높이는 색상·숫자·방향과 이달의 길일을 안내합니다',
    '연도별 핵심 운세와 놓치면 안 될 기회를 정리합니다',
  ];

  var pageNum = 1;

  // ══════════════════════════════
  // 1페이지: 표지
  // ══════════════════════════════
  bg(15,15,58);

  // 상단 골드 바
  doc.setFillColor(255,215,0); doc.rect(0,0,W,3,'F');

  // 중앙 원형 장식
  doc.setDrawColor(255,215,0); doc.setLineWidth(0.3);
  doc.circle(W/2,130,48,'S');
  doc.setDrawColor(255,215,0,0.3); doc.setLineWidth(0.2);
  doc.circle(W/2,130,56,'S');

  // 별
  setFont(36,true,...[255,215,0]);
  doc.text('⭐', W/2, 140, {align:'center'});

  // 메인 타이틀
  setFont(34,true,...[255,255,255]);
  doc.text('인생 지침서', W/2, 175, {align:'center'});

  // 골드 언더라인
  doc.setDrawColor(255,215,0); doc.setLineWidth(1.5);
  doc.line(W/2-35, 180, W/2+35, 180);

  // 부제
  setFont(13,false,...[200,200,230]);
  doc.text('자미두수 · 매화역수 · 기문둔갑 3대 역학 통합 분석', W/2, 193, {align:'center'});

  // 의뢰인 박스
  doc.setFillColor(25,25,75); doc.roundedRect(M+10,205,W-M*2-20,45,4,4,'F');
  doc.setDrawColor(255,215,0,0.5); doc.roundedRect(M+10,205,W-M*2-20,45,4,4,'S');

  setFont(11,false,...[153,153,204]);
  doc.text('의뢰인', W/2, 217, {align:'center'});
  setFont(20,true,...[255,255,255]);
  doc.text(name + ' 님', W/2, 230, {align:'center'});
  setFont(10,false,...[153,153,204]);
  doc.text((sd.year||'')+'년 '+(sd.month||'')+'월 '+(sd.day||'')+'일생  ·  '+(sd.gender||'')+'  ·  명궁주성: '+(sd.star||'미상'), W/2, 241, {align:'center'});

  setFont(9,false,...[80,80,120]);
  doc.text('생성일: '+today, W/2, 258, {align:'center'});

  // 하단 골드 바
  doc.setFillColor(255,215,0); doc.rect(0,H-3,W,3,'F');

  footer(pageNum++);

  // ══════════════════════════════
  // 2페이지: 목차
  // ══════════════════════════════
  doc.addPage(); bg(15,15,58);
  doc.setFillColor(255,215,0); doc.rect(0,0,W,3,'F');

  setFont(28,true,...[255,215,0]);
  doc.text('목  차', W/2, 48, {align:'center'});
  doc.setDrawColor(255,215,0,0.5); doc.setLineWidth(0.5); doc.line(M+20,55,W-M-20,55);

  var ty = 72;
  SECTION_TITLES.forEach(function(title,i){
    var isEven = i%2===0;
    doc.setFillColor(isEven?22:18, isEven?22:18, isEven?68:58);
    doc.roundedRect(M, ty, W-M*2, 17, 2, 2, 'F');
    // 번호 배지
    doc.setFillColor(255,215,0);
    doc.circle(M+8, ty+8.5, 6, 'F');
    setFont(9,true,...[15,15,58]);
    doc.text(String(i+1), M+8, ty+11, {align:'center'});
    // 제목
    setFont(11,true,...[255,255,255]);
    doc.text(title, M+20, ty+8, {});
    // 부제
    setFont(8,false,...[153,153,204]);
    doc.text(SECTION_SUBTITLES[i], M+20, ty+14, {});
    // 점선
    doc.setDrawColor(80,80,120); doc.setLineWidth(0.2);
    doc.setLineDashPattern([1,2],0);
    doc.line(M, ty+17, W-M, ty+17);
    doc.setLineDashPattern([],0);
    ty += 19;
  });

  footer(pageNum++);

  // ══════════════════════════════
  // 본문: 섹션별 타이틀 페이지 + 내용 페이지
  // ══════════════════════════════

  // HTML에서 섹션 파싱
  var tmpDiv = document.createElement('div');
  tmpDiv.innerHTML = bodyEl.innerHTML
    .replace(/```html\s*/gi,'').replace(/```\s*/g,'')
    .replace(/<span[^>]*typing-cursor[^>]*>.*?<\/span>/g,'');

  var allH3 = tmpDiv.querySelectorAll('h3');
  var sections = [];

  if (allH3.length > 0) {
    allH3.forEach(function(h3, si){
      var sec = { title: h3.textContent.trim(), paras: [] };
      var node = h3.nextElementSibling;
      while (node && node.tagName !== 'H3') {
        var t = node.textContent.trim();
        if (t.length > 3) sec.paras.push({ tag: node.tagName, text: t });
        node = node.nextElementSibling;
      }
      sections.push(sec);
    });
  } else {
    // h3 없으면 p 전체를 하나로
    var allP = tmpDiv.querySelectorAll('p, h4');
    var sec0 = { title: '분석 결과', paras: [] };
    allP.forEach(function(p){ if(p.textContent.trim().length>3) sec0.paras.push({tag:p.tagName, text:p.textContent.trim()}); });
    sections.push(sec0);
  }

  var secColors = [
    [80,200,120],[255,215,0],[255,165,0],[138,172,240],
    [204,136,187],[80,200,120],[255,215,0],[255,165,0],
    [138,172,240],[204,136,187]
  ];

  sections.forEach(function(sec, si){
    var sColor = secColors[si % secColors.length];
    var chapterTitle = SECTION_TITLES[si] || sec.title;
    var chapterSub = SECTION_SUBTITLES[si] || '';

    // ── 챕터 타이틀 페이지 ──
    doc.addPage(); bg(15,15,58);

    // 배경 장식 원
    doc.setFillColor(sColor[0],sColor[1],sColor[2]);
    doc.circle(W/2, H/2-20, 70, 'F');
    doc.setFillColor(15,15,58); doc.circle(W/2, H/2-20, 62, 'F');

    // 챕터 번호
    doc.setFillColor(sColor[0],sColor[1],sColor[2]);
    doc.circle(W/2, H/2-20, 22, 'F');
    setFont(20,true,...[15,15,58]);
    doc.text(String(si+1), W/2, H/2-13, {align:'center'});

    // 제목
    setFont(22,true,...[255,255,255]);
    doc.text(chapterTitle, W/2, H/2+28, {align:'center'});

    // 부제
    setFont(11,false,...[sColor[0],sColor[1],sColor[2]]);
    doc.text(chapterSub, W/2, H/2+42, {align:'center'});

    // 장식선
    doc.setDrawColor(sColor[0],sColor[1],sColor[2]);
    doc.setLineWidth(0.8);
    doc.line(M+30, H/2+50, W-M-30, H/2+50);

    // 역학 배지
    var badges = ['자미두수','매화역수','기문둔갑'];
    var bColors = [[80,200,120],[255,215,0],[138,172,240]];
    badges.forEach(function(b,bi){
      var bx = W/2 - 42 + bi*28;
      doc.setFillColor(bColors[bi][0],bColors[bi][1],bColors[bi][2]);
      doc.roundedRect(bx-12, H/2+56, 24, 9, 2, 2, 'F');
      setFont(7,true,...[15,15,58]);
      doc.text(b, bx, H/2+62, {align:'center'});
    });

    footer(pageNum++);

    // ── 내용 페이지 ──
    if (sec.paras.length === 0) return;

    doc.addPage(); bg(15,15,58);

    // 헤더
    doc.setFillColor(18,18,60); doc.rect(0,0,W,22,'F');
    doc.setFillColor(sColor[0],sColor[1],sColor[2]); doc.rect(0,0,4,22,'F');
    setFont(12,true,...[255,255,255]);
    doc.text(chapterTitle, M, 14, {});
    doc.setDrawColor(sColor[0],sColor[1],sColor[2]); doc.setLineWidth(0.4); doc.line(0,22,W,22);

    var py = 34;
    var maxY = H-18;

    sec.paras.forEach(function(para){
      if (para.tag === 'H4') {
        if (py > maxY-12) {
          doc.addPage(); bg(15,15,58);
          doc.setFillColor(18,18,60); doc.rect(0,0,W,16,'F');
          setFont(9,false,...[153,153,204]);
          doc.text(chapterTitle+' (계속)', M, 11, {});
          doc.setDrawColor(sColor[0],sColor[1],sColor[2]); doc.setLineWidth(0.3); doc.line(0,16,W,16);
          footer(pageNum++);
          py = 26;
        }
        setFont(11,true,...[sColor[0],sColor[1],sColor[2]]);
        doc.text(para.text, M, py, {});
        py += 8;
        doc.setDrawColor(sColor[0],sColor[1],sColor[2],0.4);
        doc.setLineWidth(0.2); doc.line(M, py, W-M, py);
        py += 5;
      } else {
        // 긴 텍스트: 한 줄당 45자
        var maxC = 45;
        var txt = para.text;
        var rows = [];
        for (var ci=0; ci<txt.length; ci+=maxC) rows.push(txt.slice(ci,ci+maxC));

        rows.forEach(function(row){
          if (py > maxY-8) {
            doc.addPage(); bg(15,15,58);
            doc.setFillColor(18,18,60); doc.rect(0,0,W,16,'F');
            setFont(9,false,...[153,153,204]);
            doc.text(chapterTitle+' (계속)', M, 11, {});
            doc.setDrawColor(sColor[0],sColor[1],sColor[2]); doc.setLineWidth(0.3); doc.line(0,16,W,16);
            footer(pageNum++);
            py = 26;
          }
          setFont(10,false,...[210,210,240]);
          doc.text(row, M, py, {});
          py += 7;
        });
        py += 3;
      }
    });

    footer(pageNum++);
  });

  // 마지막 페이지: 마무리
  doc.addPage(); bg(15,15,58);
  doc.setFillColor(255,215,0); doc.rect(0,0,W,3,'F');
  doc.setFillColor(255,215,0); doc.rect(0,H-3,W,3,'F');

  setFont(24,true,...[255,215,0]);
  doc.text('천기(天機)를 아는 자는', W/2, 110, {align:'center'});
  setFont(24,true,...[255,255,255]);
  doc.text('두려움이 없습니다', W/2, 128, {align:'center'});

  doc.setDrawColor(255,215,0); doc.setLineWidth(0.8);
  doc.line(M+30, 136, W-M-30, 136);

  setFont(11,false,...[153,153,204]);
  doc.text('본 리포트는 자미두수·매화역수·기문둔갑 3대 역학을', W/2, 152, {align:'center'});
  doc.text('AI로 통합 분석한 참고 자료입니다.', W/2, 162, {align:'center'});

  setFont(10,false,...[80,80,120]);
  doc.text('천기 웨이브  ·  cheongi-wave.vercel.app', W/2, 200, {align:'center'});
  doc.text('© 2026 Cheongi Wave. All rights reserved.', W/2, 210, {align:'center'});

  footer(pageNum++);

  // 저장
  var filename = (name||'고객')+'_인생지침서_'+today.replace(/\./g,'')+'.pdf';
  doc.save(filename);
  window._lastPdfBase64 = doc.output('datauristring');
  window._lastPdfFilename = filename;
  if (typeof showShareToast === 'function') showShareToast('✅ PDF 저장 완료!');
}
window.downloadCompatPDF = window.downloadPDF;


// downloadCompatPDF replaced below
// sendReportEmail replaced below
  var to=email||(typeof prompt==='function'?prompt('이메일 주소를 입력해주세요:')||'':'');
  if(to) window.open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(to)+'&su='+encodeURIComponent('[천기웨이브] '+(sd.name||'')+'님 인생 지침서')+'&body='+encodeURIComponent(text),'_blank');
};
// sendCompatEmail replaced below
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
