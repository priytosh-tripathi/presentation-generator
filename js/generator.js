/* ============================================================
   generator.js — Standalone HTML presentation builder
   Assembles a self-contained .html file from slide data + theme
   ============================================================ */

window.PresentationGenerator = (function () {
  'use strict';

  /**
   * Build a complete standalone HTML string.
   * @param {object} opts
   * @param {object} opts.data          - { title, subtitle, slides[] }
   * @param {string} opts.themeName     - key in THEMES
   * @param {string} opts.transition    - fade|slide|zoom|flip
   * @param {object} [opts.colorOverrides]  - { bg, text, accent, secondary }
   * @param {object} [opts.fontOverride]    - { heading, body, import }
   * @param {string} [opts.navOverride]     - theme key to take nav from
   * @param {string} [opts.bgPattern]       - none|dots|lines|waves
   * @param {boolean}[opts.gradient]        - use gradient bg
   * @param {number} [opts.gradientAngle]   - degrees
   * @returns {string} Complete HTML document
   */
  function build(opts) {
    var data   = opts.data;
    var theme  = window.THEMES[opts.themeName] || window.THEMES.professional;
    var transition = opts.transition || 'fade';
    var colors = Object.assign({}, theme.colors, opts.colorOverrides || {});
    var fonts  = opts.fontOverride || theme.fonts;

    // Determine which nav to use (may be overridden)
    var navTheme = opts.navOverride ? (window.THEMES[opts.navOverride] || theme) : theme;

    // Replace color variables in CSS strings
    function replaceVars(css) {
      return css
        .replace(/VAR_BG/g,        colors.bg)
        .replace(/VAR_TEXT/g,       colors.text)
        .replace(/VAR_ACCENT/g,     colors.accent)
        .replace(/VAR_SECONDARY/g,  colors.secondary || colors.accent);
    }

    // Background CSS
    var bgCSS = buildBgCSS(colors, opts.gradient, opts.gradientAngle, opts.bgPattern);

    // Build slides HTML
    var slidesHTML = data.slides.map(function (s, i) {
      return renderSlide(s, i, colors);
    }).join('\n');

    // Slide titles array for index panel
    var slideTitlesJSON = JSON.stringify(data.slides.map(function (s) {
      return s.heading || s.content || 'Slide';
    }));

    // Transition CSS
    var transCSS = theme.transitionCSS[transition] || theme.transitionCSS.fade;

    var html = '<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
      + '<title>' + escapeHTML(data.title || 'Presentation') + '</title>'
      + '<style>@import url(\'' + fonts.import + '\');</style>'
      + '<style>'
      + '*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }'
      + replaceVars(theme.css)
      + replaceVars(buildComponentCSS())
      + replaceVars(navTheme.navCSS)
      + replaceVars(transCSS)
      + bgCSS
      // Font overrides
      + 'body { font-family: \'' + fonts.body + '\', sans-serif; }'
      + '.slide h1, .slide h2 { font-family: \'' + fonts.heading + '\', sans-serif; }'
      + '</style></head><body>'
      + slidesHTML
      + replaceVars(navTheme.navHTML)
      + '<script>'
      + buildSlideEngine(navTheme, slideTitlesJSON)
      + '</script></body></html>';

    return html;
  }

  /* ── Background CSS builder ── */
  function buildBgCSS(colors, gradient, angle, pattern) {
    var css = '';
    if (gradient) {
      var a = angle || 135;
      css += 'body { background: linear-gradient(' + a + 'deg, ' + colors.bg + ', ' + (colors.secondary || colors.accent) + ') !important; background-attachment:fixed; }';
    }
    if (pattern && pattern !== 'none') {
      var pCSS = '';
      if (pattern === 'dots') {
        pCSS = 'background-image: radial-gradient(circle, ' + colors.accent + '22 1px, transparent 1px); background-size: 24px 24px;';
      } else if (pattern === 'lines') {
        pCSS = 'background-image: repeating-linear-gradient(0deg, ' + colors.accent + '11, ' + colors.accent + '11 1px, transparent 1px, transparent 40px); ';
      } else if (pattern === 'waves') {
        pCSS = 'background-image: url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="' + colors.accent + '" fill-opacity="0.05" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,208C672,213,768,171,864,154.7C960,139,1056,149,1152,170.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/></svg>') + '"); background-repeat:repeat; background-size:100% 320px; background-position:bottom;';
      }
      css += 'body::after { content:""; position:fixed; inset:0; pointer-events:none; z-index:0; ' + pCSS + ' }';
      css += '.slide { position:relative; z-index:1; }';
    }
    return css;
  }

  /* ── Component CSS for rich slide elements ── */
  function buildComponentCSS() {
    return ''
      /* ── LAYOUT FOUNDATION ── */
      + '.slide{padding-bottom:max(10vh,72px) !important}' /* clear nav bar */
      + '.slide-inner{display:flex;flex-direction:column;align-items:inherit;width:100%;max-width:1100px;margin:0 auto;gap:1.5rem}'

      /* ── HIGHLIGHT BOXES ── */
      + '.highlights-container{display:flex;flex-direction:column;gap:.8rem;width:100%;max-width:800px;margin:0 auto}'
      + '.highlight-box{display:flex;flex-direction:column;gap:.25rem;padding:1.1rem 1.4rem;border-radius:14px;text-align:left;backdrop-filter:blur(4px)}'
      + '.highlight-box.info{border-left:4px solid #3b82f6;background:rgba(59,130,246,.1)}'
      + '.highlight-box.warning{border-left:4px solid #f59e0b;background:rgba(245,158,11,.1)}'
      + '.highlight-box.success{border-left:4px solid #22c55e;background:rgba(34,197,94,.1)}'
      + '.highlight-box.tip{border-left:4px solid #8b5cf6;background:rgba(139,92,246,.1)}'
      + '.highlight-title{font-weight:700;font-size:.92rem;line-height:1.3}'
      + '.highlight-text{font-size:.88rem;line-height:1.65;opacity:.82}'

      /* ── STAT CARDS ── */
      + '.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.25rem;width:100%;max-width:960px;margin:0 auto}'
      + '.stat-card{padding:1.6rem 1.4rem;border-radius:16px;text-align:center;border:1px solid rgba(128,128,128,.12);position:relative;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}'
      + '.stat-card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(128,128,128,.07),rgba(128,128,128,.01));pointer-events:none}'
      + '.stat-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,.1)}'
      + '.stat-value{font-size:2.6rem;font-weight:800;color:VAR_ACCENT;line-height:1.1;margin-bottom:.25rem;position:relative}'
      + '.stat-label{font-size:.88rem;font-weight:600;opacity:.8;margin-bottom:.15rem;position:relative}'
      + '.stat-desc{font-size:.76rem;opacity:.48;position:relative;line-height:1.4}'

      /* ── DIAGRAM / FLOWCHART ── */
      + '.diagram-container{width:100%;max-width:960px;margin:0 auto;padding:.5rem 0}'
      + '.diagram-label{font-size:.82rem;text-transform:uppercase;letter-spacing:.1em;opacity:.45;margin-bottom:1.2rem;text-align:center}'
      + '.diagram-flow{display:flex;align-items:stretch;justify-content:center;gap:0;flex-wrap:wrap;row-gap:1rem}'
      + '.diagram-node{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.1rem 1.6rem;border-radius:14px;border:2px solid VAR_ACCENT;text-align:center;min-width:130px;max-width:200px;background:rgba(128,128,128,.04);flex:1}'
      + '.diagram-node-label{font-weight:700;font-size:.92rem;line-height:1.3}'
      + '.diagram-node-desc{font-size:.76rem;opacity:.55;margin-top:.3rem;line-height:1.4}'
      + '.diagram-arrow{display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:VAR_ACCENT;padding:0 .6rem;opacity:.5;flex-shrink:0}'
      + '.diagram-cycle-note{text-align:center;color:VAR_ACCENT;font-size:.82rem;opacity:.4;margin-top:1rem;font-weight:600;letter-spacing:.04em}'

      /* ── TIMELINE ── */
      + '.timeline-container{width:100%;max-width:720px;margin:0 auto;position:relative;padding-left:2.5rem}'
      + '.timeline-container::before{content:"";position:absolute;left:9px;top:4px;bottom:4px;width:2px;background:linear-gradient(180deg,VAR_ACCENT 0%,VAR_ACCENT 60%,transparent 100%);border-radius:1px}'
      + '.timeline-item{position:relative;padding:0 0 1.8rem 1.6rem;text-align:left}'
      + '.timeline-item:last-child{padding-bottom:0}'
      + '.timeline-marker{position:absolute;left:-2.5rem;top:.25rem;width:20px;height:20px;border-radius:50%;background:VAR_ACCENT;border:3px solid VAR_BG;z-index:1;box-shadow:0 0 0 4px rgba(128,128,128,.08)}'
      + '.timeline-date{font-size:.78rem;font-weight:700;color:VAR_ACCENT;margin-bottom:.25rem;text-transform:uppercase;letter-spacing:.06em;line-height:1.2}'
      + '.timeline-title-label{font-weight:600;font-size:1rem;margin-bottom:.2rem;line-height:1.3}'
      + '.timeline-desc{font-size:.86rem;opacity:.65;line-height:1.55}'

      /* ── BAR CHART ── */
      + '.chart-container{width:100%;max-width:740px;margin:0 auto}'
      + '.chart-bars{display:flex;align-items:flex-end;gap:clamp(.6rem,2vw,1.5rem);justify-content:center;height:220px;padding:0 .5rem}'
      + '.chart-bar-wrapper{display:flex;flex-direction:column;align-items:center;flex:1;max-width:90px;height:100%;justify-content:flex-end}'
      + '.chart-bar{width:100%;border-radius:8px 8px 0 0;background:linear-gradient(180deg,VAR_ACCENT,rgba(128,128,128,.12));min-height:8px;transition:height .6s cubic-bezier(.4,0,.2,1)}'
      + '.chart-bar-value{font-size:.78rem;font-weight:700;margin-bottom:.35rem;opacity:.8}'
      + '.chart-bar-label{font-size:.74rem;margin-top:.6rem;opacity:.55;text-align:center;line-height:1.3}'

      /* ── SECTION BREAK ── */
      + '.section-break-line{width:80px;height:4px;background:linear-gradient(90deg,VAR_ACCENT,transparent);border-radius:2px;margin:1.5rem auto 0}'

      /* ── SLIDE-TYPE ALIGNMENT ── */
      + '.slide.type-stats,.slide.type-timeline,.slide.type-diagram,.slide.type-chart,.slide.type-section-break{align-items:center;text-align:center}'
      + '.slide.type-section-break h1{font-size:2.5rem}'
      + '.slide.type-section-break p{opacity:.5;font-size:1.1rem;max-width:600px}'
      + '.slide.type-quote{align-items:center;text-align:center}'
      + '.slide.type-closing{align-items:center;text-align:center}'

      /* ── PER-SLIDE GRADIENT BACKGROUND ── */
      + '.slide[data-bg]{position:relative}'
      + '.slide[data-bg]::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:0;pointer-events:none}'
      + '.slide.slide-bg-gradient{position:relative}'
      + '.slide.slide-bg-gradient::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none}'

      /* ── PRESET GRADIENT PALETTES ── */
      + '.slide.bg-ocean{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#0ea5e9 100%) !important}'
      + '.slide.bg-sunset{background:linear-gradient(135deg,#1a1a2e 0%,#e94560 50%,#f5af19 100%) !important}'
      + '.slide.bg-forest{background:linear-gradient(135deg,#0b3d0b 0%,#1b5e20 45%,#4caf50 100%) !important}'
      + '.slide.bg-aurora{background:linear-gradient(135deg,#0f0c29 0%,#302b63 40%,#24c6dc 100%) !important}'
      + '.slide.bg-ember{background:linear-gradient(135deg,#1a1a2e 0%,#b91c1c 50%,#f97316 100%) !important}'
      + '.slide.bg-lavender{background:linear-gradient(135deg,#1e1b4b 0%,#7c3aed 45%,#c4b5fd 100%) !important}'
      + '.slide.bg-midnight{background:linear-gradient(135deg,#020617 0%,#1e293b 50%,#334155 100%) !important}'
      + '.slide.bg-rose{background:linear-gradient(135deg,#1c1917 0%,#9f1239 45%,#fda4af 100%) !important}'
      + '.slide.bg-arctic{background:linear-gradient(135deg,#ecfdf5 0%,#a7f3d0 40%,#06b6d4 100%) !important}'
      + '.slide.bg-warm{background:linear-gradient(135deg,#fffbeb 0%,#fcd34d 40%,#f97316 100%) !important}'
      + '.slide.bg-slate{background:linear-gradient(135deg,#f8fafc 0%,#cbd5e1 45%,#64748b 100%) !important}'
      + '.slide.bg-nord{background:linear-gradient(135deg,#2e3440 0%,#3b4252 40%,#88c0d0 100%) !important}'
      /* light-bg slides get dark text automatically */
      + '.slide.bg-arctic,.slide.bg-warm,.slide.bg-slate{color:#1e293b !important}'
      + '.slide.bg-arctic h1,.slide.bg-arctic h2,.slide.bg-warm h1,.slide.bg-warm h2,.slide.bg-slate h1,.slide.bg-slate h2{color:#0f172a !important}'
      /* dark-bg slides get light text automatically */
      + '.slide.bg-ocean,.slide.bg-sunset,.slide.bg-forest,.slide.bg-aurora,.slide.bg-ember,.slide.bg-lavender,.slide.bg-midnight,.slide.bg-rose,.slide.bg-nord{color:#f0f0f5 !important}'
      + '.slide.bg-ocean h1,.slide.bg-ocean h2,.slide.bg-sunset h1,.slide.bg-sunset h2,.slide.bg-forest h1,.slide.bg-forest h2,.slide.bg-aurora h1,.slide.bg-aurora h2,.slide.bg-ember h1,.slide.bg-ember h2,.slide.bg-lavender h1,.slide.bg-lavender h2,.slide.bg-midnight h1,.slide.bg-midnight h2,.slide.bg-rose h1,.slide.bg-rose h2,.slide.bg-nord h1,.slide.bg-nord h2{color:#ffffff !important}';
  }

  /* ── Rich component render helpers ── */
  function renderHighlights(highlights) {
    if (!highlights || !highlights.length) return '';
    var icons = { info: '\u2139\uFE0F', warning: '\u26A0\uFE0F', success: '\u2705', tip: '\uD83D\uDCA1' };
    return '<div class="highlights-container">' + highlights.map(function (h) {
      var t = h.type || 'info';
      return '<div class="highlight-box ' + t + '">'
        + '<div class="highlight-title">' + (icons[t] || icons.info) + ' ' + escapeHTML(h.title || '') + '</div>'
        + '<div class="highlight-text">' + escapeHTML(h.text || '') + '</div>'
        + '</div>';
    }).join('') + '</div>';
  }

  function renderStatsCards(stats) {
    if (!stats || !stats.length) return '';
    return '<div class="stats-grid">' + stats.map(function (s) {
      return '<div class="stat-card">'
        + '<div class="stat-value">' + escapeHTML(s.value || '') + '</div>'
        + '<div class="stat-label">' + escapeHTML(s.label || '') + '</div>'
        + (s.description ? '<div class="stat-desc">' + escapeHTML(s.description) + '</div>' : '')
        + '</div>';
    }).join('') + '</div>';
  }

  function renderDiagram(diagram) {
    if (!diagram || !diagram.nodes || !diagram.nodes.length) return '';
    var h = '<div class="diagram-container">';
    if (diagram.title) h += '<div class="diagram-label">' + escapeHTML(diagram.title) + '</div>';
    h += '<div class="diagram-flow">';
    diagram.nodes.forEach(function (node, i) {
      if (i > 0) h += '<div class="diagram-arrow">\u2192</div>';
      var label = typeof node === 'string' ? node : (node.label || '');
      var desc = typeof node === 'string' ? '' : (node.description || '');
      h += '<div class="diagram-node">'
        + '<div class="diagram-node-label">' + escapeHTML(label) + '</div>'
        + (desc ? '<div class="diagram-node-desc">' + escapeHTML(desc) + '</div>' : '')
        + '</div>';
    });
    h += '</div>';
    if (diagram.type === 'cycle') h += '<div class="diagram-cycle-note">\u21BB Continuous Cycle</div>';
    h += '</div>';
    return h;
  }

  function renderTimeline(timeline) {
    if (!timeline || !timeline.length) return '';
    return '<div class="timeline-container">' + timeline.map(function (item) {
      return '<div class="timeline-item">'
        + '<div class="timeline-marker"></div>'
        + '<div class="timeline-date">' + escapeHTML(item.date || '') + '</div>'
        + '<div class="timeline-title-label">' + escapeHTML(item.title || '') + '</div>'
        + (item.description ? '<div class="timeline-desc">' + escapeHTML(item.description) + '</div>' : '')
        + '</div>';
    }).join('') + '</div>';
  }

  function renderChart(chartData) {
    if (!chartData || !chartData.length) return '';
    var maxVal = Math.max.apply(null, chartData.map(function (d) { return parseFloat(d.value) || 0; }));
    if (maxVal === 0) maxVal = 1;
    return '<div class="chart-container"><div class="chart-bars">' + chartData.map(function (d) {
      var val = parseFloat(d.value) || 0;
      var pct = Math.round((val / maxVal) * 100);
      return '<div class="chart-bar-wrapper">'
        + '<div class="chart-bar-value">' + escapeHTML(String(d.value)) + '</div>'
        + '<div class="chart-bar" style="height:' + pct + '%"></div>'
        + '<div class="chart-bar-label">' + escapeHTML(d.label || '') + '</div>'
        + '</div>';
    }).join('') + '</div></div>';
  }

  /* ── Render individual slide ── */
  function renderSlide(slide, index, colors) {
    var type = slide.type || 'content';
    var cls = 'slide type-' + type + (index === 0 ? ' active' : '');
    var h = '';

    switch (type) {
      case 'title':
        h = '<h1>' + escapeHTML(slide.heading) + '</h1>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        break;

      case 'content':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        if (slide.bullets && slide.bullets.length) {
          h += '<ul>' + slide.bullets.map(function (b) { return '<li>' + escapeHTML(b) + '</li>'; }).join('') + '</ul>';
        }
        break;

      case 'two-column':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        if (slide.bullets && slide.bullets.length >= 2) {
          h += '<div class="columns"><div class="col">' + escapeHTML(slide.bullets[0]) + '</div><div class="col">' + escapeHTML(slide.bullets[1]) + '</div></div>';
        }
        break;

      case 'quote':
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += '<h2>' + escapeHTML(slide.heading) + '</h2>';
        break;

      case 'image-placeholder':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        h += '<div class="img-box">[ ' + escapeHTML(slide.content || 'Image placeholder') + ' ]</div>';
        break;

      case 'stats':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += renderStatsCards(slide.stats);
        break;

      case 'timeline':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += renderTimeline(slide.timeline);
        break;

      case 'diagram':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += renderDiagram(slide.diagram);
        break;

      case 'chart':
        h = '<h2>' + escapeHTML(slide.heading) + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += renderChart(slide.chartData);
        break;

      case 'section-break':
        h = '<h1>' + escapeHTML(slide.heading) + '</h1>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        h += '<div class="section-break-line"></div>';
        break;

      case 'closing':
        h = '<h1>' + escapeHTML(slide.heading) + '</h1>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        break;

      default:
        h = '<h2>' + escapeHTML(slide.heading || '') + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
    }

    // Append rich components (available on any slide type)
    if (type !== 'stats' && slide.stats && slide.stats.length) h += renderStatsCards(slide.stats);
    if (slide.highlights && slide.highlights.length) h += renderHighlights(slide.highlights);
    if (type !== 'diagram' && slide.diagram) h += renderDiagram(slide.diagram);
    if (type !== 'timeline' && slide.timeline && slide.timeline.length) h += renderTimeline(slide.timeline);
    if (type !== 'chart' && slide.chartData && slide.chartData.length) h += renderChart(slide.chartData);

    // Per-slide background
    var bgClass = '';
    var bgStyle = '';
    if (slide.background) {
      if (slide.background.startsWith('bg-')) {
        bgClass = ' slide-bg-gradient ' + slide.background;
      } else if (slide.background.startsWith('linear-gradient') || slide.background.startsWith('radial-gradient')) {
        bgStyle = ' style="background:' + slide.background + ' !important"';
        bgClass = ' slide-bg-gradient';
      }
    }

    return '<div class="' + cls + bgClass + '" data-index="' + index + '"' + bgStyle + '>' + h + '</div>';
  }

  /* ── Slide engine JS (embedded in output) ── */
  function buildSlideEngine(navTheme, slideTitlesJSON) {
    return '(function(){'
      + 'var slides=document.querySelectorAll(".slide");'
      + 'var current=0;'
      + 'var totalSlides=slides.length;'
      + 'var slideTitles=' + slideTitlesJSON + ';'
      + 'function showSlide(n){'
      +   'slides.forEach(function(s){s.classList.remove("active");s.style.display="none";});'
      +   'slides[n].classList.add("active");slides[n].style.display="flex";'
      +   'updateCounter();'
      +   'if(typeof renderDots==="function")renderDots();'
      +   'if(typeof renderRail==="function")renderRail();'
      +   'updateIndex();'
      + '}'
      + 'function nextSlide(){if(current<totalSlides-1){current++;showSlide(current);}}'
      + 'function prevSlide(){if(current>0){current--;showSlide(current);}}'
      + 'function goToSlide(n){if(n>=0&&n<totalSlides){current=n;showSlide(current);}}'
      + 'function updateCounter(){'
      +   'var el=document.getElementById("slideCounter");'
      +   'if(el)el.textContent=(current+1)+"/"+totalSlides;'
      + '}'
      + 'function toggleIndex(){'
      +   'var p=document.getElementById("indexPanel");'
      +   'if(p)p.classList.toggle("open");'
      + '}'
      + 'function updateIndex(){'
      +   'var p=document.getElementById("indexPanel");if(!p)return;'
      +   'p.innerHTML="";'
      +   'for(var i=0;i<totalSlides;i++){'
      +     'var a=document.createElement("a");'
      +     'a.href="#";a.textContent=(i+1)+". "+slideTitles[i];'
      +     'if(i===current)a.className="active";'
      +     'a.onclick=(function(x){return function(e){e.preventDefault();goToSlide(x);toggleIndex();}})(i);'
      +     'p.appendChild(a);'
      +   '}'
      + '}'
      // Expose functions globally for nav buttons
      + 'window.nextSlide=nextSlide;window.prevSlide=prevSlide;'
      + 'window.goToSlide=goToSlide;window.toggleIndex=toggleIndex;'
      // Custom nav JS from theme
      + (navTheme.navJS || '')
      // Keyboard navigation
      + 'document.addEventListener("keydown",function(e){'
      +   'if(e.key==="ArrowRight"||e.key===" ")nextSlide();'
      +   'else if(e.key==="ArrowLeft")prevSlide();'
      +   'else if(e.key==="f"||e.key==="F"){'
      +     'if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(function(){});'
      +     'else document.exitFullscreen();'
      +   '}'
      +   'else if(e.key==="Escape"){'
      +     'var p=document.getElementById("indexPanel");'
      +     'if(p&&p.classList.contains("open"))p.classList.remove("open");'
      +   '}'
      + '});'
      // Click to advance (not on nav elements)
      + 'document.addEventListener("click",function(e){'
      +   'if(e.target.closest("#navBar")||e.target.closest("#indexPanel")||e.target.tagName==="BUTTON"||e.target.tagName==="A")return;'
      +   'nextSlide();'
      + '});'
      // Init
      + 'showSlide(0);'
      // Auto-fullscreen attempt
      + 'document.addEventListener("DOMContentLoaded",function(){'
      +   'updateCounter();updateIndex();'
      +   'if(typeof renderDots==="function")renderDots();'
      +   'if(typeof renderRail==="function")renderRail();'
      + '});'
      + '})();';
  }

  /* ── HTML escaping ── */
  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return { build: build };
})();
