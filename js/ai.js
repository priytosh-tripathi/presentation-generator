/* ============================================================
   ai.js — Calls /api/generate (Azure Functions proxy)
   Never touches OpenAI directly; API key is server-side.
   ============================================================ */

window.AI = (function () {
  'use strict';

  var API_ENDPOINT = '/api/generate';

  /**
   * Generate presentation slide data via the backend proxy.
   * @param {object} params
   * @param {string} params.topic
   * @param {string} params.prompt
   * @param {string} params.style
   * @param {string} params.audience
   * @param {string} params.slideCount
   * @returns {Promise<object>} Parsed slide data { title, subtitle, slides[] }
   */
  async function generate(params) {
    var res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: params.topic,
        prompt: params.prompt,
        style: params.style,
        audience: params.audience,
        slideCount: params.slideCount
      })
    });

    var body;
    try {
      body = await res.json();
    } catch {
      throw new Error('Server returned an invalid response.');
    }

    if (!res.ok) {
      throw new Error(body.error || 'Request failed with status ' + res.status);
    }

    // Basic validation
    if (!body.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      throw new Error('Server returned an invalid presentation structure.');
    }

    return body;
  }

  return { generate: generate };
})();
