/* ============================================================
   editor.js — Interactive preview editor controls
   Manages slide list, content editing, fonts, colors, bg,
   navigation override, and transition switching.
   All changes update in-memory state and re-render the preview.
   ============================================================ */

window.Editor = (function () {
  'use strict';

  // ── State ──
  var state = {
    data: null,           // { title, subtitle, slides[] }
    themeName: 'professional',
    transition: 'fade',
    colors: {},           // { bg, text, accent, secondary }
    fontPairKey: null,     // key in FONT_PAIRS
    fonts: null,          // { heading, body, import }
    navOverride: null,    // null = use theme default, or theme key
    bgPattern: 'none',
    gradient: false,
    gradientAngle: 135,
    selectedSlide: 0
  };

  var onRender = null;    // callback to trigger re-render

  /* ── Initialize editor with generated data ── */
  function init(data, themeName, renderCallback) {
    var theme = window.THEMES[themeName] || window.THEMES.professional;
    state.data = JSON.parse(JSON.stringify(data)); // deep copy
    state.themeName = themeName;
    state.colors = Object.assign({}, theme.colors);
    state.fonts = Object.assign({}, theme.fonts);
    state.fontPairKey = detectFontPairKey(theme.fonts);
    state.navOverride = null;
    state.transition = 'fade';
    state.bgPattern = 'none';
    state.gradient = false;
    state.gradientAngle = 135;
    state.selectedSlide = 0;
    onRender = renderCallback;

    renderSlideList();
    selectSlide(0);
    syncColorPickers();
    syncFontPicker();
    syncNavPills();
    syncTransitionPills();
    syncBgPatternPills();
    syncGradientControls();
    bindEvents();
    renderBgSwatches();
  }

  /* ── Detect font pair key from theme fonts ── */
  function detectFontPairKey(fonts) {
    var pairs = window.FONT_PAIRS;
    for (var k in pairs) {
      if (pairs[k].heading === fonts.heading && pairs[k].body === fonts.body) return k;
    }
    return 'inter-system';
  }

  /* ── Slide list ── */
  function renderSlideList() {
    var list = document.getElementById('slideList');
    if (!list) return;
    list.innerHTML = '';
    state.data.slides.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'slide-list-item' + (i === state.selectedSlide ? ' active' : '');
      li.draggable = true;
      li.dataset.index = i;
      li.innerHTML =
        '<span class="drag-handle">⠿</span>' +
        '<span class="slide-label">' + (i + 1) + '. ' + truncate(s.heading || s.content || 'Slide', 28) + '</span>' +
        '<button class="slide-delete" title="Delete slide">&times;</button>';
      li.querySelector('.slide-label').addEventListener('click', function () { selectSlide(i); });
      li.querySelector('.slide-delete').addEventListener('click', function (e) { e.stopPropagation(); deleteSlide(i); });
      // Drag events
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragover', onDragOver);
      li.addEventListener('drop', onDrop);
      li.addEventListener('dragend', onDragEnd);
      list.appendChild(li);
    });
  }

  var dragSrcIndex = null;
  function onDragStart(e) {
    dragSrcIndex = parseInt(this.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '.4';
  }
  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
  function onDrop(e) {
    e.preventDefault();
    var target = parseInt(this.dataset.index);
    if (dragSrcIndex === null || dragSrcIndex === target) return;
    var slides = state.data.slides;
    var moved = slides.splice(dragSrcIndex, 1)[0];
    slides.splice(target, 0, moved);
    state.selectedSlide = target;
    renderSlideList();
    triggerRender();
  }
  function onDragEnd() { this.style.opacity = '1'; dragSrcIndex = null; }

  function selectSlide(idx) {
    state.selectedSlide = idx;
    // Highlight in list
    document.querySelectorAll('.slide-list-item').forEach(function (li, i) {
      li.classList.toggle('active', i === idx);
    });
    // Load content into editor
    var slide = state.data.slides[idx];
    if (!slide) return;
    var editor = document.getElementById('slideContentEditor');
    if (editor) {
      var text = '';
      if (slide.heading) text += slide.heading + '\n\n';
      if (slide.content) text += slide.content + '\n\n';
      if (slide.bullets && slide.bullets.length) {
        text += slide.bullets.map(function (b) { return '• ' + b; }).join('\n');
      }
      editor.value = text.trim();
    }
  }

  function deleteSlide(idx) {
    if (state.data.slides.length <= 1) return;
    state.data.slides.splice(idx, 1);
    if (state.selectedSlide >= state.data.slides.length) {
      state.selectedSlide = state.data.slides.length - 1;
    }
    renderSlideList();
    selectSlide(state.selectedSlide);
    triggerRender();
  }

  function addSlide() {
    state.data.slides.push({
      type: 'content',
      heading: 'New Slide',
      content: '',
      bullets: [],
      speakerNotes: ''
    });
    renderSlideList();
    selectSlide(state.data.slides.length - 1);
    triggerRender();
  }

  /* ── Content editor ── */
  function onContentChange() {
    var editor = document.getElementById('slideContentEditor');
    if (!editor) return;
    var slide = state.data.slides[state.selectedSlide];
    if (!slide) return;

    var lines = editor.value.split('\n');
    var heading = '';
    var contentParts = [];
    var bullets = [];
    var inBullets = false;

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!heading && trimmed.length > 0 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
        heading = trimmed;
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        bullets.push(trimmed.replace(/^[•\-*]\s*/, ''));
        inBullets = true;
      } else if (!inBullets && trimmed.length > 0) {
        contentParts.push(trimmed);
      }
    });

    slide.heading = heading || slide.heading;
    if (contentParts.length) slide.content = contentParts.join(' ');
    if (bullets.length) slide.bullets = bullets;

    // Update slide list label
    renderSlideList();
    triggerRender();
  }

  /* ── Color controls ── */
  function syncColorPickers() {
    setPickerValue('colorBg', state.colors.bg);
    setPickerValue('colorText', state.colors.text);
    setPickerValue('colorAccent', state.colors.accent);
  }

  function setPickerValue(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
  }

  function onColorChange(prop, value) {
    state.colors[prop] = value;
    triggerRender();
  }

  /* ── Background swatches ── */
  function renderBgSwatches() {
    var container = document.getElementById('bgSwatches');
    if (!container) return;
    var swatches = ['#1a1a2e', '#f8f9fa', '#111111', '#0f0e17', '#fef9f0', '#2d2d2d', '#1e293b', '#0a192f'];
    container.innerHTML = '';
    swatches.forEach(function (c) {
      var s = document.createElement('button');
      s.className = 'swatch';
      s.style.background = c;
      s.addEventListener('click', function () {
        state.colors.bg = c;
        setPickerValue('colorBg', c);
        triggerRender();
      });
      container.appendChild(s);
    });
  }

  /* ── Font picker ── */
  function syncFontPicker() {
    var sel = document.getElementById('fontPairSelect');
    if (sel) sel.value = state.fontPairKey || 'inter-system';
  }

  function onFontChange(key) {
    var pair = window.FONT_PAIRS[key];
    if (!pair) return;
    state.fontPairKey = key;
    state.fonts = Object.assign({}, pair);
    // Inject font for preview
    loadFont(pair.import);
    triggerRender();
  }

  function loadFont(url) {
    var existing = document.querySelector('link[href="' + url + '"]');
    if (existing) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  /* ── Nav style pills ── */
  function syncNavPills() {
    activatePill('navStylePills', 'nav', state.navOverride || state.themeName);
  }

  /* ── Transition pills ── */
  function syncTransitionPills() {
    activatePill('transitionPills', 'transition', state.transition);
  }

  /* ── Background pattern pills ── */
  function syncBgPatternPills() {
    activatePill('bgPatternPills', 'pattern', state.bgPattern);
  }

  /* ── Gradient controls ── */
  function syncGradientControls() {
    var toggle = document.getElementById('gradientToggle');
    if (toggle) toggle.checked = state.gradient;
    var angleRow = document.getElementById('gradientAngleRow');
    if (angleRow) angleRow.classList.toggle('hidden', !state.gradient);
    var angleInput = document.getElementById('gradientAngle');
    if (angleInput) angleInput.value = state.gradientAngle;
    var angleVal = document.getElementById('gradientAngleValue');
    if (angleVal) angleVal.textContent = state.gradientAngle + '°';
  }

  /* ── Pill helper ── */
  function activatePill(containerId, dataAttr, value) {
    var pills = document.querySelectorAll('#' + containerId + ' .option-pill');
    pills.forEach(function (p) {
      p.classList.toggle('active', p.dataset[dataAttr] === value);
    });
  }

  /* ── Bind all events ── */
  function bindEvents() {
    // Content editor — remove old listener before adding new one
    var editor = document.getElementById('slideContentEditor');
    if (editor) {
      var debouncedContentChange = debounce(onContentChange, 400);
      editor.removeEventListener('input', editor._boundContentChange);
      editor._boundContentChange = debouncedContentChange;
      editor.addEventListener('input', debouncedContentChange);
    }

    // Add slide
    var addBtn = document.getElementById('btnAddSlide');
    if (addBtn) {
      addBtn.onclick = addSlide;
    }

    // Color pickers
    bindColorPicker('colorBg', 'bg');
    bindColorPicker('colorText', 'text');
    bindColorPicker('colorAccent', 'accent');

    // Font picker
    var fontSel = document.getElementById('fontPairSelect');
    if (fontSel) {
      fontSel.onchange = function () { onFontChange(this.value); };
    }

    // Nav pills
    document.querySelectorAll('#navStylePills .option-pill').forEach(function (pill) {
      pill.onclick = function () {
        state.navOverride = this.dataset.nav;
        syncNavPills();
        triggerRender();
      };
    });

    // Transition pills
    document.querySelectorAll('#transitionPills .option-pill').forEach(function (pill) {
      pill.onclick = function () {
        state.transition = this.dataset.transition;
        syncTransitionPills();
        triggerRender();
      };
    });

    // Background pattern pills
    document.querySelectorAll('#bgPatternPills .option-pill').forEach(function (pill) {
      pill.onclick = function () {
        state.bgPattern = this.dataset.pattern;
        syncBgPatternPills();
        triggerRender();
      };
    });

    // Gradient toggle
    var gradToggle = document.getElementById('gradientToggle');
    if (gradToggle) {
      gradToggle.onchange = function () {
        state.gradient = this.checked;
        syncGradientControls();
        triggerRender();
      };
    }

    // Gradient angle
    var gradAngle = document.getElementById('gradientAngle');
    if (gradAngle) {
      gradAngle.oninput = function () {
        state.gradientAngle = parseInt(this.value);
        var v = document.getElementById('gradientAngleValue');
        if (v) v.textContent = this.value + '°';
        triggerRender();
      };
    }
  }

  function bindColorPicker(id, prop) {
    var picker = document.getElementById(id);
    if (picker) {
      picker.oninput = function () { onColorChange(prop, this.value); };
    }
  }

  /* ── Trigger preview re-render ── */
  function triggerRender() {
    if (typeof onRender === 'function') {
      onRender(getBuildOptions());
    }
  }

  /* ── Get current build options for generator ── */
  function getBuildOptions() {
    return {
      data: state.data,
      themeName: state.themeName,
      transition: state.transition,
      colorOverrides: state.colors,
      fontOverride: state.fonts,
      navOverride: state.navOverride,
      bgPattern: state.bgPattern,
      gradient: state.gradient,
      gradientAngle: state.gradientAngle
    };
  }

  /* ── Utils ── */
  function truncate(str, n) {
    return str.length > n ? str.substring(0, n) + '…' : str;
  }

  function debounce(fn, ms) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  return {
    init: init,
    getBuildOptions: getBuildOptions,
    getState: function () { return state; }
  };
})();
