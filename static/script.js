const chatBubble = document.getElementById("chat-bubble");
const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

// Toggle chat window when clicking bubble
chatBubble.addEventListener("click", () => {
  chatWindow.classList.toggle("show");
});

// Send message function
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  userInput.value = "";

  // Call backend API
  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  })
  .then(res => res.json())
  .then(data => addMessage("bot", data.reply || "Ei vastausta"))
  .catch(err => addMessage("bot", "Virhe palvelimella"));
}

// Send message on button click
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter key
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Add message to chat
function addMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make chat bubble draggable
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

  // Position chat window safely
  const chatRect = chatWindow.getBoundingClientRect();
  let chatLeft = left;
  let chatTop = top + chatBubble.offsetHeight + 10;

  if (chatLeft + chatRect.width > windowWidth) chatLeft = windowWidth - chatRect.width - 10;
  if (chatTop + chatRect.height > windowHeight) chatTop = windowHeight - chatRect.height - 10;

  chatWindow.style.left = chatLeft + "px";
  chatWindow.style.top = chatTop + "px";
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  chatBubble.style.transition = ""; // restore transition
});

function checkOrientation() {
  if (window.innerWidth > window.innerHeight) {
    // Landscape
    if (window.innerWidth < 800) { // only on mobile
      alert("Please rotate your phone to portrait mode for the best chat experience.");
    }
  }
}

// Run on load and when orientation changes
window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);



function resizeChatWindow() {
  const chatWindow = document.getElementById("chat-window");

  if (window.innerWidth < 800) { // Mobile/tablet
    if (window.innerWidth > window.innerHeight) {
      // Landscape
      chatWindow.style.display = "none"; // Hide chatbot
      alert("Please rotate your phone to portrait mode for the best chat experience.");
    } else {
      // Portrait
      chatWindow.style.display = "flex"; // Show chatbot
      chatWindow.style.height = (window.innerHeight * 0.8) + "px"; // 80% visible height
    }
  } else {
    // Desktop - reset height & show
    chatWindow.style.display = "flex";
    chatWindow.style.height = "";
  }
}

window.addEventListener("load", resizeChatWindow);
window.addEventListener("resize", resizeChatWindow);
