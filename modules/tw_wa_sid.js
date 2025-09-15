(function () {
  'use strict';

  /*** CONFIG ***/
  const SERVER  = 'https://us.api-wa.me';         // ex: https://us.api-wa.me
  const API_KEY = 'x2145xcde02798fe815f1';        // sua Key (cuidado: público)
  const TO      = '5581988917841';                // E.164 ou ...@g.us
  const ENVIAR_APENAS_UMA_VEZ_POR_CARREGAMENTO = true;
  /**************/

  // só envia se esse botão existir na tela
  const REQUIRE_SELECTOR = '#inner-border > table > tbody > tr:nth-child(1) > td > a';

  // seletores auxiliares
  const SEL_USER_PRIMARY  = '#tw-username-float';
  const SEL_USER_FALLBACK = '#menu_row > td:nth-child(11) > table > tbody > tr:nth-child(1) > td > a';
  const SEL_SID           = '#twSid';

  const START_DELAY_MS  = 3000;
  const WAIT_EL_TIMEOUT = 20000;
  const SEND_ONCE_KEY   = 'tw_wa_sid_sent_once_v3';

  // Tamper GM.xmlHttpRequest disponível via Loader
  const gmXHR = (typeof GM_xmlhttpRequest === 'function'
                 ? GM_xmlhttpRequest
                 : (typeof GM !== 'undefined' ? GM.xmlHttpRequest : null));

  if (!gmXHR) {
    console.error('[TW→WA] GM_xmlhttpRequest indisponível (ajuste @grant no Loader).');
    return;
  }

  if (ENVIAR_APENAS_UMA_VEZ_POR_CARREGAMENTO && sessionStorage.getItem(SEND_ONCE_KEY) === '1') return;

  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  async function waitFor(selector, timeout = WAIT_EL_TIMEOUT) {
    const first = document.querySelector(selector);
    if (first) return first;
    return new Promise((resolve, reject) => {
      const obs = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) { obs.disconnect(); resolve(el); }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); reject(new Error('Elemento não apareceu: ' + selector)); }, timeout);
    });
  }

  function nowPtBR() {
    return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
  }

  function sendText(to, text) {
    const url = `${SERVER.replace(/\/+$/,'')}/${encodeURIComponent(API_KEY)}/message/text`;
    const body = JSON.stringify({ to, text });
    return new Promise((resolve, reject) => {
      gmXHR({
        method: 'POST',
        url,
        headers: { 'Content-Type': 'application/json' },
        data: body,
        onload: (res) => (res.status >= 200 && res.status < 300) ? resolve(res) : reject(res),
        onerror: reject,
        ontimeout: reject,
      });
    });
  }

  async function main() {
    try {
      await wait(START_DELAY_MS);

      // condição obrigatória
      if (!document.querySelector(REQUIRE_SELECTOR)) {
        console.log('[TW→WA] Botão não visível. Nada será enviado.');
        return;
      }

      // usuário (primary + fallback)
      let user = (document.querySelector(SEL_USER_PRIMARY)?.textContent || '').trim();
      if (!user) user = (document.querySelector(SEL_USER_FALLBACK)?.textContent || '').trim();
      if (!user) user = 'Indefinido';

      // SID (somente para a 2ª mensagem)
      const sidEl = await waitFor(SEL_SID);
      const sid   = (sidEl.value || sidEl.textContent || sidEl.innerText || '').trim();

      const host   = location.host;
      const quando = nowPtBR();

      // 1ª mensagem — SEM SID
      const msgResumo =
`🤖Captcha Detectado🤖

👤 Usuário: ${user}
📌 Host: ${host}
🕒 Quando: ${quando}`;

      const r1 = await sendText(TO, msgResumo);
      console.log('[TW→WA] ✅ Resumo enviado:', r1.responseText);

      // 2ª mensagem — somente SID
      const r2 = await sendText(TO, sid);
      console.log('[TW→WA] ✅ SID enviado:', r2.responseText);

      if (ENVIAR_APENAS_UMA_VEZ_POR_CARREGAMENTO) sessionStorage.setItem(SEND_ONCE_KEY, '1');
    } catch (e) {
      const status = e?.status || e?.response?.status || 'NET';
      console.warn('[TW→WA] Falha no envio:', status, e?.responseText || e);
    }
  }

  main();
})();
