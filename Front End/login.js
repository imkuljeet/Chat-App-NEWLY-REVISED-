document.getElementById("login").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    let email = event.target.email.value;
    let password = event.target.password.value;
  
    let loginDetails = {
      email,
      password,
    };
  
    try {
      let response = await axios.post("http://localhost:3000/user/login", loginDetails);
  
      if (response.status === 200) {
        alert(response.data.message);
        localStorage.setItem('token',response.data.token);
        window.location.href = "./chat.html"
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response) {
        showError(err.response.data.message);
      } else {
        showError(err.message);
      }
    }
  });
  
  function showError(message) {
    document.body.innerHTML += `<br><br>Error is - <span style="color: red;">${message}</span>`;
  }

  document.getElementById('forgotpassword').addEventListener('click',()=>{
    window.location.href = './forgotpassword.html';
  })
  