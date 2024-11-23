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
        let response = await axios.post("http://localhost:3000/user/signup",userDetails);
    } catch (err) {
        console.log(err);
        showError(err);
    }
}

function showError(err) {
    document.body.innerHTML += `Error is - <span style="color: red;">${err}</span>`;
}
