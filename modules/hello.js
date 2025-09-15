(function () {
  "use strict";
  console.log("[TW] hello.js carregado!");
  const tag = document.createElement("div");
  tag.textContent = "Loader OK";
  Object.assign(tag.style, {
    position: "fixed", zIndex: 999999, right: "10px", bottom: "10px",
    padding: "6px 10px", borderRadius: "10px", background: "#16a34a",
    color: "#fff", font: "12px/1.2 Arial, sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,.15)"
  });
  const add = () => document.body && document.body.appendChild(tag);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", add);
  } else {
    add();
  }
})();
