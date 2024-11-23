document.getElementById("sendMessage").addEventListener("click", async (e) => {
  e.preventDefault();
  await sendMessage();
});

document.getElementById("messageInput").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    await sendMessage();
  }
});

async function sendMessage() {
  let message = document.getElementById("messageInput").value;
  try {
    let token = localStorage.getItem("token");
    let response = await axios.post(
      "http://localhost:3000/message/send",
      { message },
      { headers: { Authorization: token } }
    );
    document.getElementById("messageInput").value = ""; // Clear the input field
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear(); // Clear the local storage
  window.location.href = "./login.html"; // Redirect to the login page
});

async function fetchMessages() {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    let currentUserId = decodedToken.userId;

    let lastMsgId = localStorage.getItem("lastMsgId") || 0;
    let response = await axios.get(
      `http://localhost:3000/message/fetchMessages?lastmsgid=${lastMsgId}`,
      { headers: { Authorization: token } }
    );

    let ul = document.getElementById("messageul");
    ul.innerHTML = ""; // Clear existing messages

    if (response.status === 200) {
      let newMessages = response.data.messages;

      let storedMsgsInLS = localStorage.getItem('messagesStored');
      let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

      let mergedMessages = [...parsedLSMsgs, ...newMessages];

      localStorage.setItem("lastMsgId", newMessages[newMessages.length - 1].id);
      localStorage.setItem('messagesStored', JSON.stringify(mergedMessages));

      displayMessages(mergedMessages, currentUserId);
    }
  } catch (err) {
    console.log(err);
  }
}

function displayMessages(messages, currentUserId) {
  let ul = document.getElementById("messageul");
  ul.innerHTML = ""; // Clear any existing messages

  if (messages.length === 0) {
    let li = document.createElement("li");
    li.textContent = "No messages available.";
    ul.appendChild(li);
  } else {
    messages.forEach((message) => {
      let li = document.createElement("li");
      li.textContent = message.userId === currentUserId ? `You: ${message.message}` : `${message.user.name}: ${message.message}`;
      ul.appendChild(li);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchMessages();
  // Uncomment the line below to refresh messages every second
  // setInterval(fetchMessages, 1000);
});
