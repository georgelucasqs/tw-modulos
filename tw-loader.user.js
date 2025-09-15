// ==UserScript==
// @name         TW Loader (simples)
// @namespace    tw-loader
// @version      1.0.0
// @description  Carrega seus módulos a partir de um manifesto central.
// @match        https://*.tribalwars.com.br/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      *
// ==/UserScript==
(function () {
  "use strict";
  const MANIFEST_URL = "https://cdn.jsdelivr.net/gh/georgelucasqs/tw-modulos@main/manifest.json";
  const gmXHR = typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : GM.xmlHttpRequest;

  const getText = (url) => new Promise(ok => gmXHR({
    method: "GET", url, headers: {"Cache-Control":"no-cache"},
    onload: r => ok(r.status>=200 && r.status<300 ? r.responseText : null),
    onerror: () => ok(null)
  }));

  const matches = (patterns) => {
    if (!patterns || !patterns.length) return true;
    const href = location.href;
    return patterns.some(p=>{
      const re = new RegExp("^"+p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\\\*/g,".*")+"$");
      return re.test(href);
    });
  };

  const run = (code, id) => {
    try { new Function(`/* ${id} */(function(){ "use strict";\n${code}\n})();`)(); }
    catch(e){ console.error("[Loader] Erro no módulo", id, e); }
  };

  (async function boot(){
    const mtext = await getText(MANIFEST_URL);
    if (!mtext) { console.error("[Loader] Manifesto indisponível"); return; }
    let manifest;
    try { manifest = JSON.parse(mtext); } catch { console.error("[Loader] Manifesto inválido"); return; }

    for (const mod of manifest.modules || []) {
      if (!mod.enabled) continue;
      if (!matches(mod.match)) continue;
      const url = mod.url + (mod.version ? `?v=${encodeURIComponent(mod.version)}` : "");
      const code = await getText(url);
      if (code) run(code, mod.id);
      else console.error("[Loader] Falhou baixar módulo", mod.id);
    }

    // Checa de tempos em tempos (opcional)
    const mins = Math.max(5, manifest.updateIntervalMinutes || 60);
    setTimeout(boot, mins*60*1000);
  })();
})();
