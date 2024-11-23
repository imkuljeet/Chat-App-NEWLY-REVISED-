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

 async function sendMessage(){
  let message = document.getElementById("messageInput").value;
  console.log(message);

  try {
    let token = localStorage.getItem('token');
    let response = await axios.post("http://localhost:3000/message/send", {
      message,
    },{ headers : { "Authorization" : token }});
    console.log("Message sent:", response.data);
    document.getElementById("messageInput").value = ""; // Clear the input field
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "./login.html";
});
