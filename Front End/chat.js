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
    let storedMsgsInLS = localStorage.getItem('messagesStored');
    let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];


    let response = await axios.post(
      "http://localhost:3000/message/send",
      { message },
      { headers: { Authorization: token } }
    );
     // Update the firstMsgId to the earliest message fetched
  if (parsedLSMsgs.length > 0) {
    let firstMsgId = parsedLSMsgs[0].id;
    localStorage.setItem("firstMsgId", firstMsgId);
    console.log("FIRSTMSGID set on load:", firstMsgId);
  }

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

    if (response.status === 200) {
      let newMessages = response.data.messages;

      let storedMsgsInLS = localStorage.getItem('messagesStored');
      let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

      let mergedMessages = [...parsedLSMsgs, ...newMessages];
      let latestFiveMessages = mergedMessages.slice(-5); // Only keep the latest 5 messages

      localStorage.setItem("lastMsgId", newMessages.length > 0 ? newMessages[newMessages.length - 1].id : lastMsgId);
      localStorage.setItem('messagesStored', JSON.stringify(latestFiveMessages));

      displayMessages(latestFiveMessages, currentUserId);
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchOlderMessages() {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    let currentUserId = decodedToken.userId;

    // Fetch the first message ID from local storage to get older messages
    let firstMsgId = localStorage.getItem("firstMsgId") || 0;
    console.log("FIRSTMSGID>>>", firstMsgId);

    let response = await axios.get(
      `http://localhost:3000/message/fetchOlderMessages?firstmsgid=${firstMsgId}`,
      { headers: { Authorization: token } }
    );

    if (response.status === 200) {
      let olderMessages = response.data.messages;

      if (olderMessages.length > 0) {
        // Update the firstMsgId to the earliest message fetched
        firstMsgId = olderMessages[olderMessages.length - 1].id;
        localStorage.setItem("firstMsgId", firstMsgId);
        console.log("FIRSTMSGID after API call:", firstMsgId);

        let storedMsgsInLS = localStorage.getItem('messagesStored');
        let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

        // Merge older messages at the beginning of the list
        let mergedMessages = [...olderMessages, ...parsedLSMsgs];

        localStorage.setItem('messagesStored', JSON.stringify(mergedMessages));

        // Display the merged list of messages
        displayMessages(mergedMessages, currentUserId);
      } else {
        console.log("No older messages to fetch.");
      }
    }
  } catch (err) {
    console.log("Error fetching older messages:", err);
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
  let storedMsgsInLS = localStorage.getItem('messagesStored');
  let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];
  let token = localStorage.getItem("token");
  let decodedToken = jwt_decode(token);
  let currentUserId = decodedToken.userId;

  // Display stored messages
  displayMessages(parsedLSMsgs, currentUserId);

  // Set the firstMsgId to the earliest message fetched from local storage
  if (parsedLSMsgs.length > 0) {
    let firstMsgId = parsedLSMsgs[0].id;
    localStorage.setItem("firstMsgId", firstMsgId);
    console.log("FIRSTMSGID set on load:", firstMsgId);
  }

  await fetchMessages(); // Fetch new messages from the server

  document.getElementById("getOlderMessages").addEventListener("click", async () => {
    await fetchOlderMessages();
    clearInterval(setId);
  });
  let setId = setInterval(fetchMessages, 1000);
});
