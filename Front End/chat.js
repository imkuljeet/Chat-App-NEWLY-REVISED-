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

document.addEventListener('DOMContentLoaded',async ()=>{
  try{
    let token = localStorage.getItem('token');
    let response = await axios.get('http://localhost:3000/message/fetchMessages', { headers : {"Authorization" : token }});

    if(response.status === 200){
      console.log('RES MSGS>>',response.data.messages);

      let messages = response.data.messages;

      if (messages.length === 0) {
          let ul = document.getElementById('messageul');
          let li = document.createElement('li');
          li.textContent = "";
          ul.appendChild(li);
      } else {
          messages.forEach(message => {
              let ul = document.getElementById('messageul');
              let li = document.createElement('li');
              li.textContent = `${message.user.name} : ${message.message} `;
              ul.appendChild(li);
          });
      }
      
    }

    console.log("Messages all are>>>>",response);

  }catch(err){
    console.log(err);
  }
})
