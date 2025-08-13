const chatIcon = document.getElementById('chat-icon');
const chatWidget = document.getElementById('chat-widget');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// // Toggle chat box
// chatIcon.addEventListener('click', () => {
//   chatWidget.classList.toggle('open');
// });

// // Close chat
// closeChat.addEventListener('click', () => {
//   chatWidget.classList.remove('open');
// });


const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const chat = document.getElementById('chat');
const form = document.getElementById('inputForm');
const input = document.getElementById('message');

chatToggle.addEventListener('click', () => {
  chatContainer.classList.toggle('open');
});

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = 'message ' + sender;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  input.value = '';

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message})
    });
    const data = await res.json();
    addMessage(data.reply || data.error, 'bot');
  } catch (err) {
    addMessage('Virhe: ' + err.message, 'bot');
  }
});

