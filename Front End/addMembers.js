document.getElementById("add-member-form").addEventListener('submit', async (e) => {
    e.preventDefault();

    let email = e.target.email.value;
    let token = localStorage.getItem('token');

    try {
        let response = await axios.post("http://localhost:3000/group/add-member", { email }, { headers: { "Authorization": token } });
        console.log(response.data);
        alert("Member Added Successfully");
    } catch (err) {
        console.error("Error adding member:", err);
        alert("Failed to add member. Please try again.");
    }
});