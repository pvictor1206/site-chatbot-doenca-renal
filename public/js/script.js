// script.js — imagens locais + vídeos YouTube via mapa no código + LIGHTBOX + LISTAS BONITAS (sem fallback, sem áudio)

import { db } from './firebase-init.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================================================
   0) Normalização
   ========================================================= */
function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/* =========================================================
   1) Mapa de ASSETS (ajuste caminhos conforme sua /img)
   ========================================================= */
const ASSETS = {
  "chat/diabetes": "../img/chat/image17.png",

  "chat/sintomas": "../img/chat/image5.png",
  "chat/sintomas": "../img/chat/image8.png",
  "chat/sintomas": "../img/chat/image10.png",
  "chat/sintomas": "../img/chat/image9.png",

  "chat/exames": "../img/chat/image7.png",

  "chat/tratamentos": "../img/chat/image1.png",
  "chat/tratamentos": "../img/chat/image13.png",

  "chat/hemodialise": "../img/chat/image13.png",

  "chat/acessos": "../img/chat/image2.png",
  "chat/acessos": "../img/chat/image15.png",

  "chat/cuidados": "../img/chat/image16.png",

  "chat/emocional": "../img/chat/image14.png",

 
};

/* =========================================================
   1.1) Pergunta -> IMAGENS (SEM fallback)
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
   1.2) Pergunta -> VÍDEOS do YouTube (SEM fallback, só no código)
   Todas apontam para: https://www.youtube.com/watch?v=p-mXfadnpZI
   ========================================================= */
const QUESTION_VIDEO_RAW = {
  "Como faço para seguir o tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "O que posso fazer para não falhar no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Quais meus cuidados quando faço hemodiálise?": ["p-mXfadnpZI"],
  "Dicas para seguir firme no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Como manter o comprometido com a hemodiálise?": ["p-mXfadnpZI"],
  "O que preciso fazer no tratamento de hemodiálise?": ["p-mXfadnpZI"],
  "Como posso me manter - tratamento de hemodiálise?": ["p-mXfadnpZI"],

  "Como deve ser o estilo de vida/ou dia a dia da pessoa que realiza hemodiálise?": ["GLOPWxBZ7TM"],
  "Como é o dia a dia de alguém que faz hemodiálise?": ["GLOPWxBZ7TM"],
  "Quais são as mudanças no estilo de vida para quem precisa de hemodiálise?": ["GLOPWxBZ7TM"],
  "Como a rotina diária muda para uma pessoa em tratamento de hemodiálise?": ["GLOPWxBZ7TM"],
  "O que é necessário para adaptar o estilo de vida quando se faz hemodiálise": ["GLOPWxBZ7TM"],  

  "Como deve ser a alimentação de pessoas que realizam hemodiálise?": ["tiASHRuCJls"],
  "Qual é a dieta recomendada para pessoas que fazem hemodiálise?": ["tiASHRuCJls"],
  "Como deve ser a alimentação de alguém que está em tratamento de hemodiálise?": ["tiASHRuCJls"],
  "Que tipo de comida é melhor para quem precisa de hemodiálise?": ["tiASHRuCJls"],
  "O que as pessoas que fazem hemodiálise devem comer para se manterem saudáveis?": ["tiASHRuCJls"],

  "Como saber a quantidade de líquido que pode ser ingerida por dia para quem realiza hemodiálise?": ["--Zu7zX7N8E"],
  "Qual é a quantidade segura de líquidos que uma pessoa em hemodiálise pode beber por dia?": ["--Zu7zX7N8E"],
  "Qual é o limite diário recomendado de líquidos para quem está em tratamento de hemodiálise?": ["--Zu7zX7N8E"],
  "Como saber quanto líquido é seguro para uma pessoa em hemodiálise consumir diariamente?": ["--Zu7zX7N8E"],
  "Qual é a quantidade ideal de água que uma pessoa em tratamento de hemodiálise deve ingerir todos os dias?": ["--Zu7zX7N8E"],
  "Como posso calcular a quantidade correta de líquidos que devo beber por dia se estou em hemodiálise?": ["--Zu7zX7N8E"],

  "Como aliviar a sede em pessoas com restrição de líquidos?": ["-79LGgPbkU8"],
  "Dicas para consumo de líquidos": ["-79LGgPbkU8"],
  "Dicas para aliviar a sede": ["-79LGgPbkU8"],
  "Como diminuir a sede sem poder beber água?": ["-79LGgPbkU8"],

  "O que é a fístula arteriovenosa (FAV)?": ["XM5sCXTrIik"],
  "O que é essa tal de fístula arteriovenosa?": ["XM5sCXTrIik"],
  "Como funciona uma fístula arteriovenosa?": ["XM5sCXTrIik"],
  "O que exatamente é uma FAV?": ["XM5sCXTrIik"],
  "O que significa essa fístula arteriovenosa?": ["XM5sCXTrIik"],
  "Que negócio é esse de fístula arteriovenosa?": ["XM5sCXTrIik"],
  "O que seria uma fístula arteriovenosa?": ["XM5sCXTrIik"],
  "O que é uma Fístula Arteriovenosa para hemodiálise?": ["XM5sCXTrIik"],

  "Como cuidar da fístula arteriovenosa?": ["fI9efWh_xTU"],
  "Como posso cuidar do meu acesso para hemodiálise?": ["fI9efWh_xTU"],
  "Quais são os cuidados necessários para minha fístula arteriovenosa?": ["fI9efWh_xTU"],
  "O que devo fazer para manter minha fístula em boa condição?": ["fI9efWh_xTU"],
  "Como garantir que minha fístula para diálise funcione corretamente?": ["fI9efWh_xTU"],
  "Quais são os passos para cuidar da minha fístula arteriovenosa em casa?": ["fI9efWh_xTU"],

  "Quais os cuidados com o cateter venoso central?": ["1t6ILKI_6ck"],
  "Quais são os cuidados necessários com um cateter venoso central?": ["1t6ILKI_6ck"],
  "Como devo cuidar de um cateter venoso central em casa?": ["1t6ILKI_6ck"],
  "O que devo fazer para evitar infecções no cateter venoso central?": ["1t6ILKI_6ck"],
  "Com que frequência devo limpar o cateter venoso central e como faço isso?": ["1t6ILKI_6ck"],
  "Quais sinais de problemas devo observar no cateter venoso central?": ["1t6ILKI_6ck"],
  "Quais cuidados diários são necessários para quem usa um cateter venoso central?": ["1t6ILKI_6ck"],
  "O que é o cateter venoso central para hemodiálise?": ["1t6ILKI_6ck"],
  "O que é um cateter venoso central usado na hemodiálise?": ["1t6ILKI_6ck"],
  "Para que serve um cateter venoso central na hemodiálise?": ["1t6ILKI_6ck"],
  "Como funciona um cateter venoso central na hemodiálise?": ["1t6ILKI_6ck"],
  "Qual é a função do cateter venoso central em pacientes que fazem hemodiálise?": ["1t6ILKI_6ck"],
  "Por que se usa um cateter venoso central na hemodiálise?": ["1t6ILKI_6ck"],
  "O que é um cateter venoso central e como ele ajuda na hemodiálise?": ["1t6ILKI_6ck"],
  "Quais são os benefícios de usar um cateter venoso central para hemodiálise?": ["1t6ILKI_6ck"],
  "Como é o procedimento para colocar um cateter venoso central para hemodiálise?": ["1t6ILKI_6ck"],
  "Um cateter venoso central é seguro para a hemodiálise?": ["1t6ILKI_6ck"],
  "Como garantir que o cateter venoso central está funcionando corretamente?": ["1t6ILKI_6ck"],

  "Quais os cuidados com o curativo do cateter para hemodiálise?": ["zjRKTzaiYmU"],
  "Como faço para cuidar do curativo do cateter?": ["zjRKTzaiYmU"],
  "Como é o cuidado com o curativo do cateter de hemodiálise?": ["zjRKTzaiYmU"],
  "Tem algum cuidado especial com o curativo do cateter de hemodiálise?": ["zjRKTzaiYmU"],
  "Como que eu faço para cuidar do curativo do cateter de hemodiálise?": ["zjRKTzaiYmU"],
  "O que tenho que fazer com o curativo do cateter central?": ["zjRKTzaiYmU"],
  "Quais são os cuidados com o curativo do cateter de hemodiálise?": ["zjRKTzaiYmU"],

  "Quais os cuidados com as medicações?": ["LMC7cjPIXSA"],

  "Faço hemodiálise preciso ser acompanhado por outros profissionais da saúde?": ["h-Dzl6IJ4DA"],
  "Se eu faço hemodiálise, preciso de acompanhamento de outros profissionais de saúde?": ["h-Dzl6IJ4DA"],
  "Quem faz hemodiálise tem que ser acompanhado por outros profissionais?": ["h-Dzl6IJ4DA"],
  "Preciso de outros profissionais de saúde me acompanhando, se faço hemodiálise?": ["h-Dzl6IJ4DA"],
  "Faço hemodiálise, é necessário ter acompanhamento de outros especialistas?": ["h-Dzl6IJ4DA"],
  "Quem faz hemodiálise precisa do suporte de outros profissionais da saúde?": ["h-Dzl6IJ4DA"],
  "Se eu estou fazendo hemodiálise, é importante ter outros profissionais acompanhando?": ["h-Dzl6IJ4DA"],
  "Quem faz hemodiálise tem que ter acompanhamento de mais profissionais da saúde?": ["h-Dzl6IJ4DA"],
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
  return tokens.flatMap(t => {
    const key = t.startsWith("asset:") ? t.slice(6) : t;
    const url = ASSETS[key];
    if (!url) { console.warn(`[chat] imagem não mapeada: "${t}"`); return []; }
    return [url];
  });
}

function toYouTubeEmbedUrl(idOrUrl) {
  if (!idOrUrl) return null;
  let id = idOrUrl.trim();
  try {
    const u = new URL(idOrUrl);
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.replace("/", "");
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        id = u.searchParams.get("v") || idOrUrl;
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/").pop();
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/").pop();
      }
    }
  } catch { /* não era URL, trata como ID */ }
  id = (id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
function resolveVideoEmbeds(tokens = []) {
  return tokens.map(toYouTubeEmbedUrl).filter(Boolean);
}

/* =========================================================
   1.4) LIGHTBOX (ampliar imagem com zoom/pan)
   ========================================================= */
let _lb, _zoom = 1, _tx = 0, _ty = 0, _drag = false, _lastX = 0, _lastY = 0;

function ensureLightbox() {
  if (_lb) return _lb;

  const root = document.createElement('div');
  root.id = 'img-lightbox';
  root.setAttribute('aria-hidden', 'true');
  Object.assign(root.style, { position: 'fixed', inset: '0', zIndex: '9999', display: 'none' });

  const backdrop = document.createElement('div');
  Object.assign(backdrop.style, {
    position: 'absolute', inset: '0',
    background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(2px)'
  });
  backdrop.addEventListener('click', closeImageLightbox);

  const content = document.createElement('div');
  Object.assign(content.style, {
    position: 'absolute', inset: '24px',
    display: 'grid', placeItems: 'center', boxSizing: 'border-box'
  });

  const img = document.createElement('img');
  img.alt = '';
  Object.assign(img.style, {
    maxWidth: '90vw', maxHeight: '82vh',
    userSelect: 'none', cursor: 'grab',
    transition: 'transform .05s linear', willChange: 'transform'
  });

  // toolbar
  const toolbar = document.createElement('div');
  Object.assign(toolbar.style, {
    position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)',
    display: 'flex', gap: '8px',
    background: 'rgba(18,18,18,.8)', padding: '8px',
    borderRadius: '12px', boxShadow: '0 6px 24px rgba(0,0,0,.3)'
  });

  function mkBtn(label, act, bg = '#fff', color = '#000') {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.act = act;
    Object.assign(b.style, {
      appearance: 'none', border: 'none',
      padding: '8px 12px', borderRadius: '10px',
      background: bg, color, fontWeight: '700', cursor: 'pointer'
    });
    b.addEventListener('mouseenter', () => b.style.filter = 'brightness(.95)');
    b.addEventListener('mouseleave', () => b.style.filter = 'none');
    return b;
  }
  toolbar.appendChild(mkBtn('–', 'zoomOut'));
  toolbar.appendChild(mkBtn('+', 'zoomIn'));
  toolbar.appendChild(mkBtn('100%', 'reset'));
  toolbar.appendChild(mkBtn('×', 'close', '#ff4d4f', '#fff'));

  toolbar.addEventListener('click', (e) => {
    const act = e.target?.dataset?.act;
    if (!act) return;
    if (act === 'close') closeImageLightbox();
    if (act === 'zoomIn') setZoom(_zoom * 1.2);
    if (act === 'zoomOut') setZoom(_zoom / 1.2);
    if (act === 'reset') resetZoom();
  });

  // teclado
  document.addEventListener('keydown', (e) => {
    if (root.style.display === 'none') return;
    if (e.key === 'Escape') closeImageLightbox();
    if (e.key === '+') setZoom(_zoom * 1.2);
    if (e.key === '-') setZoom(_zoom / 1.2);
    if (e.key === '0') resetZoom();
  });

  // zoom via scroll
  content.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1/1.12 : 1.12;
    setZoom(_zoom * factor);
  }, { passive: false });

  // pan (arrastar)
  content.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    _drag = true;
    _lastX = e.clientX; _lastY = e.clientY;
    content.setPointerCapture(e.pointerId);
    img.style.cursor = 'grabbing';
  });
  content.addEventListener('pointermove', (e) => {
    if (!_drag) return;
    const dx = e.clientX - _lastX;
    const dy = e.clientY - _lastY;
    _lastX = e.clientX; _lastY = e.clientY;
    _tx += dx; _ty += dy;
    applyTransform(img);
  });
  content.addEventListener('pointerup', (e) => {
    _drag = false;
    content.releasePointerCapture(e.pointerId);
    img.style.cursor = 'grab';
  });
  content.addEventListener('pointercancel', () => { _drag = false; img.style.cursor = 'grab'; });

  content.appendChild(img);
  root.appendChild(backdrop);
  root.appendChild(content);
  root.appendChild(toolbar);
  document.body.appendChild(root);

  _lb = { root, img };
  return _lb;
}

function openImageLightbox(src, alt = '') {
  const { root, img } = ensureLightbox();
  img.src = src;
  img.alt = alt || '';
  resetZoom();
  root.style.display = 'block';
  root.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeImageLightbox() {
  if (!_lb) return;
  _lb.root.style.display = 'none';
  _lb.root.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function setZoom(z) {
  _zoom = Math.min(Math.max(z, 0.3), 6);
  applyTransform(_lb?.img);
}
function resetZoom() { _zoom = 1; _tx = 0; _ty = 0; applyTransform(_lb?.img); }
function applyTransform(img) {
  if (!img) return;
  img.style.transformOrigin = 'center center';
  img.style.transform = `translate(${_tx}px, ${_ty}px) scale(${_zoom})`;
}

/* =========================================================
   1.5) DETECÇÃO E RENDER DE LISTAS (tópicos)
   - Converte respostas longas com "•" (ou -, *, 1) em UL bonitinha
   ========================================================= */
function detectBullets(text) {
  // detecta presença de marcadores comuns
  return /•|-|\*\s|\d+\)/.test(text);
}

function parseBullets(text) {
  // Divide introdução (antes do primeiro marcador) e itens
  // Aceita bullets inline: "... como: • item; • item; ..."
  const firstBulletIdx = text.search(/•|-|\*\s|\d+\)/);
  if (firstBulletIdx === -1) return { intro: text.trim(), items: [] };

  const intro = text.slice(0, firstBulletIdx).trim().replace(/[;,\s]+$/,'');
  const rest = text.slice(firstBulletIdx);

  // normaliza diferentes marcadores para "• " e quebra por esse padrão
  const normalized = rest
    .replace(/\r\n/g, "\n")
    .replace(/\d+\)\s*/g, "• ")
    .replace(/-\s*/g, "• ")
    .replace(/\*\s*/g, "• ")
    .replace(/\s*•\s*/g, "\n• "); // força quebra antes de cada "•"

  let parts = normalized.split(/\n•\s*/).map(s => s.trim()).filter(Boolean);

  // remove pontuação final redundante
  parts = parts.map(p => p.replace(/^[•\-\*\d\)]+\s*/,'').replace(/[;,\s]+$/,'').trim());

  return { intro, items: parts };
}

function renderBulletsHTML(intro, items) {
  if (!items || items.length === 0) return "";
  // bloco com UL estilizada inline (para não depender do CSS externo)
  const li = items.map(it => `<li>${escapeHtml(it)}</li>`).join("");
  const introHtml = intro ? `<div class="list-intro" style="font-weight:600;margin:0 0 .5rem 0;">${escapeHtml(intro)}</div>` : "";
  return `
    <div class="list-block" style="background:rgba(255,255,255,.08);padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.15)">
      ${introHtml}
      <ul class="list" style="margin:.25rem 0 0 1rem; padding:0; list-style:disc; display:grid; gap:.35rem;">
        ${li}
      </ul>
    </div>
  `;
}

function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* =========================================================
   1.6) Render de mensagem (texto + imagens + vídeos)
   ========================================================= */
function addBotMessageRich({ html = "", text = "", images = [], alts = [], videos = [] }) {
  const chat = document.getElementById('chat-body');
  const wrap = document.createElement('div');
  wrap.className = 'chat-message bot';

  // Texto/HTML com suporte a listas
  if (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    wrap.appendChild(div);
  } else if (text) {
    if (detectBullets(text)) {
      const { intro, items } = parseBullets(text);
      const listHtml = renderBulletsHTML(intro, items);
      const div = document.createElement('div');
      div.innerHTML = listHtml || escapeHtml(text);
      wrap.appendChild(div);
    } else {
      const p = document.createElement('p');
      p.textContent = text;
      wrap.appendChild(p);
    }
  }

  // Imagens (clicável para ampliar)
  if (images.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'img-grid';
    images.forEach((url, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'img-item';

      const img = document.createElement('img');
      img.src = url;
      img.alt = (alts[idx] || "").toString();
      img.loading = "lazy";
      img.decoding = "async";
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openImageLightbox(url, img.alt));

      fig.appendChild(img);

      if (alts[idx]) {
        const cap = document.createElement('figcaption');
        cap.textContent = alts[idx];
        fig.appendChild(cap);
      }

      grid.appendChild(fig);
    });
    wrap.appendChild(grid);
  }

  // Vídeos (grandes, responsivos)
  if (videos.length > 0) {
    const vlist = document.createElement('div');
    vlist.className = 'video-list';

    videos.forEach(embedUrl => {
      const vw = document.createElement('div');   // wrapper 16:9
      vw.className = 'video-wrapper';
      Object.assign(vw.style, {
        position: 'relative', width: '100%', aspectRatio: '16/9',
        background: '#000', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,.12)'
      });

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = "Vídeo educativo";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.setAttribute('allowfullscreen', '');
      Object.assign(iframe.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0' });

      vw.appendChild(iframe);
      vlist.appendChild(vw);
    });

    wrap.appendChild(vlist);
  }

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

// Compat: aceita só texto/HTML
function addBotMessage(message) {
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(message);
  addBotMessageRich({ html: looksHtml ? message : "", text: looksHtml ? "" : message });
}

/* =========================================================
   UI BÁSICA
   ========================================================= */
window.toggleChat = function toggleChat() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'flex' : 'none';
};
window.toggleExpandChat = function toggleExpandChat() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.classList.toggle('expanded');
};
window.toggleMinimizeChat = function toggleMinimizeChat() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.style.display = (chatWindow.style.display === 'none' || chatWindow.style.display === '') ? 'block' : 'none';
};

/* =========================================================
   Helpers de parsing para mensagens do USUÁRIO (opcional)
   — mantém suporte a listas digitadas pelo usuário
   ========================================================= */
function looksLikeList(text) {
  return /(?:^|\n)\s*(?:•|-|\*|\d+\))/m.test(text) || /•/.test(text);
}
function joinSoftLineBreaks(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n(?!\s*(?:•|-|\*|\d+\)))/g, " ");
}
function splitIntoTopics(raw) {
  const text = joinSoftLineBreaks(raw).trim();
  const { intro, items } = parseBullets(text);
  return { intro, topics: items };
}
function formatTopicsNumbered(intro, topics) {
  const introLine = intro ? `${intro}\n\n` : "";
  const list = topics.map((t, i) => `${i + 1}. ${t}`).join("\n");
  return introLine + list;
}

/* =========================================================
   2) Fluxo principal — busca Firestore e injeta mídia
   ========================================================= */
async function processUserMessage(message) {
  // Se o usuário enviar algo que já pareça lista, devolve formatado
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
      const perguntaCorreta = data.perguntas.find(pergunta =>
        normalizeText(pergunta).includes(normalizedMessage)
      );
      if (perguntaCorreta) {
        foundResponse = true;
        await handleResponse(docSnap, data, message, perguntaCorreta);
        break;
      }
    }
  }

  if (!foundResponse) {
    addBotMessage("Desculpe, ainda estou aprendendo. Você pode perguntar algo sobre saúde.");
  }
}

/* =========================================================
   3) Render da resposta + “saiba mais”
   ========================================================= */
async function handleResponse(doc, data, userMessage = "", perguntaCorreta = "") {
  const rawText = data.resposta || "Desculpe, não encontrei detalhes.";

  // Se a RESPOSTA do Firestore tiver bullets, renderiza como lista
  let htmlText = "";
  if (detectBullets(rawText)) {
    const { intro, items } = parseBullets(rawText);
    if (items.length > 0) htmlText = renderBulletsHTML(intro, items);
  }

  // IMAGENS: Firestore (se houver) senão mapa local
  let imageKeys = Array.isArray(data.imagens) ? data.imagens : [];
  if (imageKeys.length === 0) {
    const normQ = normalizeText(perguntaCorreta || userMessage);
    imageKeys = QUESTION_IMAGE_MAP[normQ] || [];
  }
  const alts = Array.isArray(data.alts) ? data.alts : [];
  const images = resolveAssetUrls(imageKeys);

  // VÍDEOS: somente do mapa local
  const normQ = normalizeText(perguntaCorreta || userMessage);
  const videoTokens = QUESTION_VIDEO_MAP[normQ] || [];
  const videos = resolveVideoEmbeds(videoTokens);

  addBotMessageRich({
    html: htmlText || "",
    text: htmlText ? "" : rawText,
    images, alts, videos
  });

  const hasExtraInfo = data.temExtraInfo && data.temExtraInfo.toLowerCase() === "sim";
  if (hasExtraInfo) {
    const encaminhamento = data.respostaEncaminhada;
    addExtraInfoButton(data.extraInfo, encaminhamento);
  }
}

function addExtraInfoButton(extraInfo, encaminhamento) {
  const chatBody = document.getElementById('chat-body');
  const extraButton = document.createElement('button');
  extraButton.classList.add('read-more-button');
  extraButton.textContent = extraInfo;

  extraButton.onclick = async () => {
    const querySnapshot = await getDocs(collection(db, "tabelaRespostas"));
    querySnapshot.forEach((docEnc) => {
      const dataEnc = docEnc.data();
      if (dataEnc.resposta === encaminhamento) {
        handleResponse(docEnc, dataEnc);
      }
    });
  };

  chatBody.appendChild(extraButton);
  chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================================================
   Utilidades diversas
   ========================================================= */
function addUserMessage(message) {
  const chatBody = document.getElementById('chat-body');
  const userMessage = document.createElement('div');
  userMessage.classList.add('chat-message', 'user');
  userMessage.textContent = message;
  chatBody.appendChild(userMessage);
  chatBody.scrollTop = chatBody.scrollHeight;
}

window.handleUserInput = function handleUserInput(event) {
  if (event.key === 'Enter') window.sendMessage();
};
window.sendMessage = function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message) {
    addUserMessage(message);
    input.value = '';
    processUserMessage(message);
  }
};

/* =========================================================
   Botões de assuntos/atalhos
   ========================================================= */
const toggleSubjectsBtn = document.getElementById('toggle-subjects-btn');
const subjectsContainer = document.getElementById('subjects-container');
const toggleIcon = document.getElementById('toggle-subjects-icon');

toggleSubjectsBtn.addEventListener('click', () => {
  if (subjectsContainer.style.display === 'none' || subjectsContainer.style.display === '') {
    subjectsContainer.style.display = 'flex';
    toggleIcon.classList.remove('fa-chevron-up');
    toggleIcon.classList.add('fa-chevron-down');
  } else {
    subjectsContainer.style.display = 'none';
    toggleIcon.classList.remove('fa-chevron-down');
    toggleIcon.classList.add('fa-chevron-up');
  }
});

document.querySelectorAll('.subject-btn').forEach(button => {
  button.addEventListener('click', () => {
    const assunto = button.textContent;
    addUserMessage(assunto);
    processUserMessage(assunto);
  });
});

document.querySelectorAll('.tool-button').forEach(button => {
  button.addEventListener('click', () => {
    const label = button.querySelector('p').textContent;
    toggleChat();
    addUserMessage(label);
    processUserMessage(label);
  });
});

/* =========================================================
   Modal de cálculo (inalterado)
   ========================================================= */
const modalEl      = document.getElementById('calc-modal');
const backdropEl   = document.getElementById('calc-backdrop');
const viewMenu     = document.getElementById('calc-view-menu');
const viewWeight   = document.getElementById('calc-view-weight');
const inputPeso    = document.getElementById('peso-seco');
const resultEl     = document.getElementById('resultado-calculo');

function openCalcModal(){
  modalEl.style.display = 'grid';
  backdropEl.style.display = 'block';
  showView('menu');
  setTimeout(() => modalEl.querySelector('h3, .calc-type')?.focus(), 0);
  document.addEventListener('keydown', onEscClose);
}
function closeCalcModal(){
  modalEl.style.display = 'none';
  backdropEl.style.display = 'none';
  clearFields();
  document.removeEventListener('keydown', onEscClose);
}
function onEscClose(e){ if(e.key === 'Escape') closeCalcModal(); }
backdropEl.addEventListener('click', closeCalcModal);
function clearFields(){ inputPeso.value = ''; resultEl.textContent = ''; }
function showView(which){
  viewMenu.style.display   = 'none';
  viewWeight.style.display = 'none';
  if(which === 'menu'){ viewMenu.style.display = 'block'; }
  else if(which === 'weight'){ viewWeight.style.display = 'block'; inputPeso.focus(); }
}
window.showCalc = function(kind){ if(kind === 'weight') showView('weight'); }
window.goBackToMenu = function(){ clearFields(); showView('menu'); }
window.openCalcModal = openCalcModal;
window.closeCalcModal = closeCalcModal;
window.calcularPesoMaximo = function () {
  const pesoSeco = parseFloat(inputPeso.value);
  if (!isNaN(pesoSeco) && pesoSeco > 0) {
    const resultado = (pesoSeco * 3) / 100;
    resultEl.textContent = `Você pode ganhar no máximo ${resultado.toFixed(2)} kg entre as sessões.`;
  } else {
    resultEl.textContent = 'Por favor, insira um valor válido para o peso seco.';
  }
};
