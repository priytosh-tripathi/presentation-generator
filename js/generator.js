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

      case 'closing':
        h = '<h1>' + escapeHTML(slide.heading) + '</h1>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
        break;

      default:
        h = '<h2>' + escapeHTML(slide.heading || '') + '</h2>';
        if (slide.content) h += '<p>' + escapeHTML(slide.content) + '</p>';
    }

    return '<div class="' + cls + '" data-index="' + index + '">' + h + '</div>';
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
