(function () {
  "use strict";
  // Selo visual dizendo que deu certo:
  const tag = document.createElement("div");
  tag.textContent = "Loader OK";
  Object.assign(tag.style, {
    position: "fixed", right: "10px", bottom: "10px",
    background: "#16a34a", color: "#fff", padding: "6px 10px",
    borderRadius: "10px", zIndex: 999999, font: "12px Arial"
  });
  const add = () => document.body && document.body.appendChild(tag);
  (document.readyState === "loading") ? document.addEventListener("DOMContentLoaded", add) : add();
  console.log("[TW] hello.js carregado!");
})();
