// ==UserScript==
// @name         TW Loader (manifest modular)
// @namespace    tw-loader
// @version      1.0.1
// @description  Carrega ~30 módulos a partir de um manifesto central com cache por versão.
// @author       você
// @match        https://*.tribalwars.com.br/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      *
// @updateURL    https://cdn.jsdelivr.net/gh/georgelucasqs/tw-modulos@main/tw-loader.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/georgelucasqs/tw-modulos@main/tw-loader.user.js
// ==/UserScript==

(function () {
  "use strict";

  const MANIFEST_URL = "https://cdn.jsdelivr.net/gh/georgelucasqs/tw-modulos@main/manifest.json";

  const gmXHR = typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : GM.xmlHttpRequest;
  const getV = (k,d)=>Promise.resolve().then(()=>GM_getValue(k,d)).catch(()=>d);
  const setV = (k,v)=>Promise.resolve().then(()=>GM_setValue(k,v)).catch(()=>{});
  const KEY = (s)=>`tw_loader_${s}`;

  function fetchText(url) {
    return new Promise((ok) => gmXHR({
      method: "GET", url,
      headers: { "Cache-Control": "no-cache" },
      onload: (r) => ok({ ok: r.status >= 200 && r.status < 300, text: r.responseText }),
      onerror: () => ok({ ok: false, text: "" })
    }));
  }

  function urlMatches(patterns) {
    if (!patterns || !patterns.length) return true;
    const href = location.href;
    return patterns.some(p => {
      const re = new RegExp("^" + p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\\\*/g,".*") + "$");
      return re.test(href);
    });
  }

  function runIsolated(code, id) {
    try { new Function(`/* ${id} */(function(){ "use strict";\n${code}\n})();`)(); }
    catch (e) { console.error("[TW Loader] Erro no módulo", id, e); }
  }

  async function getManifest() {
    const lastCheckKey = KEY("mf_last");
    const textKey = KEY("mf_text");

    // usa cache se dentro do intervalo
    try {
      const cachedText = await getV(textKey, null);
      if (cachedText) {
        const cached = JSON.parse(cachedText);
        const mins = Math.max(5, cached.updateIntervalMinutes || 60);
        const last = await getV(lastCheckKey, 0);
        if (Date.now() - last < mins * 60 * 1000) return cached;
      }
    } catch {}

    // baixa manifesto
    const r = await fetchText(MANIFEST_URL);
    if (r.ok && r.text) {
      try {
        const parsed = JSON.parse(r.text);
        await setV(textKey, r.text);
        await setV(lastCheckKey, Date.now());
        return parsed;
      } catch {}
    }

    // fallback: cache
    const cachedText = await getV(textKey, null);
    if (cachedText) {
      try { return JSON.parse(cachedText); } catch {}
    }
    console.error("[TW Loader] Manifesto indisponível.");
    return null;
  }

  async function loadModule(mod) {
    if (!mod.enabled) return;
    if (!urlMatches(mod.match)) return;

    const codeKey = KEY(`mod_${mod.id}_code`);
    const verKey  = KEY(`mod_${mod.id}_ver`);
    const cachedVer  = await getV(verKey, null);
    const cachedCode = await getV(codeKey, null);

    if (cachedVer && cachedVer === mod.version && cachedCode) {
      runIsolated(cachedCode, mod.id);
      return;
    }

    const url = mod.url + (mod.version ? `?v=${encodeURIComponent(mod.version)}` : "");
    const r = await fetchText(url);
    if (r.ok && r.text) {
      await setV(codeKey, r.text);
      await setV(verKey,  mod.version || "");
      runIsolated(r.text, mod.id);
    } else if (cachedCode) {
      console.warn("[TW Loader] Falhou baixar", mod.id, "— usando cache.");
      runIsolated(cachedCode, mod.id);
    } else {
      console.error("[TW Loader] Não foi possível carregar módulo", mod.id);
    }
  }

  (async function bootstrap() {
    const manifest = await getManifest();
    if (!manifest || !Array.isArray(manifest.modules)) return;
    await Promise.all(manifest.modules.map(loadModule));
    const mins = Math.max(5, manifest.updateIntervalMinutes || 60);
    setTimeout(bootstrap, mins * 60 * 1000);
  })();
})();
