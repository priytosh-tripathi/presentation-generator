/* ============================================================
   themes.js — 5 complete theme definitions
   Each theme: name, css, navHTML, navCSS, navJS, transitionCSS,
   fonts, colors: { bg, text, accent, secondary }
   ============================================================ */

window.THEMES = {

  /* ──────────────────────────────────────────
     FORMAL — Hidden bottom bar
     ────────────────────────────────────────── */
  formal: {
    name: 'Formal',
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
      import: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;500;600&display=swap"
    },
    colors: { bg: '#1a1a2e', text: '#f0ede6', accent: '#d4af37', secondary: '#2a2a4a' },
    css: `
      body { background: VAR_BG; color: VAR_TEXT; font-family: 'Lora', Georgia, serif; }
      .slide { display:none; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding:6vh 8vw; text-align:center; }
      .slide.active { display:flex; }
      .slide h1, .slide h2 { font-family:'Playfair Display',serif; font-weight:700; }
      .slide h1 { font-size:3.2rem; margin-bottom:.5em; color:VAR_ACCENT; }
      .slide h2 { font-size:2rem; margin-bottom:.6em; color:VAR_TEXT; }
      .slide p { font-size:1.15rem; line-height:1.7; max-width:750px; margin:0 auto .8em; opacity:.88; }
      .slide ul { list-style:none; padding:0; text-align:left; max-width:700px; margin:0 auto; }
      .slide ul li { padding:.5em 0; border-bottom:1px solid rgba(212,175,55,.15); font-size:1.05rem; }
      .slide ul li::before { content:'—'; color:VAR_ACCENT; margin-right:.6em; }
      .slide.type-title h1 { font-size:4rem; }
      .slide.type-title p { font-size:1.3rem; font-style:italic; opacity:.7; }
      .slide.type-quote { padding:10vh 10vw; }
      .slide.type-quote p { font-size:1.8rem; font-style:italic; line-height:1.6; }
      .slide.type-quote h2 { font-size:1rem; margin-top:1em; opacity:.6; font-weight:400; }
      .slide.type-two-column .columns { display:flex; gap:4vw; text-align:left; max-width:900px; margin:0 auto; }
      .slide.type-two-column .col { flex:1; }
      .slide.type-image-placeholder .img-box { width:400px; height:250px; border:2px dashed VAR_ACCENT; border-radius:12px; display:flex; align-items:center; justify-content:center; color:VAR_ACCENT; opacity:.5; margin:1em auto; }
    `,
    navCSS: `
      .nav-bar { position:fixed; bottom:0; left:0; right:0; height:4px; background:rgba(212,175,55,.15); opacity:0; transition:opacity .4s; z-index:100; }
      .nav-bar:hover, .nav-bar.show { opacity:1; height:48px; display:flex; align-items:center; justify-content:center; gap:1rem; background:rgba(26,26,46,.95); backdrop-filter:blur(12px); border-top:1px solid rgba(212,175,55,.2); }
      .nav-bar button { background:none; border:none; color:VAR_ACCENT; font-size:1.2rem; cursor:pointer; padding:.4rem .8rem; opacity:.7; transition:opacity .2s; }
      .nav-bar button:hover { opacity:1; }
      .nav-bar .slide-counter { color:VAR_TEXT; font-size:.85rem; opacity:.5; font-family:'Lora',serif; }
      .nav-bar .idx-btn { font-size:.85rem; }
      .slide-index-panel { position:fixed; bottom:52px; left:50%; transform:translateX(-50%); background:rgba(26,26,46,.97); backdrop-filter:blur(16px); border:1px solid rgba(212,175,55,.2); border-radius:12px; padding:1rem; max-height:50vh; overflow-y:auto; display:none; z-index:101; min-width:280px; }
      .slide-index-panel.open { display:block; }
      .slide-index-panel a { display:block; padding:.4rem .8rem; color:VAR_TEXT; text-decoration:none; font-size:.85rem; border-radius:6px; margin-bottom:2px; opacity:.6; }
      .slide-index-panel a:hover, .slide-index-panel a.active { opacity:1; background:rgba(212,175,55,.15); }
    `,
    navHTML: `
      <div class="nav-bar" id="navBar">
        <button onclick="prevSlide()">‹</button>
        <span class="slide-counter" id="slideCounter"></span>
        <button onclick="nextSlide()">›</button>
        <button class="idx-btn" onclick="toggleIndex()">☰</button>
      </div>
      <div class="slide-index-panel" id="indexPanel"></div>
    `,
    navJS: `
      document.querySelector('.nav-bar').addEventListener('mouseenter', function(){ this.classList.add('show'); });
      document.querySelector('.nav-bar').addEventListener('mouseleave', function(){ this.classList.remove('show'); });
    `,
    transitionCSS: {
      fade: '.slide { animation: fadeIn .5s ease; } @keyframes fadeIn { from{opacity:0} to{opacity:1} }',
      slide: '.slide { animation: slideIn .5s ease; } @keyframes slideIn { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }',
      zoom: '.slide { animation: zoomIn .5s ease; } @keyframes zoomIn { from{transform:scale(.92);opacity:0} to{transform:scale(1);opacity:1} }',
      flip: '.slide { animation: flipIn .6s ease; } @keyframes flipIn { from{transform:rotateY(15deg);opacity:0} to{transform:rotateY(0);opacity:1} }'
    }
  },

  /* ──────────────────────────────────────────
     PROFESSIONAL — Fixed bottom toolbar
     ────────────────────────────────────────── */
  professional: {
    name: 'Professional',
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      import: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    },
    colors: { bg: '#f8f9fa', text: '#1e293b', accent: '#2563eb', secondary: '#e2e8f0' },
    css: `
      body { background:VAR_BG; color:VAR_TEXT; font-family:'Inter',system-ui,sans-serif; }
      .slide { display:none; flex-direction:column; justify-content:center; align-items:flex-start; min-height:100vh; padding:6vh 8vw 10vh; }
      .slide.active { display:flex; }
      .slide h1 { font-size:2.8rem; font-weight:700; margin-bottom:.4em; color:VAR_TEXT; }
      .slide h2 { font-size:1.8rem; font-weight:600; margin-bottom:.6em; color:VAR_TEXT; }
      .slide p { font-size:1.1rem; line-height:1.7; max-width:800px; margin-bottom:.8em; opacity:.78; }
      .slide ul { padding-left:1.2em; max-width:750px; }
      .slide ul li { padding:.4em 0; font-size:1.05rem; line-height:1.5; }
      .slide ul li::marker { color:VAR_ACCENT; }
      .slide.type-title { align-items:center; text-align:center; }
      .slide.type-title h1 { font-size:3.5rem; }
      .slide.type-title p { font-size:1.25rem; opacity:.6; }
      .slide.type-title::after { content:''; display:block; width:80px; height:4px; background:VAR_ACCENT; border-radius:2px; margin-top:1.5em; }
      .slide.type-quote { align-items:center; text-align:center; }
      .slide.type-quote p { font-size:1.6rem; font-weight:500; line-height:1.6; max-width:700px; }
      .slide.type-quote h2 { font-size:.95rem; font-weight:400; opacity:.5; margin-top:.5em; }
      .slide.type-two-column .columns { display:flex; gap:4vw; width:100%; max-width:1000px; }
      .slide.type-two-column .col { flex:1; }
      .slide.type-image-placeholder .img-box { width:100%; max-width:500px; height:250px; border:2px dashed VAR_ACCENT; border-radius:12px; display:flex; align-items:center; justify-content:center; color:VAR_ACCENT; opacity:.4; margin:1em 0; font-size:.9rem; }
    `,
    navCSS: `
      .nav-toolbar { position:fixed; bottom:0; left:0; right:0; height:54px; background:rgba(255,255,255,.92); backdrop-filter:blur(12px); border-top:1px solid rgba(0,0,0,.08); display:flex; align-items:center; justify-content:center; gap:1rem; z-index:100; padding:0 2rem; }
      .nav-toolbar button { background:none; border:none; color:VAR_TEXT; font-size:1.1rem; cursor:pointer; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:background .2s; }
      .nav-toolbar button:hover { background:rgba(0,0,0,.06); }
      .nav-dots { display:flex; gap:6px; align-items:center; }
      .nav-dot { width:8px; height:8px; border-radius:50%; background:rgba(0,0,0,.15); cursor:pointer; transition:all .2s; border:none; padding:0; }
      .nav-dot.active { background:VAR_ACCENT; transform:scale(1.3); }
      .nav-toolbar .counter { font-size:.82rem; color:VAR_TEXT; opacity:.4; min-width:50px; text-align:center; }
      .nav-toolbar .idx-btn { font-size:.9rem; margin-left:auto; }
      .slide-index-panel { position:fixed; bottom:58px; right:2rem; background:rgba(255,255,255,.97); backdrop-filter:blur(16px); border:1px solid rgba(0,0,0,.08); border-radius:12px; padding:1rem; max-height:50vh; overflow-y:auto; display:none; z-index:101; min-width:280px; box-shadow:0 8px 32px rgba(0,0,0,.12); }
      .slide-index-panel.open { display:block; }
      .slide-index-panel a { display:block; padding:.5rem .8rem; color:VAR_TEXT; text-decoration:none; font-size:.85rem; border-radius:8px; margin-bottom:2px; opacity:.6; }
      .slide-index-panel a:hover, .slide-index-panel a.active { opacity:1; background:rgba(37,99,235,.08); }
    `,
    navHTML: `
      <div class="nav-toolbar" id="navBar">
        <button onclick="prevSlide()">←</button>
        <div class="nav-dots" id="navDots"></div>
        <button onclick="nextSlide()">→</button>
        <span class="counter" id="slideCounter"></span>
        <button class="idx-btn" onclick="toggleIndex()">☰</button>
      </div>
      <div class="slide-index-panel" id="indexPanel"></div>
    `,
    navJS: `
      function renderDots(){
        var d=document.getElementById('navDots');if(!d)return;
        d.innerHTML='';
        for(var i=0;i<totalSlides;i++){
          var b=document.createElement('button');
          b.className='nav-dot'+(i===current?' active':'');
          b.onclick=(function(x){return function(){goToSlide(x)}})(i);
          d.appendChild(b);
        }
      }
    `,
    transitionCSS: {
      fade: '.slide { animation: fadeIn .4s ease; } @keyframes fadeIn { from{opacity:0} to{opacity:1} }',
      slide: '.slide { animation: slideIn .4s ease; } @keyframes slideIn { from{transform:translateX(50px);opacity:0} to{transform:translateX(0);opacity:1} }',
      zoom: '.slide { animation: zoomIn .4s ease; } @keyframes zoomIn { from{transform:scale(.94);opacity:0} to{transform:scale(1);opacity:1} }',
      flip: '.slide { animation: flipIn .5s ease; } @keyframes flipIn { from{transform:rotateY(12deg);opacity:0} to{transform:rotateY(0);opacity:1} }'
    }
  },

  /* ──────────────────────────────────────────
     FUN — Floating pill nav
     ────────────────────────────────────────── */
  fun: {
    name: 'Fun',
    fonts: {
      heading: 'Nunito',
      body: 'Quicksand',
      import: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&family=Quicksand:wght@400;500;600&display=swap"
    },
    colors: { bg: '#fef9f0', text: '#2d2d2d', accent: '#ff6b6b', secondary: '#ffecd2' },
    css: `
      body { background:VAR_BG; color:VAR_TEXT; font-family:'Quicksand',sans-serif; }
      .slide { display:none; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; padding:6vh 8vw; text-align:center; }
      .slide.active { display:flex; }
      .slide h1, .slide h2 { font-family:'Nunito',sans-serif; font-weight:800; }
      .slide h1 { font-size:3.2rem; margin-bottom:.4em; background:linear-gradient(135deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      .slide h2 { font-size:2rem; margin-bottom:.5em; color:VAR_TEXT; }
      .slide p { font-size:1.1rem; line-height:1.7; max-width:700px; margin-bottom:.8em; }
      .slide ul { list-style:none; padding:0; text-align:left; max-width:650px; margin:0 auto; }
      .slide ul li { padding:.6em 0; font-size:1.05rem; position:relative; padding-left:2em; }
      .slide ul li::before { content:'✦'; position:absolute; left:0; color:VAR_ACCENT; font-size:1.1rem; }
      .slide.type-title h1 { font-size:4rem; }
      .slide.type-title p { font-size:1.3rem; opacity:.6; }
      .slide.type-quote p { font-size:1.7rem; font-weight:600; line-height:1.5; }
      .slide.type-quote p::before { content:'🎯 '; }
      .slide.type-quote h2 { font-size:.95rem; font-weight:400; opacity:.5; }
      .slide.type-two-column .columns { display:flex; gap:3vw; text-align:left; max-width:900px; margin:0 auto; }
      .slide.type-two-column .col { flex:1; background:rgba(255,107,107,.06); border-radius:16px; padding:1.5rem; }
      .slide.type-image-placeholder .img-box { width:350px; height:250px; border:3px dashed VAR_ACCENT; border-radius:20px; display:flex; align-items:center; justify-content:center; color:VAR_ACCENT; opacity:.5; margin:1em auto; font-size:.9rem; }
    `,
    navCSS: `
      .nav-pill { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,.9); backdrop-filter:blur(16px); border-radius:40px; padding:8px 16px; display:flex; align-items:center; gap:10px; z-index:100; box-shadow:0 8px 32px rgba(0,0,0,.1); border:1px solid rgba(0,0,0,.06); }
      .nav-pill button { background:none; border:none; font-size:1.3rem; cursor:pointer; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all .25s cubic-bezier(.4,0,.2,1); }
      .nav-pill button:hover { background:rgba(255,107,107,.12); transform:scale(1.15); }
      .nav-pill button:active { transform:scale(.95); }
      .nav-pill .counter { font-size:.85rem; font-weight:600; color:VAR_TEXT; min-width:40px; text-align:center; }
      .nav-pill .idx-btn { font-size:1rem; }
      .slide-index-panel { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:rgba(255,255,255,.97); backdrop-filter:blur(16px); border:1px solid rgba(0,0,0,.06); border-radius:20px; padding:1rem; max-height:50vh; overflow-y:auto; display:none; z-index:101; min-width:280px; box-shadow:0 12px 40px rgba(0,0,0,.12); }
      .slide-index-panel.open { display:block; }
      .slide-index-panel a { display:block; padding:.5rem .8rem; color:VAR_TEXT; text-decoration:none; font-size:.85rem; border-radius:10px; margin-bottom:2px; opacity:.6; }
      .slide-index-panel a:hover, .slide-index-panel a.active { opacity:1; background:rgba(255,107,107,.1); }
    `,
    navHTML: `
      <div class="nav-pill" id="navBar">
        <button onclick="prevSlide()">👈</button>
        <span class="counter" id="slideCounter"></span>
        <button onclick="nextSlide()">👉</button>
        <button class="idx-btn" onclick="toggleIndex()">📋</button>
      </div>
      <div class="slide-index-panel" id="indexPanel"></div>
    `,
    navJS: '',
    transitionCSS: {
      fade: '.slide { animation: fadeIn .5s ease; } @keyframes fadeIn { from{opacity:0} to{opacity:1} }',
      slide: '.slide { animation: bounceIn .6s cubic-bezier(.4,0,.2,1); } @keyframes bounceIn { 0%{transform:translateY(40px);opacity:0} 60%{transform:translateY(-8px)} 100%{transform:translateY(0);opacity:1} }',
      zoom: '.slide { animation: popIn .5s cubic-bezier(.4,0,.2,1); } @keyframes popIn { 0%{transform:scale(.8);opacity:0} 70%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }',
      flip: '.slide { animation: flipIn .6s ease; } @keyframes flipIn { from{transform:rotateX(20deg);opacity:0} to{transform:rotateX(0);opacity:1} }'
    }
  },

  /* ──────────────────────────────────────────
     CREATIVE — Side rail
     ────────────────────────────────────────── */
  creative: {
    name: 'Creative',
    fonts: {
      heading: 'Space Grotesk',
      body: 'DM Sans',
      import: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500;600&display=swap"
    },
    colors: { bg: '#1a1a2e', text: '#f0f0f0', accent: '#ff6b6b', secondary: '#4ecdc4' },
    css: `
      body { background:VAR_BG; color:VAR_TEXT; font-family:'DM Sans',sans-serif; }
      .slide { display:none; flex-direction:column; justify-content:center; min-height:100vh; padding:6vh 8vw 6vh 6vw; }
      .slide.active { display:flex; }
      .slide h1, .slide h2 { font-family:'Space Grotesk',sans-serif; font-weight:700; }
      .slide h1 { font-size:3rem; margin-bottom:.4em; }
      .slide h2 { font-size:1.8rem; margin-bottom:.6em; }
      .slide p { font-size:1.1rem; line-height:1.7; max-width:750px; margin-bottom:.8em; opacity:.8; }
      .slide ul { list-style:none; padding:0; max-width:700px; }
      .slide ul li { padding:.6em 0; font-size:1.05rem; border-left:3px solid VAR_SECONDARY; padding-left:1em; margin-bottom:.4em; }
      .slide.type-title { align-items:center; text-align:center; }
      .slide.type-title h1 { font-size:4rem; background:linear-gradient(135deg,VAR_ACCENT,VAR_SECONDARY); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      .slide.type-title p { font-size:1.2rem; opacity:.6; }
      .slide.type-quote { align-items:center; text-align:center; }
      .slide.type-quote p { font-size:1.6rem; font-weight:500; line-height:1.6; max-width:650px; border-left:4px solid VAR_ACCENT; padding-left:1.5rem; text-align:left; }
      .slide.type-quote h2 { font-size:.9rem; opacity:.5; font-weight:400; }
      .slide.type-two-column .columns { display:flex; gap:3vw; width:100%; max-width:950px; }
      .slide.type-two-column .col { flex:1; }
      .slide.type-image-placeholder .img-box { width:100%; max-width:450px; height:260px; border:2px dashed VAR_SECONDARY; border-radius:16px; display:flex; align-items:center; justify-content:center; color:VAR_SECONDARY; opacity:.5; margin:1em 0; }
    `,
    navCSS: `
      .nav-rail { position:fixed; right:24px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; align-items:center; gap:0; z-index:100; }
      .nav-rail .rail-line { width:2px; height:20px; background:rgba(255,255,255,.1); }
      .nav-rail .rail-dot { width:12px; height:12px; border-radius:50%; background:rgba(255,255,255,.15); cursor:pointer; transition:all .25s; border:none; padding:0; position:relative; }
      .nav-rail .rail-dot:hover { background:rgba(255,255,255,.4); }
      .nav-rail .rail-dot.active { background:VAR_ACCENT; box-shadow:0 0 12px VAR_ACCENT; transform:scale(1.4); }
      .nav-rail .rail-dot .tooltip { position:absolute; right:24px; top:50%; transform:translateY(-50%); background:rgba(26,26,46,.95); padding:.3rem .7rem; border-radius:6px; font-size:.75rem; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity .2s; color:VAR_TEXT; }
      .nav-rail .rail-dot:hover .tooltip { opacity:1; }
      .nav-rail .counter { font-size:.7rem; opacity:.4; margin-top:12px; color:VAR_TEXT; }
      .nav-rail .idx-btn { background:none; border:none; color:VAR_TEXT; font-size:.85rem; cursor:pointer; margin-top:8px; opacity:.5; }
      .nav-rail .idx-btn:hover { opacity:1; }
      .slide-index-panel { position:fixed; right:60px; top:50%; transform:translateY(-50%); background:rgba(26,26,46,.97); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:1rem; max-height:60vh; overflow-y:auto; display:none; z-index:101; min-width:260px; }
      .slide-index-panel.open { display:block; }
      .slide-index-panel a { display:block; padding:.45rem .8rem; color:VAR_TEXT; text-decoration:none; font-size:.82rem; border-radius:8px; margin-bottom:2px; opacity:.5; }
      .slide-index-panel a:hover, .slide-index-panel a.active { opacity:1; background:rgba(255,107,107,.12); }
    `,
    navHTML: `
      <div class="nav-rail" id="navBar"></div>
      <div class="slide-index-panel" id="indexPanel"></div>
    `,
    navJS: `
      function renderRail(){
        var r=document.getElementById('navBar');if(!r)return;
        r.innerHTML='';
        for(var i=0;i<totalSlides;i++){
          if(i>0){var l=document.createElement('div');l.className='rail-line';r.appendChild(l);}
          var d=document.createElement('button');d.className='rail-dot'+(i===current?' active':'');
          var t=document.createElement('span');t.className='tooltip';t.textContent=slideTitles[i]||('Slide '+(i+1));
          d.appendChild(t);
          d.onclick=(function(x){return function(){goToSlide(x)}})(i);
          r.appendChild(d);
        }
        var c=document.createElement('span');c.className='counter';c.id='slideCounter';
        c.textContent=(current+1)+'/'+totalSlides;r.appendChild(c);
        var ib=document.createElement('button');ib.className='idx-btn';ib.textContent='☰';ib.onclick=toggleIndex;r.appendChild(ib);
      }
    `,
    transitionCSS: {
      fade: '.slide { animation: fadeIn .5s ease; } @keyframes fadeIn { from{opacity:0} to{opacity:1} }',
      slide: '.slide { animation: slideUp .5s ease; } @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }',
      zoom: '.slide { animation: zoomIn .5s ease; } @keyframes zoomIn { from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }',
      flip: '.slide { animation: flipIn .6s ease; } @keyframes flipIn { from{transform:perspective(800px) rotateY(20deg);opacity:0} to{transform:perspective(800px) rotateY(0);opacity:1} }'
    }
  },

  /* ──────────────────────────────────────────
     MINIMALIST — Keyboard-only + counter
     ────────────────────────────────────────── */
  minimalist: {
    name: 'Minimalist',
    fonts: {
      heading: 'JetBrains Mono',
      body: 'Inter',
      import: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap"
    },
    colors: { bg: '#111111', text: '#e8e8e8', accent: '#6366f1', secondary: '#333333' },
    css: `
      body { background:VAR_BG; color:VAR_TEXT; font-family:'Inter',system-ui,sans-serif; }
      .slide { display:none; flex-direction:column; justify-content:center; min-height:100vh; padding:10vh 12vw; }
      .slide.active { display:flex; }
      .slide h1, .slide h2 { font-family:'JetBrains Mono',monospace; font-weight:700; }
      .slide h1 { font-size:2.8rem; margin-bottom:.6em; letter-spacing:-.03em; }
      .slide h2 { font-size:1.5rem; margin-bottom:.8em; opacity:.8; letter-spacing:-.02em; }
      .slide p { font-size:1.05rem; line-height:1.8; max-width:650px; margin-bottom:.8em; opacity:.7; }
      .slide ul { list-style:none; padding:0; max-width:600px; }
      .slide ul li { padding:.5em 0; font-size:1rem; opacity:.75; }
      .slide ul li::before { content:'→ '; color:VAR_ACCENT; font-family:'JetBrains Mono',monospace; }
      .slide.type-title { justify-content:center; }
      .slide.type-title h1 { font-size:3.5rem; }
      .slide.type-title p { font-size:1.1rem; opacity:.4; }
      .slide.type-quote { justify-content:center; }
      .slide.type-quote p { font-size:1.5rem; line-height:1.7; font-weight:500; opacity:.85; }
      .slide.type-quote h2 { font-size:.85rem; font-weight:400; opacity:.35; margin-top:.8em; }
      .slide.type-two-column .columns { display:flex; gap:6vw; max-width:900px; }
      .slide.type-two-column .col { flex:1; }
      .slide.type-image-placeholder .img-box { width:100%; max-width:400px; height:200px; border:1px solid VAR_SECONDARY; display:flex; align-items:center; justify-content:center; color:VAR_TEXT; opacity:.2; margin:1.5em 0; font-family:'JetBrains Mono',monospace; font-size:.8rem; }
    `,
    navCSS: `
      .nav-counter { position:fixed; bottom:20px; right:24px; font-family:'JetBrains Mono',monospace; font-size:.75rem; color:VAR_TEXT; opacity:.3; z-index:100; cursor:pointer; }
      .nav-counter:hover { opacity:.6; }
      .slide-index-panel { position:fixed; bottom:40px; right:24px; background:rgba(17,17,17,.97); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.06); border-radius:8px; padding:.8rem; max-height:50vh; overflow-y:auto; display:none; z-index:101; min-width:260px; }
      .slide-index-panel.open { display:block; }
      .slide-index-panel a { display:block; padding:.35rem .7rem; color:VAR_TEXT; text-decoration:none; font-size:.8rem; border-radius:4px; margin-bottom:1px; opacity:.4; font-family:'JetBrains Mono',monospace; }
      .slide-index-panel a:hover, .slide-index-panel a.active { opacity:1; background:rgba(99,102,241,.12); }
    `,
    navHTML: `
      <div class="nav-counter" id="slideCounter" onclick="toggleIndex()"></div>
      <div class="slide-index-panel" id="indexPanel"></div>
    `,
    navJS: '',
    transitionCSS: {
      fade: '.slide { animation: fadeIn .3s ease; } @keyframes fadeIn { from{opacity:0} to{opacity:1} }',
      slide: '.slide { animation: slideIn .3s ease; } @keyframes slideIn { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }',
      zoom: '.slide { animation: zoomIn .3s ease; } @keyframes zoomIn { from{transform:scale(.96);opacity:0} to{transform:scale(1);opacity:1} }',
      flip: '.slide { animation: flipIn .4s ease; } @keyframes flipIn { from{transform:rotateY(8deg);opacity:0} to{transform:rotateY(0);opacity:1} }'
    }
  }
};

/* ── Font pair registry (for editor picker) ── */
window.FONT_PAIRS = {
  'inter-system':      { heading: 'Inter',            body: 'Inter',           import: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
  'playfair-lora':     { heading: 'Playfair Display',  body: 'Lora',           import: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;500;600&display=swap" },
  'nunito-quicksand':  { heading: 'Nunito',            body: 'Quicksand',      import: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&family=Quicksand:wght@400;500;600&display=swap" },
  'space-dm':          { heading: 'Space Grotesk',     body: 'DM Sans',        import: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500;600&display=swap" },
  'jetbrains-inter':   { heading: 'JetBrains Mono',    body: 'Inter',          import: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" },
  'poppins-opensans':  { heading: 'Poppins',           body: 'Open Sans',      import: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap" },
  'raleway-roboto':    { heading: 'Raleway',           body: 'Roboto',         import: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&family=Roboto:wght@400;500&display=swap" },
  'montserrat-source': { heading: 'Montserrat',        body: 'Source Sans 3',  import: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" }
};
