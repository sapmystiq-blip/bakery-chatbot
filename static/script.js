const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");
const chatClose = document.getElementById("chat-close");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

// === Open & Close ===
chatBubble.addEventListener("click", () => {
  chatWindow.classList.add("show");
  chatBubble.style.display = "none"; // hide bubble while chat open
});

chatClose.addEventListener("click", () => {
  chatWindow.classList.remove("show");
  chatBubble.style.display = "flex"; // restore bubble
});

// === Send message ===
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

// === Add message to chat ===
function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// === Orientation check ===
function checkOrientation() {
  if (window.innerWidth > window.innerHeight && window.innerWidth < 800) {
    alert("Please rotate your phone to portrait mode for the best chat experience.");
  }
}
window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);

// === Resize chat dynamically ===
function resizeChatWindow() {
  if (window.innerWidth < 800) {
    chatWindow.style.height = (window.innerHeight * 0.8) + "px";
    chatWindow.style.width = "95vw";
  } else {
    chatWindow.style.height = "500px";
    chatWindow.style.width = "350px";
  }
}
window.addEventListener("load", resizeChatWindow);
window.addEventListener("resize", resizeChatWindow);

// === Mobile Safari/Chrome vh fix ===
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener("load", setVH);
window.addEventListener("resize", setVH);

// === Make chat bubble draggable ===
let isDragging = false;
let offsetX, offsetY;

chatBubble.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - chatBubble.getBoundingClientRect().left;
  offsetY = e.clientY - chatBubble.getBoundingClientRect().top;
  chatBubble.style.transition = "none"; // stop bounce during drag
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;

  // Keep bubble inside screen
  const bubbleRect = chatBubble.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + bubbleRect.width > windowWidth) left = windowWidth - bubbleRect.width;
  if (top + bubbleRect.height > windowHeight) top = windowHeight - bubbleRect.height;

  chatBubble.style.left = left + "px";
  chatBubble.style.top = top + "px";
  chatBubble.style.right = "auto";
  chatBubble.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  chatBubble.style.transition = ""; // restore transitions
});

// === Touch support for mobile drag ===
chatBubble.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offsetX = touch.clientX - chatBubble.getBoundingClientRect().left;
  offsetY = touch.clientY - chatBubble.getBoundingClientRect().top;
  chatBubble.style.transition = "none";
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];

  let left = touch.clientX - offsetX;
  let top = touch.clientY - offsetY;

  const bubbleRect = chatBubble.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + bubbleRect.width > windowWidth) left = windowWidth - bubbleRect.width;
  if (top + bubbleRect.height > windowHeight) top = windowHeight - bubbleRect.height;

  chatBubble.style.left = left + "px";
  chatBubble.style.top = top + "px";
  chatBubble.style.right = "auto";
  chatBubble.style.bottom = "auto";
});

document.addEventListener("touchend", () => {
  if (!isDragging) return;
  isDragging = false;
  chatBubble.style.transition = "";
});
