document.getElementById('sendMessage').addEventListener('click', async (e) => {
    e.preventDefault();
    let message = document.getElementById('messageInput').value;
    console.log(message);

    try {
        let response = await axios.post("http://localhost:3000/message/send", { message });
        console.log('Message sent:', response.data);
        document.getElementById('messageInput').value = ''; // Clear the input field   
     } catch (err) {
        console.error('Error sending message:', err);
    }
});