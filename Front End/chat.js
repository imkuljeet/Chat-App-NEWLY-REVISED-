document.getElementById("sendMessage").addEventListener("click", async (e) => {
  e.preventDefault();
  await sendMessage();
});

document
  .getElementById("messageInput")
  .addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await sendMessage();
    }
  });

async function sendMessage() {
  let message = document.getElementById("messageInput").value;
  // console.log(message);

  try {
    let token = localStorage.getItem("token");
    let response = await axios.post(
      "http://localhost:3000/message/send",
      {
        message,
      },
      { headers: { Authorization: token } }
    );
    // console.log("Message sent:", response.data);
    document.getElementById("messageInput").value = ""; // Clear the input field
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear(); // Clear the local storage
  // console.log("Local storage cleared");  // Add this line to verify it's being called
  window.location.href = "./login.html"; // Redirect to the login page
});

async function fetchMessages() {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    let currentUserId = decodedToken.userId;

    // console.log("CUR USER ID IS>>>", currentUserId);

    let response = await axios.get(
      "http://localhost:3000/message/fetchMessages",
      { headers: { Authorization: token } }
    );

    let ul = document.getElementById("messageul"); ul.innerHTML = ''; // Clear existing messages

    if (response.status === 200) {
      // console.log("RES MSGS>>", response.data.messages);

      let messages = response.data.messages;
      let stringifiedMessages = JSON.stringify(messages);
      localStorage.setItem('messagesStored',stringifiedMessages);

      function show(messages) {
        let ul = document.getElementById("messageul");
        ul.innerHTML = ""; // Clear any existing messages
      
        if (messages.length === 0) {
          let li = document.createElement("li");
          li.textContent = "";
          ul.appendChild(li);
        } else {
          messages.forEach((message) => {
            let li = document.createElement("li");
            if (message.userId === currentUserId) {
              li.textContent = `You : ${message.message}`;
            } else {
              li.textContent = `${message.user.name} : ${message.message}`;
            }
            ul.appendChild(li);
          });
        }
      }
      
      // show(messages);
      let storedMessageFromLS = localStorage.getItem('messagesStored');
      let parsedMsgs = JSON.parse(storedMessageFromLS);
      show(parsedMsgs);
    }

    // console.log("Messages all are>>>>", response);
  } catch (err) {
    console.log(err);
  }
}

document.addEventListener('DOMContentLoaded',async ()=>{
  fetchMessages();
  // setInterval(fetchMessages, 1000);
})