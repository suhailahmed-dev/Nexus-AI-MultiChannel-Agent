(function() {
  const currentScript = document.currentScript;
  const clientId = currentScript.getAttribute('data-client-id') || 'fashion-pk';
  const serverUrl = currentScript.src.replace('/widget.js', '');

  let sessionId = 'web-session-' + Math.random().toString(36).substring(2, 9);

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .nexus-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 62px;
      height: 62px;
      background: linear-gradient(135deg, #25D366, #128C7E);
      border-radius: 50%;
      box-shadow: 0 8px 24px rgba(18, 140, 126, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .nexus-widget-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 28px rgba(18, 140, 126, 0.5);
    }
    .nexus-widget-btn svg {
      width: 32px;
      height: 32px;
      fill: #ffffff;
    }
    .nexus-chat-window {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      height: 540px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      animation: nexusSlideUp 0.3s ease-out;
    }
    @keyframes nexusSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .nexus-header {
      background: #075E54;
      color: #fff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nexus-header-title {
      font-weight: 600;
      font-size: 15px;
    }
    .nexus-status {
      font-size: 12px;
      opacity: 0.85;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nexus-status::before {
      content: "";
      width: 8px;
      height: 8px;
      background: #25D366;
      border-radius: 50%;
      display: inline-block;
    }
    .nexus-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #ECE5DD;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .nexus-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .nexus-msg.user {
      align-self: flex-end;
      background: #DCF8C6;
      color: #000;
      border-bottom-right-radius: 2px;
    }
    .nexus-msg.model {
      align-self: flex-start;
      background: #ffffff;
      color: #000;
      border-bottom-left-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .nexus-input-area {
      padding: 12px;
      background: #f0f0f0;
      display: flex;
      gap: 8px;
      border-top: 1px solid #e0e0e0;
    }
    .nexus-input {
      flex: 1;
      border: 1px solid #ccc;
      border-radius: 24px;
      padding: 10px 16px;
      outline: none;
      font-size: 14px;
      background: #fff;
    }
    .nexus-send-btn {
      background: #075E54;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .nexus-send-btn:hover {
      background: #128C7E;
    }
    .nexus-send-btn svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }
  `;
  document.head.appendChild(style);

  // Inject Widget DOM
  const widgetBtn = document.createElement('div');
  widgetBtn.className = 'nexus-widget-btn';
  widgetBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
    </svg>
  `;

  const chatWindow = document.createElement('div');
  chatWindow.className = 'nexus-chat-window';
  chatWindow.innerHTML = `
    <div class="nexus-header">
      <div>
        <div class="nexus-header-title">24/7 AI Sales Assistant</div>
        <div class="nexus-status">Online</div>
      </div>
      <button style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;" id="nexusCloseBtn">✕</button>
    </div>
    <div class="nexus-messages" id="nexusMessages">
      <div class="nexus-msg model">
        Assalam-o-Alaikum! Welcome! How can our AI assistant help you today?
      </div>
    </div>
    <div class="nexus-input-area">
      <input type="text" class="nexus-input" id="nexusInput" placeholder="Type a message (English ya Roman Urdu)..." />
      <button class="nexus-send-btn" id="nexusSendBtn">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(widgetBtn);
  document.body.appendChild(chatWindow);

  // Toggle Chat
  widgetBtn.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
  });

  document.getElementById('nexusCloseBtn').addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  // Send Message Logic
  const input = document.getElementById('nexusInput');
  const sendBtn = document.getElementById('nexusSendBtn');
  const messagesBox = document.getElementById('nexusMessages');

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Append User Message
    const userBubble = document.createElement('div');
    userBubble.className = 'nexus-msg user';
    userBubble.textContent = text;
    messagesBox.appendChild(userBubble);
    input.value = '';
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Loading indicator
    const loader = document.createElement('div');
    loader.className = 'nexus-msg model';
    loader.textContent = 'Typing...';
    messagesBox.appendChild(loader);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const res = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          sessionId: sessionId,
          message: text
        })
      });
      const data = await res.json();
      loader.textContent = data.reply;
    } catch (err) {
      loader.textContent = "Sorry, unable to connect to the agent right now.";
    }
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
