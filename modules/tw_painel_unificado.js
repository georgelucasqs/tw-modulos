(function () {
  'use strict';

  // evita rodar 2x se o loader revalidar
  if (window.__TW_PAINEL_UNIFICADO__) return;
  window.__TW_PAINEL_UNIFICADO__ = true;

  const VERSAO = " V.10-09-2025 - SID";

  const estiloPainelUnico = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
    color: #f8f8f2;
    font-family: Arial, sans-serif;
    font-size: 13px;
    border-radius: 10px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
    padding: 12px 16px;
    z-index: 999999;
    max-width: 260px;
    opacity: 0.95;
    text-align: center;
  `;

  const painelUnico = document.createElement("div");
  painelUnico.id = "painel-unificado";
  painelUnico.setAttribute("style", estiloPainelUnico);
  painelUnico.innerHTML = `
    <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">
      🧭 Elite Shopping TW
    </div>
    <div style="font-size: 12px; color: #b5b5b5; margin-bottom: 6px;">
      (MultiConta)
    </div>
    <div style="font-size: 12px; margin-bottom: 4px;">
      Versão: <span style="color: #98c379;">${VERSAO}</span>
    </div>
    <div style="font-size: 14px; font-weight: bold; color: #f1c40f; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 6px;">
      🧾 Status da Conta
    </div>
    <div id="status-tribo" style="font-size: 13px; font-weight: bold;">
      ⏳ Verificando tribo...
    </div>
    <div id="status-paladino" style="font-size: 13px; font-weight: bold; margin-top: 6px;">
      ⏳ Verificando paladino...
    </div>
    <div style="margin-top: 10px; text-align: left; font-size: 13px;">
      <label style="display: block; margin-bottom: 4px;">
        <input type="checkbox" id="coleta-on" style="transform: scale(1.1); margin-right: 5px;">
        ✅ Com Coleta
      </label>
      <label>
        <input type="checkbox" id="coleta-off" style="transform: scale(1.1); margin-right: 5px;">
        ❌ Sem Coleta
      </label>
    </div>
  `;

  function detectarTribo(timeoutSegundos = 5) {
    const painelStatus = document.getElementById('status-tribo');
    let tentativas = 0;
