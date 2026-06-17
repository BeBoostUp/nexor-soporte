/* Nexor Soporte — Chat widget embed
   Uso: <script src="https://nexor-soporte.vercel.app/embed.js" defer></script>
*/
(function(){
  if (window.__nexorChatLoaded) return;
  window.__nexorChatLoaded = true;

  var ENDPOINT = 'https://nexor-soporte.vercel.app/api/chat';
  var LOGO = 'https://nexor-soporte.vercel.app/octopus-v2.png';

  // ────── FONT ──────
  if (!document.querySelector('link[data-nexor-font]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.nexorFont = '1';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // ────── STYLES ──────
  var css = `
  .nx-chat, .nx-chat * { box-sizing: border-box; }
  /* Wrapper fijo en el borde: NO se mueve, así el hover es estable */
  .nx-fab-zone {
    position: fixed; bottom: 120px; right: 0; z-index: 2147483646;
    width: 40px; height: 64px;
    display: flex; align-items: center; justify-content: flex-end;
    overflow: visible;
  }
  .nx-fab {
    width: 64px; height: 64px; border-radius: 50%;
    background: #080808; color: #080808;
    border: 2px solid #b5e835;
    cursor: pointer; padding: 0; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 28px rgba(181,232,53,0.25), 0 4px 12px rgba(0,0,0,0.35);
    transform: translateX(28px);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s;
    font-family: 'DM Sans', sans-serif;
  }
  .nx-fab-zone:hover .nx-fab,
  .nx-fab.open {
    transform: translateX(-16px);
    box-shadow: 0 12px 32px rgba(181,232,53,0.55), 0 4px 12px rgba(0,0,0,0.4);
  }
  .nx-fab.open { background: #141414; }
  .nx-fab .nx-open { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
  .nx-fab .nx-close { width: 22px; height: 22px; display: none; color: #b5e835; pointer-events: none; }
  .nx-fab.open .nx-open { display: none; }
  .nx-fab.open .nx-close { display: block; }
  .nx-panel {
    position: fixed; bottom: 100px; right: 24px; z-index: 2147483647;
    width: 380px; max-width: calc(100vw - 32px);
    height: 580px; max-height: calc(100vh - 130px);
    background: #0f0f0f;
    border: 1px solid rgba(181,232,53,0.25);
    border-radius: 18px;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.55);
    opacity: 0; transform: translateY(16px) scale(0.98);
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.22s ease;
    font-family: 'DM Sans', sans-serif; color: #fff;
    line-height: 1.5;
  }
  .nx-panel.open { opacity: 1; transform: none; pointer-events: auto; }
  .nx-header {
    padding: 1rem 1.2rem;
    background: linear-gradient(145deg, rgba(181,232,53,0.12), rgba(20,20,20,0.6));
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 0.8rem;
  }
  .nx-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: #080808;
    border: 1.5px solid #b5e835;
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .nx-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .nx-hname { font-weight: 600; font-size: 0.95rem; color: #fff; }
  .nx-hstatus { font-size: 0.75rem; color: #b5e835; display: flex; align-items: center; gap: 0.35rem; }
  .nx-hstatus::before {
    content: ''; width: 7px; height: 7px; background: #b5e835; border-radius: 50%;
    box-shadow: 0 0 8px #b5e835;
    animation: nx-blink 2s infinite;
  }
  @keyframes nx-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .nx-messages {
    flex: 1; overflow-y: auto; padding: 1.2rem;
    display: flex; flex-direction: column; gap: 0.7rem;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;
  }
  .nx-messages::-webkit-scrollbar { width: 6px; }
  .nx-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
  .nx-msg {
    max-width: 85%; padding: 0.7rem 0.95rem; border-radius: 14px;
    font-size: 0.9rem; word-wrap: break-word; white-space: pre-wrap;
    animation: nx-in 0.25s ease;
  }
  @keyframes nx-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  .nx-msg.bot { align-self: flex-start; background: rgba(255,255,255,0.06); color: #ccc; border-bottom-left-radius: 4px; }
  .nx-msg.user { align-self: flex-end; background: #b5e835; color: #080808; font-weight: 500; border-bottom-right-radius: 4px; }
  .nx-msg strong { color: #fff; }
  .nx-msg.bot strong { color: #b5e835; }
  .nx-typing {
    align-self: flex-start; background: rgba(255,255,255,0.06);
    padding: 0.85rem 1rem; border-radius: 14px; border-bottom-left-radius: 4px;
    display: flex; gap: 4px;
  }
  .nx-typing span { width: 7px; height: 7px; border-radius: 50%; background: #aaa; animation: nx-typ 1.3s infinite; }
  .nx-typing span:nth-child(2) { animation-delay: 0.18s; }
  .nx-typing span:nth-child(3) { animation-delay: 0.36s; }
  @keyframes nx-typ { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
  .nx-iwrap {
    padding: 0.8rem; border-top: 1px solid rgba(255,255,255,0.07);
    background: #141414;
    display: flex; gap: 0.5rem; align-items: flex-end;
  }
  .nx-input {
    flex: 1; background: rgba(8,8,8,0.6);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
    padding: 0.7rem 0.9rem; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.92rem;
    outline: none; resize: none; max-height: 120px; min-height: 42px;
    transition: border-color 0.2s;
  }
  .nx-input:focus { border-color: rgba(181,232,53,0.4); }
  .nx-input::placeholder { color: #777; }
  .nx-send {
    width: 42px; height: 42px; background: #b5e835; color: #080808;
    border: none; border-radius: 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s; flex-shrink: 0;
  }
  .nx-send:hover:not(:disabled) { background: #c8f53e; }
  .nx-send:disabled { opacity: 0.5; cursor: not-allowed; }
  .nx-send svg { width: 18px; height: 18px; }
  .nx-foot {
    text-align: center; padding: 0.5rem; font-size: 0.7rem;
    color: #777; background: #0f0f0f; border-top: 1px solid rgba(255,255,255,0.05);
  }
  .nx-foot b { color: #b5e835; font-weight: 600; }
  @media (max-width: 500px) {
    .nx-panel { right: 12px; left: 12px; bottom: 90px; width: auto; }
    .nx-fab { right: 16px; bottom: 16px; }
  }
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ────── DOM ──────
  var wrap = document.createElement('div');
  wrap.className = 'nx-chat';
  wrap.innerHTML =
    '<div class="nx-fab-zone">' +
      '<button class="nx-fab" id="nxFab" aria-label="Abrir chat de soporte">' +
        '<img class="nx-open" src="' + LOGO + '" alt="Soporte Nexor">' +
        '<svg class="nx-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="nx-panel" id="nxPanel" role="dialog" aria-label="Chat de soporte Nexor">' +
      '<div class="nx-header">' +
        '<div class="nx-avatar"><img src="' + LOGO + '" alt="Soporte Nexor"></div>' +
        '<div style="flex:1;min-width:0"><div class="nx-hname">Soporte Nexor</div><div class="nx-hstatus">En línea</div></div>' +
      '</div>' +
      '<div class="nx-messages" id="nxMessages"></div>' +
      '<form class="nx-iwrap" id="nxForm" autocomplete="off">' +
        '<textarea class="nx-input" id="nxInput" rows="1" placeholder="Escribe tu mensaje..." required></textarea>' +
        '<button type="submit" class="nx-send" id="nxSend" aria-label="Enviar">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</form>' +
      '<div class="nx-foot">Powered by <b>NexorCRM</b></div>' +
    '</div>';

  function init(){
    document.body.appendChild(wrap);

    var fab = document.getElementById('nxFab');
    var panel = document.getElementById('nxPanel');
    var messages = document.getElementById('nxMessages');
    var form = document.getElementById('nxForm');
    var input = document.getElementById('nxInput');
    var sendBtn = document.getElementById('nxSend');

    var sessionId = localStorage.getItem('nexor_chat_session');
    if(!sessionId){
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2,10);
      localStorage.setItem('nexor_chat_session', sessionId);
    }

    function open(){
      panel.classList.add('open'); fab.classList.add('open');
      if(!messages.children.length){
        addMsg('bot', '¡Hola! Soy el agente de soporte de Nexor. ¿En qué te echo una mano?');
      }
      setTimeout(function(){ input.focus(); }, 200);
    }
    function close(){ panel.classList.remove('open'); fab.classList.remove('open'); }
    fab.addEventListener('click', function(){ panel.classList.contains('open') ? close() : open(); });

    function esc(s){ return s.replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];}); }
    function fmt(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'); }
    function addMsg(role, text){
      var d = document.createElement('div'); d.className = 'nx-msg ' + role;
      d.innerHTML = role === 'bot' ? fmt(text) : esc(text);
      messages.appendChild(d); messages.scrollTop = messages.scrollHeight;
    }
    function showTyping(){
      var t = document.createElement('div'); t.className='nx-typing'; t.id='nxTyping';
      t.innerHTML='<span></span><span></span><span></span>';
      messages.appendChild(t); messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping(){ var t=document.getElementById('nxTyping'); if(t) t.remove(); }

    input.addEventListener('input', function(){
      input.style.height='auto'; input.style.height=Math.min(input.scrollHeight,120)+'px';
    });
    input.addEventListener('keydown', function(e){
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); form.requestSubmit(); }
    });

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var text = input.value.trim(); if(!text) return;
      addMsg('user', text); input.value=''; input.style.height='auto';
      sendBtn.disabled = true; showTyping();
      try {
        var res = await fetch(ENDPOINT, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            sessionId: sessionId, message: text,
            source: 'ghl-embed', referer: location.href,
            timestamp: new Date().toISOString()
          })
        });
        var raw = await res.text(); var data;
        try { data = JSON.parse(raw); } catch(_){ data = { output: raw }; }
        hideTyping();
        var reply = data.output || data.reply || data.message || data.text || (typeof data === 'string' ? data : 'Recibido. Te respondo en un momento.');
        addMsg('bot', reply);
      } catch(err){
        hideTyping();
        addMsg('bot', 'Ups, no he podido conectar con el servidor. Inténtalo otra vez en unos segundos.');
      } finally {
        sendBtn.disabled = false; input.focus();
      }
    });

    // expose
    window.NexorChat = { open: open, close: close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
