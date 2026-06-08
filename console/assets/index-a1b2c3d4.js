// 模擬前端框架打包後的 entry chunk
const env = "SERVER";
const stamp = document.getElementById("stamp");

function paint() {
  if (!stamp) return;
  const t = new Date().toLocaleTimeString("zh-Hant", { hour12: false });
  stamp.innerHTML =
    `build marker: SYNC-TEST-WEBCONTENT-${env} ` +
    `<span class="live">| rendered @ runtime · ${t}</span>`;
}

paint();
setInterval(paint, 1000);

console.log("[ODP WebContent deploy test] bundle loaded, env =", env);
