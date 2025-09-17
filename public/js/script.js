// script.js — tudo ajustado: chat abre sem fechar, A+/A- ok, cálculo “peso entre sessões” ok

import { db } from "./firebase-init.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================================================
   0) Normalização
   ========================================================= */
function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim();
}

/* =========================================================
   1) Mapa de ASSETS (várias imagens por chave)
   ========================================================= */
const ASSETS = {
  "chat/diabetes": ["../img/chat/image17.png"],
  "chat/sintomas": [
    "../img/chat/image5.png",
    "../img/chat/image8.png",
    "../img/chat/image10.png",
    "../img/chat/image9.png",
  ],
  "chat/exames": ["../img/chat/image7.png"],
  "chat/tratamentos": ["../img/chat/image1.png", "../img/chat/image13.png"],
  "chat/hemodialise": ["../img/chat/image13.png"],
  "chat/acessos": ["../img/chat/image2.png", "../img/chat/image15.png"],
  "chat/cuidados": ["../img/chat/image16.png"],
  "chat/emocional": ["../img/chat/image14.png"],
};

/* =========================================================
   1.1) Pergunta -> IMAGENS
   ========================================================= */
const QUESTION_IMAGE_RAW = {
  "Quais são os principais fatores de risco para DRC?": ["chat/diabetes"],
  "Quais são os principais fatores de risco para a doença renal crônica?": ["chat/diabetes"],
  "Quais são os riscos que podem causar a DRC?": ["chat/diabetes"],
  "O que pode aumentar o risco de desenvolver DRC?": ["chat/diabetes"],
  "Quais são as causas comuns da doença renal crônica?": ["chat/diabetes"],
  "O que pode levar alguém a ter DRC?": ["chat/diabetes"],
  "Quais são os fatores que contribuem para a doença renal crônica?": ["chat/diabetes"],
  "Que condições aumentam o risco de DRC?": ["chat/diabetes"],
  "Quais são os principais motivos que levam à doença renal crônica?": ["chat/diabetes"],
  "O que pode fazer com que uma pessoa desenvolva DRC?": ["chat/diabetes"],
  "Quais são os principais fatores que podem causar problemas renais crônicos?": ["chat/diabetes"],

  "Quais são os sintomas comuns da DRC?": ["chat/sintomas"],
  "Poderia me informar quais são os sintomas comuns da Doença Renal Crônica?": ["chat/sintomas"],
  "Quais são os sinais típicos da DRC?": ["chat/sintomas"],
  "Você sabe quais sintomas geralmente aparecem em casos de Doença Renal Crônica?": ["chat/sintomas"],
  "Quais sintomas são frequentemente associados à DRC?": ["chat/sintomas"],
  "Quais são os sintomas mais comuns observados em pacientes com Doença Renal Crônica?": ["chat/sintomas"],
  "Que sintomas a DRC costuma apresentar?": ["chat/sintomas"],
  "Pode me dizer quais são os sintomas habituais da Doença Renal Crônica?": ["chat/sintomas"],
  "Quais são os sintomas característicos da DRC?": ["chat/sintomas"],
  "Quais são os sintomas predominantes da Doença Renal Crônica?": ["chat/sintomas"],

  "Como é feito o diagnóstico da DRC?": ["chat/exames"],
  "Quais são os métodos usados para diagnosticar a Doença Renal Crônica?": ["chat/exames"],
  "Como os médicos determinam se alguém tem Doença Renal Crônica?": ["chat/exames"],
  "Quais são os critérios clínicos e laboratoriais para o diagnóstico da Doença Renal Crônica?": ["chat/exames"],
  "Quais são os exames e procedimentos mais eficazes para diagnosticar a Doença Renal Crônica?": ["chat/exames"],
  "Descreva os diferentes exames utilizados no diagnóstico da Doença Renal Crônica": ["chat/exames"],
  "Quais são os sinais e sintomas que indicam a necessidade de investigar a presença de Doença Renal Crônica?": ["chat/exames"],
  "Como é realizado o diagnóstico da Doença Renal Crônica em diferentes estágios da doença?": ["chat/exames"],
  "Quais são os métodos padrão e alternativos para diagnosticar a Doença Renal Crônica?": ["chat/exames"],
  "Pode explicar como é feito o diagnóstico da Doença Renal Crônica?": ["chat/exames"],
  "Quais são os avanços recentes no diagnóstico da Doença Renal Crônica?": ["chat/exames"],

  "Quais são os tratamentos disponíveis para DRC?": ["chat/tratamentos"],
  "Quais são os tratamentos oferecidos para Doença Renal Crônica?": ["chat/tratamentos"],
  "Quais opções de tratamento existem para DRC?": ["chat/tratamentos"],
  "Que tipos de tratamento estão disponíveis para a Doença Renal Crônica?": ["chat/tratamentos"],
  "Pode me informar sobre os tratamentos para DRC?": ["chat/tratamentos"],
  "Quais são as terapias disponíveis para a Doença Renal Crônica?": ["chat/tratamentos"],
  "Quais são os métodos de tratamento para a DRC?": ["chat/tratamentos"],
  "O que está disponível em termos de tratamento para Doença Renal Crônica?": ["chat/tratamentos"],
  "Quais tratamentos podem ser utilizados para a DRC?": ["chat/tratamentos"],
  "Quais são as abordagens terapêuticas para Doença Renal Crônica?": ["chat/tratamentos"],
  "Quais são as opções de tratamento atuais para DRC?": ["chat/tratamentos"],

  "O que é hemodiálise?": ["chat/hemodialise"],
  "O que significa hemodiálise?": ["chat/hemodialise"],
  "Para que serve a hemodiálise?": ["chat/hemodialise"],
  "Como funciona a hemodiálise?": ["chat/hemodialise"],
  "Quando uma pessoa precisa fazer hemodiálise?": ["chat/hemodialise"],
  "O que acontece durante uma sessão de hemodiálise?": ["chat/hemodialise"],
  "Por que alguém faria hemodiálise?": ["chat/hemodialise"],
  "A hemodiálise dói?": ["chat/hemodialise"],
  "Quanto tempo dura uma sessão de hemodiálise?": ["chat/hemodialise"],
  "Quais são os riscos da hemodiálise?": ["chat/hemodialise"],
  "A hemodiálise pode curar problemas nos rins?": ["chat/hemodialise"],

  "Quais os tipos de acessos para fazer hemodiálise?": ["chat/acessos"],
  "Quais são as formas de se conectar à máquina de hemodiálise?": ["chat/acessos"],
  "Como é feito o acesso para a hemodiálise?": ["chat/acessos"],
  "Que tipos de acessos existem para fazer hemodiálise?": ["chat/acessos"],
  "Quais são os métodos de acesso para hemodiálise?": ["chat/acessos"],
  "Como os pacientes são ligados à máquina de hemodiálise": ["chat/acessos"],
  "Quais os tipos de acessos usados na hemodiálise?": ["chat/acessos"],
  "Que tipo de acesso é necessário para hemodiálise?": ["chat/acessos"],
  "Como o sangue é acessado para a hemodiálise?": ["chat/acessos"],
  "Quais são as opções de acesso para quem precisa fazer hemodiálise?": ["chat/acessos"],

  "Quais os cuidados após a sessão de hemodiálise?": ["chat/cuidados"],
  "O que devo fazer depois da hemodiálise?": ["chat/cuidados"],
  "Quais cuidados preciso ter depois da hemodiálise?": ["chat/cuidados"],
  "Como devo me cuidar após uma sessão de hemodiálise?": ["chat/cuidados"],
  "O que evitar após fazer hemodiálise?": ["chat/cuidados"],
  "Quais são os cuidados pós-hemodiálise?": ["chat/cuidados"],
  "Tem alguma recomendação para depois da hemodiálise?": ["chat/cuidados"],
  "Como posso me sentir após a hemodiálise e o que devo fazer?": ["chat/cuidados"],
  "Há restrições após a hemodiálise?": ["chat/cuidados"],
  "Preciso tomar algum cuidado especial após a hemodiálise?": ["chat/cuidados"],

  "Como lidar com o impacto emocional da DRC?": ["chat/emocional"],
};
const QUESTION_IMAGE_MAP = (() => {
  const out = {};
  for (const [q, imgs] of Object.entries(QUESTION_IMAGE_RAW)) out[normalizeText(q)] = imgs;
  return out;
})();

/* =========================================================
   1.2) Pergunta -> VÍDEOS do YouTube
   ========================================================= */
const QUESTION_VIDEO_RAW = {
  "Como faço para seguir o tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Como deve ser o estilo de vida/ou dia a dia da pessoa que realiza hemodiálise?": ["GLOPWxBZ7TM"],
  "Como deve ser a alimentação de pessoas que realizam hemodiálise?": ["tiASHRuCJls"],
  "Como saber a quantidade de líquido que pode ser ingerida por dia para quem realiza hemodiálise?": ["--Zu7zX7N8E"],
  "Como aliviar a sede em pessoas com restrição de líquidos?": ["-79LGgPbkU8"],
  "O que é a fístula arteriovenosa (FAV)?": ["XM5sCXTrIik"],
  "Como cuidar da fístula arteriovenosa?": ["fI9efWh_xTU"],
  "Quais os cuidados com o cateter venoso central?": ["1t6ILKI_6ck"],
  "O que é o cateter venoso central para hemodiálise?": ["1t6ILKI_6ck"],
  "Quais os cuidados com o curativo do cateter para hemodiálise?": ["zjRKTzaiYmU"],
  "Quais os cuidados com as medicações?": ["LMC7cjPIXSA"],
  "Faço hemodiálise preciso ser acompanhado por outros profissionais da saúde?": ["h-Dzl6IJ4DA"],
};
const QUESTION_VIDEO_MAP = (() => {
  const out = {};
  for (const [q, vids] of Object.entries(QUESTION_VIDEO_RAW)) out[normalizeText(q)] = vids;
  return out;
})();

/* =========================================================
   1.3) Helpers de mídia
   ========================================================= */
function resolveAssetUrls(tokens = []) {
  return tokens.flatMap((t) => {
    const key = t.startsWith("asset:") ? t.slice(6) : t;
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(key)) return [key];
    const val = ASSETS[key];
    if (!val) { console.warn(`[chat] imagem não mapeada: "${t}"`); return []; }
    return Array.isArray(val) ? val : [val];
  });
}
function toYouTubeEmbedUrl(idOrUrl) {
  if (!idOrUrl) return null;
  let id = idOrUrl.trim();
  try {
    const u = new URL(idOrUrl);
    if (u.hostname.includes("youtu.be")) id = u.pathname.replace("/", "");
    else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) id = u.searchParams.get("v") || idOrUrl;
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/").pop();
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/").pop();
    }
  } catch { /* não era URL */ }
  id = (id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
function resolveVideoEmbeds(tokens = []) {
  return tokens.map(toYouTubeEmbedUrl).filter(Boolean);
}

/* =========================================================
   1.4) LIGHTBOX de imagem (zoom/pan)
   ========================================================= */
let _lb, _zoom = 1, _tx = 0, _ty = 0, _drag = false, _lastX = 0, _lastY = 0;
function ensureLightbox() {
  if (_lb) return _lb;
  const root = document.createElement("div");
  root.id = "img-lightbox";
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, { position:"fixed", inset:"0", zIndex:"9999", display:"none" });
  const backdrop = document.createElement("div");
  Object.assign(backdrop.style, { position:"absolute", inset:"0", background:"rgba(0,0,0,.65)", backdropFilter:"blur(2px)" });
  backdrop.addEventListener("click", closeImageLightbox);
  const content = document.createElement("div");
  Object.assign(content.style, { position:"absolute", inset:"24px", display:"grid", placeItems:"center" });
  const img = document.createElement("img");
  img.alt = "";
  Object.assign(img.style, { maxWidth:"90vw", maxHeight:"82vh", userSelect:"none", cursor:"grab", transition:"transform .05s linear", willChange:"transform" });
  const toolbar = document.createElement("div");
  Object.assign(toolbar.style, { position:"fixed", left:"50%", bottom:"28px", transform:"translateX(-50%)", display:"flex", gap:"8px", background:"rgba(18,18,18,.8)", padding:"8px", borderRadius:"12px", boxShadow:"0 6px 24px rgba(0,0,0,.3)" });
  function mkBtn(label, act, bg = "#fff", color = "#000") {
    const b = document.createElement("button");
    b.textContent = label; b.dataset.act = act;
    Object.assign(b.style, { appearance:"none", border:"none", padding:"8px 12px", borderRadius:"10px", background:bg, color, fontWeight:"700", cursor:"pointer" });
    b.addEventListener("mouseenter", () => (b.style.filter = "brightness(.95)"));
    b.addEventListener("mouseleave", () => (b.style.filter = "none"));
    return b;
  }
  toolbar.appendChild(mkBtn("–","zoomOut"));
  toolbar.appendChild(mkBtn("+","zoomIn"));
  toolbar.appendChild(mkBtn("100%","reset"));
  toolbar.appendChild(mkBtn("×","close","#ff4d4f","#fff"));
  toolbar.addEventListener("click",(e)=>{
    const act = e.target?.dataset?.act; if (!act) return;
    if (act === "close") closeImageLightbox();
    if (act === "zoomIn") setZoom(_zoom * 1.2);
    if (act === "zoomOut") setZoom(_zoom / 1.2);
    if (act === "reset") resetZoom();
  });
  document.addEventListener("keydown",(e)=>{
    if (root.style.display === "none") return;
    if (e.key === "Escape") closeImageLightbox();
    if (e.key === "+") setZoom(_zoom * 1.2);
    if (e.key === "-") setZoom(_zoom / 1.2);
    if (e.key === "0") resetZoom();
  });
  content.addEventListener("wheel",(e)=>{
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1/1.12 : 1.12;
    setZoom(_zoom * factor);
  },{ passive:false });
  content.addEventListener("pointerdown",(e)=>{
    if (e.button !== 0) return;
    _drag = true; _lastX = e.clientX; _lastY = e.clientY;
    content.setPointerCapture(e.pointerId);
    img.style.cursor = "grabbing";
  });
  content.addEventListener("pointermove",(e)=>{
    if (!_drag) return;
    const dx = e.clientX - _lastX; const dy = e.clientY - _lastY;
    _lastX = e.clientX; _lastY = e.clientY; _tx += dx; _ty += dy;
    applyTransform(img);
  });
  content.addEventListener("pointerup",(e)=>{
    _drag = false; content.releasePointerCapture(e.pointerId); img.style.cursor = "grab";
  });
  content.addEventListener("pointercancel",()=>{
    _drag = false; img.style.cursor = "grab";
  });
  content.appendChild(img);
  root.appendChild(backdrop);
  root.appendChild(content);
  root.appendChild(toolbar);
  document.body.appendChild(root);
  _lb = { root, img };
  return _lb;
}
function openImageLightbox(src, alt="") {
  const { root, img } = ensureLightbox();
  img.src = src; img.alt = alt || "";
  resetZoom();
  root.style.display = "block"; root.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeImageLightbox() {
  if (!_lb) return;
  _lb.root.style.display = "none";
  _lb.root.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
function setZoom(z){ _zoom = Math.min(Math.max(z,0.3),6); applyTransform(_lb?.img); }
function resetZoom(){ _zoom = 1; _tx = 0; _ty = 0; applyTransform(_lb?.img); }
function applyTransform(img){ if (!img) return; img.style.transformOrigin="center center"; img.style.transform = `translate(${_tx}px, ${_ty}px) scale(${_zoom})`; }

/* =========================================================
   1.5) Listas (tópicos)
   ========================================================= */
function detectBullets(text){ return /•|-|\*\s|\d+\)/.test(text); }
function parseBullets(text){
  const firstBulletIdx = text.search(/•|-|\*\s|\d+\)/);
  if (firstBulletIdx === -1) return { intro: text.trim(), items: [] };
  const intro = text.slice(0, firstBulletIdx).trim().replace(/[;,\s]+$/, "");
  const rest  = text.slice(firstBulletIdx);
  const normalized = rest
    .replace(/\r\n/g,"\n")
    .replace(/\d+\)\s*/g,"• ")
    .replace(/-\s*/g,"• ")
    .replace(/\*\s*/g,"• ")
    .replace(/\s*•\s*/g,"\n• ");
  let parts = normalized.split(/\n•\s*/).map(s=>s.trim()).filter(Boolean);
  parts = parts.map(p=>p.replace(/^[•\-\*\d\)]+\s*/,"").replace(/[;,\s]+$/,"").trim()).filter(Boolean);
  return { intro, items: parts };
}
function escapeHtml(s=""){ return s.replace(/[&<>"']/g,(m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
function renderBulletsHTML(intro, items){
  if (!items || items.length === 0) return "";
  const li = items.map((it)=>`<li>${escapeHtml(it)}</li>`).join("");
  const introHtml = intro ? `<div class="list-intro" style="font-weight:600;margin:0 0 .5rem 0;">${escapeHtml(intro)}</div>` : "";
  return `<div class="list-block" style="background:rgba(255,255,255,.08);padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.15)">
    ${introHtml}
    <ul class="list" style="margin:.25rem 0 0 1rem; padding:0; list-style:disc; display:grid; gap:.35rem;">
      ${li}
    </ul>
  </div>`;
}

/* =========================================================
   1.6) Render de mensagens
   ========================================================= */
function addBotMessageRich({ html="", text="", images=[], alts=[], videos=[] }){
  const chat = document.getElementById("chat-body");
  const wrap = document.createElement("div");
  wrap.className = "chat-message bot";

  if (html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    wrap.appendChild(div);
  } else if (text) {
    if (detectBullets(text)) {
      const { intro, items } = parseBullets(text);
      const listHtml = renderBulletsHTML(intro, items);
      const div = document.createElement("div");
      div.innerHTML = listHtml || escapeHtml(text);
      wrap.appendChild(div);
    } else {
      const p = document.createElement("p");
      p.textContent = text;
      wrap.appendChild(p);
    }
  }

  if (images.length > 0) {
    const grid = document.createElement("div");
    grid.className = "img-grid";
    images.forEach((url, idx) => {
      const fig = document.createElement("figure");
      fig.className = "img-item";
      const img = document.createElement("img");
      img.src = url;
      img.alt = (alts[idx] || "").toString();
      img.loading = "lazy";
      img.decoding = "async";
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openImageLightbox(url, img.alt));
      fig.appendChild(img);
      if (alts[idx]) {
        const cap = document.createElement("figcaption");
        cap.textContent = alts[idx];
        fig.appendChild(cap);
      }
      grid.appendChild(fig);
    });
    wrap.appendChild(grid);
  }

  if (videos.length > 0) {
    const vlist = document.createElement("div");
    vlist.className = "video-list";
    videos.forEach((embedUrl) => {
      const vw = document.createElement("div");
      Object.assign(vw.style, { position:"relative", width:"100%", aspectRatio:"16/9", background:"#000", borderRadius:"12px", overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,.12)" });
      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = "Vídeo educativo";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.setAttribute("allowfullscreen","");
      Object.assign(iframe.style, { position:"absolute", inset:"0", width:"100%", height:"100%", border:"0" });
      vw.appendChild(iframe);
      vlist.appendChild(vw);
    });
    wrap.appendChild(vlist);
  }

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}
function addBotMessage(message){
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(message);
  addBotMessageRich({ html: looksHtml ? message : "", text: looksHtml ? "" : message });
}

/* =========================================================
   2) Fluxo principal — Firestore
   ========================================================= */
async function processUserMessage(message){
  if (looksLikeList(message)) {
    const { intro, topics } = splitIntoTopics(message);
    if (topics.length > 0) {
      const html = renderBulletsHTML(intro, topics);
      addBotMessageRich({ html });
      return;
    }
  }
  const normalizedMessage = normalizeText(message);
  const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
  let foundResponse = false;

  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (Array.isArray(data.perguntas)) {
      const perguntaCorreta = data.perguntas.find((pergunta) =>
        normalizeText(pergunta).includes(normalizedMessage)
      );
      if (perguntaCorreta) {
        foundResponse = true;
        await handleResponse(docSnap, data, message, perguntaCorreta);
        break;
      }
    }
  }

  if (!foundResponse) addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde.");
}
async function handleResponse(doc, data, userMessage="", perguntaCorreta=""){
  const rawText = data.resposta || "Desculpe, não encontrei detalhes.";
  let htmlText = "";
  if (detectBullets(rawText)) {
    const { intro, items } = parseBullets(rawText);
    if (items.length > 0) htmlText = renderBulletsHTML(intro, items);
  }
  let imageKeys = Array.isArray(data.imagens) ? data.imagens : [];
  const normQ = normalizeText(perguntaCorreta || userMessage);
  if (imageKeys.length === 0) imageKeys = QUESTION_IMAGE_MAP[normQ] || [];
  const alts = Array.isArray(data.alts) ? data.alts : [];
  const images = resolveAssetUrls(imageKeys);
  const videoTokens = QUESTION_VIDEO_MAP[normQ] || [];
  const videos = resolveVideoEmbeds(videoTokens);

  addBotMessageRich({ html: htmlText || "", text: htmlText ? "" : rawText, images, alts, videos });

  const hasExtraInfo = data.temExtraInfo && String(data.temExtraInfo).toLowerCase() === "sim";
  if (hasExtraInfo) {
    const encaminhamento = data.respostaEncaminhada;
    addExtraInfoButton(data.extraInfo, encaminhamento);
  }
}
function addExtraInfoButton(extraInfo, encaminhamento){
  const chatBody = document.getElementById("chat-body");
  const extraButton = document.createElement("button");
  extraButton.classList.add("read-more-button");
  extraButton.textContent = extraInfo;
  extraButton.onclick = async () => {
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    querySnapshot.forEach((docEnc) => {
      const dataEnc = docEnc.data();
      if (dataEnc.resposta === encaminhamento) handleResponse(docEnc, dataEnc);
    });
  };
  chatBody.appendChild(extraButton);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================================================
   Utilidades diversas
   ========================================================= */
function addUserMessage(message){
  const chatBody = document.getElementById("chat-body");
  const userMessage = document.createElement("div");
  userMessage.classList.add("chat-message", "user");
  userMessage.textContent = message;
  chatBody.appendChild(userMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
}
window.handleUserInput = function handleUserInput(event){
  if (event.key === "Enter") window.sendMessage();
};
window.sendMessage = function sendMessage(){
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (message) {
    addUserMessage(message);
    input.value = "";
    processUserMessage(message);
  }
};

/* =========================================================
   4) Botões de assuntos/atalhos + “Conheça sobre…”
   (AGORA: sempre ABREM o chat – não fecham)
   ========================================================= */
const toggleSubjectsBtn = document.getElementById("toggle-subjects-btn");
const subjectsContainer = document.getElementById("subjects-container");
const toggleIcon = document.getElementById("toggle-subjects-icon");
if (toggleSubjectsBtn && subjectsContainer && toggleIcon) {
  toggleSubjectsBtn.addEventListener("click", () => {
    const isHidden = subjectsContainer.style.display === "none" || subjectsContainer.style.display === "";
    subjectsContainer.style.display = isHidden ? "flex" : "none";
    toggleIcon.classList.toggle("fa-chevron-up", !isHidden);
    toggleIcon.classList.toggle("fa-chevron-down", isHidden);
  });
}
document.querySelectorAll(".subject-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const assunto = button.textContent;
    openChat();                      // <— garante aberto
    addUserMessage(assunto);
    processUserMessage(assunto);
  });
});
document.querySelectorAll(".tool-button").forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.querySelector("p")?.textContent || "";
    openChat();                      // <— garante aberto (não alterna/fecha)
    addUserMessage(label);
    processUserMessage(label);
  });
});

/* =========================================================
   5) Modal de cálculo — GANHO DE PESO ENTRE SESSÕES
   ========================================================= */
const modalEl     = document.getElementById("calc-modal");
const backdropEl  = document.getElementById("calc-backdrop");
const viewMenu    = document.getElementById("calc-view-menu");
const viewWeight  = document.getElementById("calc-view-weight");
const inputPesoSeco = document.getElementById("peso-seco");
const resultPeso  = document.getElementById("resultado-calculo");

function onEscClose(e){ if (e.key === "Escape") closeCalcModal(); }
function showView(which){
  if (!viewMenu || !viewWeight) return;
  viewMenu.style.display = "none";
  viewWeight.style.display = "none";
  if (which === "menu") viewMenu.style.display = "block";
  if (which === "weight") { viewWeight.style.display = "block"; inputPesoSeco?.focus(); }
}
function clearCalcFields(){
  if (inputPesoSeco) inputPesoSeco.value = "";
  if (resultPeso) resultPeso.textContent = "";
}
function openCalcModal(){
  if (!modalEl || !backdropEl) return;
  modalEl.style.display = "grid";
  backdropEl.style.display = "block";
  showView("menu");
  setTimeout(()=> modalEl.querySelector("h3, .calc-type")?.focus(), 0);
  document.addEventListener("keydown", onEscClose);
}
function closeCalcModal(){
  if (!modalEl || !backdropEl) return;
  modalEl.style.display = "none";
  backdropEl.style.display = "none";
  clearCalcFields();
  document.removeEventListener("keydown", onEscClose);
}
backdropEl?.addEventListener("click", closeCalcModal);

// APIs globais para o HTML
window.openCalcModal = openCalcModal;
window.closeCalcModal = closeCalcModal;
window.showCalc = function(kind){ if (kind === "weight") showView("weight"); };
window.goBackToMenu = function(){ clearCalcFields(); showView("menu"); };
window.calcularPesoMaximo = function(){
  const seco = parseFloat(inputPesoSeco?.value);
  if (isNaN(seco) || seco <= 0) {
    resultPeso.textContent = "Informe um peso seco válido.";
    return;
  }
  // regra prática: ganho máximo ≈ 3,5% do peso seco
  const max = seco * 0.035;
  resultPeso.textContent =
    `Entre sessões, recomenda-se manter o ganho de peso em até ~3,5% do peso seco. ` +
    `Para ${seco.toFixed(1)} kg, isso dá cerca de ${max.toFixed(1)} kg. ` +
    `Converse com sua equipe de saúde para individualizar esse valor.`;
};

/* =========================================================
   6) Controle de fonte do CHAT (A+ / A-)
   ========================================================= */
function clamp(val, min, max){ return Math.min(Math.max(val, min), max); }
function getChatFontPx(){
  const chat = document.getElementById("chat-window");
  if (!chat) return 14;
  const v = getComputedStyle(chat).getPropertyValue("--chat-fs").trim();
  const n = parseFloat(v);
  return isNaN(n) ? 14 : n;
}
function setChatFontPx(px){
  const chat = document.getElementById("chat-window");
  if (!chat) return;
  chat.style.setProperty("--chat-fs", `${px}px`);
}
window.increaseChatFontSize = function(){
  const cur = getChatFontPx();
  const next = clamp(cur + 1.5, 12, 22);
  setChatFontPx(next);
};
window.decreaseChatFontSize = function(){
  const cur = getChatFontPx();
  const next = clamp(cur - 1.5, 12, 22);
  setChatFontPx(next);
};

/* =========================================================
   7) Chat: abrir/fechar/expandir/minimizar
   ========================================================= */
const chatWin = document.getElementById("chat-window");
function isMobile(){ return window.matchMedia("(max-width: 768px)").matches; }

function reallyOpenChat(){
  if (!chatWin) return;
  chatWin.style.display = "flex";
  if (isMobile()) document.body.classList.add("noscroll");
}
function reallyCloseChat(){
  if (!chatWin) return;
  chatWin.classList.remove("expanded");
  chatWin.style.display = "none";
  document.body.classList.remove("noscroll");
}
window.openChat  = reallyOpenChat;   // <— use SEMPRE para abrir
window.closeChat = reallyCloseChat;  // <— minimiza/fecha

// mantive o expandir (toggle fullscreen)
window.toggleExpandChat = function(){
  if (!chatWin) return;
  const expanded = chatWin.classList.toggle("expanded");
  if (expanded && isMobile()) document.body.classList.add("noscroll");
  else document.body.classList.remove("noscroll");
};

/* =========================================================
   Helpers de parsing para mensagens do usuário
   ========================================================= */
function looksLikeList(text){
  return /(?:^|\n)\s*(?:•|-|\*|\d+\))/m.test(text) || /•/.test(text);
}
function joinSoftLineBreaks(text){
  return text.replace(/\r\n/g,"\n").replace(/\n(?!\s*(?:•|-|\*|\d+\)))/g," ");
}
function splitIntoTopics(raw){
  const text = joinSoftLineBreaks(raw).trim();
  const { intro, items } = parseBullets(text);
  return { intro, topics: items };
}
function formatTopicsNumbered(intro, topics){
  const introLine = intro ? `${intro}\n\n` : "";
  const list = topics.map((t,i)=>`${i+1}. ${t}`).join("\n");
  return introLine + list;
}
