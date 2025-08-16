// Elements
const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");
const chatClose  = document.getElementById("chat-close");
const sendBtn    = document.getElementById("send-btn");
const userInput  = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

// ---------- Open / Close ----------
function openChat() {
  chatWindow.classList.add("show");
  chatBubble.style.display = "none";   // hide bubble while chat is open
}
function closeChat() {
  chatWindow.classList.remove("show");
  chatBubble.style.display = "flex";   // restore bubble
}

// Desktop mouse click
chatBubble.addEventListener("click", openChat);
chatClose.addEventListener("click", closeChat);

// ---------- Send message ----------
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
  .then(res => res.json())
  .then(data => addMessage("bot", data.reply || "Ei vastausta"))
  .catch(() => addMessage("bot", "Virhe palvelimella"));
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ---------- Message rendering ----------
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = "message " + role;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ---------- Mobile vh fix (Safari/Chrome toolbars) ----------
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("load", setVH);
window.addEventListener("resize", setVH);

// ---------- Orientation notice (portrait by default) ----------
function checkOrientation() {
  if (window.innerWidth > window.innerHeight && window.innerWidth < 800) {
    // mobile landscape
    if (chatWindow.classList.contains("show")) closeChat();
    alert("Please rotate your phone to portrait mode for the best chat experience.");
  }
}
window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);

// ---------- Draggable bubble (mouse + touch) with tap-to-open ----------
let dragging = false;
let startX = 0, startY = 0;
let offsetX = 0, offsetY = 0;
const TAP_THRESHOLD = 6;   // px: movement below this counts as a tap

// Mouse drag
chatBubble.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  const rect = chatBubble.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  chatBubble.style.transition = "none";
});
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  moveBubble(e.clientX, e.clientY);
});
document.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  const moved = Math.abs(e.clientX - startX) > TAP_THRESHOLD || Math.abs(e.clientY - startY) > TAP_THRESHOLD;
  dragging = false;
  chatBubble.style.transition = "";
  if (!moved) {
    // treat as click if not moved enough
    openChat();
  }
});

// Touch drag + tap
chatBubble.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  dragging = true;
  startX = t.clientX;
  startY = t.clientY;
  const rect = chatBubble.getBoundingClientRect();
  offsetX = t.clientX - rect.left;
  offsetY = t.clientY - rect.top;
  chatBubble.style.transition = "none";
}, { passive: true });

chatBubble.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const t = e.touches[0];
  moveBubble(t.clientX, t.clientY);
  // prevent page scroll while dragging
  e.preventDefault();
}, { passive: false });

chatBubble.addEventListener("touchend", (e) => {
  if (!dragging) return;
  dragging = false;
  chatBubble.style.transition = "";
  const t = (e.changedTouches && e.changedTouches[0]) || null;
  const endX = t ? t.clientX : startX;
  const endY = t ? t.clientY : startY;
  const moved = Math.abs(endX - startX) > TAP_THRESHOLD || Math.abs(endY - startY) > TAP_THRESHOLD;
  if (!moved) {
    // tap = open chat
    openChat();
  }
}, { passive: true });

// Keep bubble inside viewport and update position
function moveBubble(clientX, clientY) {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const rect = chatBubble.getBoundingClientRect();

  let left = clientX - offsetX;
  let top  = clientY - offsetY;

  if (left < 0) left = 0;
  if (top  < 0) top = 0;
  if (left + rect.width > winW) left = winW - rect.width;
  if (top + rect.height > winH) top = winH - rect.height;

  chatBubble.style.left = left + "px";
  chatBubble.style.top  = top  + "px";
  chatBubble.style.right = "auto";
  chatBubble.style.bottom = "auto";
}
