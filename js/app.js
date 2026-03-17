/* ============================================================
   app.js — Orchestration, DOM events, validation
   Wires together: form → AI → generator → preview + editor
   ============================================================ */

(function () {
  'use strict';

  // ── DOM refs ──
  var formPanel        = document.getElementById('formPanel');
  var previewLayout    = document.getElementById('previewEditorLayout');
  var generateBtn      = document.getElementById('generateBtn');
  var loadingOverlay   = document.getElementById('loadingOverlay');
  var errorMessage     = document.getElementById('errorMessage');
  var previewIframe    = document.getElementById('previewIframe');
  var btnDownload      = document.getElementById('btnDownload');
  var btnCopyHTML      = document.getElementById('btnCopyHTML');
  var btnNewTab        = document.getElementById('btnNewTab');
  var btnBackToForm    = document.getElementById('btnBackToForm');

  var topicInput       = document.getElementById('topic');
  var promptInput      = document.getElementById('prompt');
  var styleSelect      = document.getElementById('style');
  var audienceSelect   = document.getElementById('audience');
  var slideCountSelect = document.getElementById('slideCount');

  // ── State ──
  var currentHTML = '';

  // ── Generate flow ──
  generateBtn.addEventListener('click', async function () {
    hideError();

    // Validate
    var topic = (topicInput.value || '').trim();
    if (!topic) {
      showError('Please enter a topic for your presentation.');
      topicInput.focus();
      return;
    }

    var params = {
      topic: topic,
      prompt: (promptInput.value || '').trim(),
      style: styleSelect.value,
      audience: audienceSelect.value,
      slideCount: slideCountSelect.value
    };

    // Show loading
    generateBtn.disabled = true;
    showLoading(true);
    setLoadingStep('analyze');

    try {
      // Step 1 — analyzing
      await delay(400);
      setLoadingStep('generate');

      // Step 2 — call API
      var data = await window.AI.generate(params);
      setLoadingStep('build');
      await delay(300);

      // Step 3 — build preview
      renderPreview(data, params.style);
      setLoadingStep('render');
      await delay(300);

      // Step 4 — show preview + editor
      showPreview();

    } catch (err) {
      showLoading(false);
      showError(err.message || 'An unexpected error occurred.');
    } finally {
      generateBtn.disabled = false;
    }
  });

  // ── Render preview into iframe ──
  function renderPreview(data, styleName) {
    var opts = {
      data: data,
      themeName: styleName,
      transition: 'fade'
    };

    currentHTML = window.PresentationGenerator.build(opts);
    writeToIframe(currentHTML);

    // Initialize editor
    window.Editor.init(data, styleName, function (buildOpts) {
      currentHTML = window.PresentationGenerator.build(buildOpts);
      writeToIframe(currentHTML);
    });
  }

  function writeToIframe(html) {
    var doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }

  // ── Show / hide views ──
  function showPreview() {
    showLoading(false);
    formPanel.style.display = 'none';
    previewLayout.classList.add('visible');
  }

  function showForm() {
    previewLayout.classList.remove('visible');
    formPanel.style.display = '';
    currentHTML = '';
  }

  btnBackToForm.addEventListener('click', showForm);

  // ── Download ──
  btnDownload.addEventListener('click', function () {
    if (!currentHTML) return;
    // Rebuild with latest editor state
    currentHTML = window.PresentationGenerator.build(window.Editor.getBuildOptions());

    var blob = new Blob([currentHTML], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(window.Editor.getState().data.title || 'presentation') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'success');
  });

  // ── Copy HTML ──
  btnCopyHTML.addEventListener('click', function () {
    if (!currentHTML) return;
    currentHTML = window.PresentationGenerator.build(window.Editor.getBuildOptions());
    navigator.clipboard.writeText(currentHTML).then(function () {
      showToast('HTML copied to clipboard!', 'success');
    }).catch(function () {
      showToast('Failed to copy.', 'error');
    });
  });

  // ── Open in new tab ──
  btnNewTab.addEventListener('click', function () {
    if (!currentHTML) return;
    currentHTML = window.PresentationGenerator.build(window.Editor.getBuildOptions());
    var blob = new Blob([currentHTML], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  });

  // ── Loading state ──
  function showLoading(visible) {
    loadingOverlay.classList.toggle('visible', visible);
    if (visible) {
      generateBtn.style.display = 'none';
    } else {
      generateBtn.style.display = '';
      // Reset steps
      document.querySelectorAll('.loading-step').forEach(function (s) {
        s.classList.remove('active', 'done');
      });
    }
  }

  function setLoadingStep(stepName) {
    var steps = document.querySelectorAll('.loading-step');
    var found = false;
    steps.forEach(function (s) {
      if (s.dataset.step === stepName) {
        s.classList.add('active');
        s.classList.remove('done');
        found = true;
      } else if (!found) {
        s.classList.remove('active');
        s.classList.add('done');
      }
    });
  }

  // ── Error display ──
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
  }

  function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('visible');
  }

  // ── Toast notifications ──
  function showToast(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2500);
  }

  // ── Utilities ──
  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_').substring(0, 60) || 'presentation';
  }
})();
