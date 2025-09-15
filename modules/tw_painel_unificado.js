(function () {
  'use strict';
  if (window.__TW_PAINEL_UNIFICADO__) return;
  window.__TW_PAINEL_UNIFICADO__ = true;

  const VERSAO = " V.10-09-2025 - SID";

  const estilo = `
    position: fixed; top: 10px; left: 10px;
    background: linear-gradient(135deg,#1e1e1e,#2c2c2c);
    color: #f8f8f2; font-family: Arial, sans-serif; font-size: 13px;
    border-radius: 10px; box-shadow: 0 0 12px rgba(0,0,0,.6);
    padding: 12px 16px; z-index: 999999; max-width: 260px; opacity: .95; text-align: center;
  `;

  const box = document.createElement("div");
  box.id = "painel-unificado";
  box.setAttribute("style", estilo);
  box.innerHTML = `
    <div style="font-weight:bold;font-size:15px;margin-bottom:4px">🧭 Elite Shopping TW</div>
    <div style="font-size:12px;color:#b5b5b5;margin-bottom:6px">(MultiConta)</div>
    <div style="font-size:12px;margin-bottom:4px">Versão: <span style="color:#98c379">${VERSAO}</span></div>
    <div style="font-size:14px;font-weight:bold;color:#f1c40f;border-bottom:1px solid #444;padding-bottom:4px;margin-bottom:6px">🧾 Status da Conta</div>
    <div id="status-tribo" style="font-size:13px;font-weight:bold">⏳ Verificando tribo...</div>
    <div id="status-paladino" style="font-size:13px;font-weight:bold;margin-top:6px">⏳ Verificando paladino...</div>
    <div style="margin-top:10px;text-align:left;font-size:13px">
      <label style="display:block;margin-bottom:4px"><input type="checkbox" id="coleta-on" style="transform:scale(1.1);margin-right:5px"> ✅ Com Coleta</label>
      <label><input type="checkbox" id="coleta-off" style="transform:scale(1.1);margin-right:5px"> ❌ Sem Coleta</label>
    </div>
  `;

  function detectarTribo(timeoutSegundos = 5){
    const alvo = document.getElementById('status-tribo');
    let t = 0, max = timeoutSegundos*2;
    const it = setInterval(()=>{
      t++;
      const gd = window.game_data;
      if (gd && gd.player && typeof gd.player.ally !== 'undefined'){
        const id = gd.player.ally;
        alvo.innerHTML = (id && id !== "0")
          ? `🏰 Com Tribo (ID: <span style="color:#00ff88">${id}</span>)`
          : `<span style="color:#ff4f4f">🚫 Você não está em uma tribo</span>`;
        clearInterval(it);
      }
      if (t>=max){ alvo.innerHTML = `<span style="color:#ffcc00">⚠️ game_data não carregado</span>`; clearInterval(it); }
    },500);
  }

  async function detectarPaladino(){
    const alvo = document.getElementById('status-paladino');
    const vid = window.game_data?.village?.id;
    if(!vid){ alvo.textContent = "❌ Aldeia não identificada"; return; }
    try{
      const html = await (await fetch(`/game.php?village=${vid}&screen=statue`)).text();
      const m = html.match(/"name":"Paul".*?"level":(\d+)/);
      alvo.innerHTML = (m && m[1]) ? `🛡️ Paladino Paul - Nível <span style="color:#61dafb">${m[1]}</span>` : `❌ Paladino não está na aldeia`;
    }catch{ alvo.textContent = "❌ Erro ao buscar paladino"; }
  }

  function checkboxes(){
    const on = document.getElementById("coleta-on");
    const off = document.getElementById("coleta-off");
    const s = localStorage.getItem("estado_coleta");
    if (s==="on") on.checked = true; else if (s==="off") off.checked = true;

    on.addEventListener("change", ()=>{ if(on.checked){ off.checked=false; localStorage.setItem("estado_coleta","on"); } else localStorage.removeItem("estado_coleta"); });
    off.addEventListener("change", ()=>{ if(off.checked){ on.checked=false; localStorage.setItem("estado_coleta","off"); } else localStorage.removeItem("estado_coleta"); });
  }

  const start = ()=>{ document.body.appendChild(box); detectarTribo(); detectarPaladino(); checkboxes(); };
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", start) : start();
})();
