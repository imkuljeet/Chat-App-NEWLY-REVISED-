async function signup(e) {
  try {
    e.preventDefault();

    let name = e.target.name.value;
    let email = e.target.email.value;
    let phone = e.target.phone.value;
    let password = e.target.password.value;

    let userDetails = {
      name,
      email,
      phone,
      password,
    };

    // console.log(userDetails);
    let response = await axios.post("user/signup",userDetails);

    console.log("RESPONSE>>>>>>", response);

    if (response.status == 201) {
      alert("Successfully Signed Up");
      window.location.href = "/login";
    } else {
      alert(response.data.message);
    }
  } catch (err) {
    if (err.response) {
      console.log("Error Response:", err.response);
      alert(`${err.response.data.message || "Something went wrong"}`);
    } else {
      console.log("Error:", err.message);
      alert("An unknown error occurred");
    }
    showError(err);
  }
}

function showError(err) {
  document.body.innerHTML += `Error is - <span style="color: red;">${err}</span>`;
}
