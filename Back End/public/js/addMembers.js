// Get groupId from the URL
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId');
document.getElementById('groupId').value = groupId; // Set the hidden input value

document.getElementById("add-member-form").addEventListener('submit', async (e) => {
    e.preventDefault();

    let email = e.target.email.value;
    let token = localStorage.getItem('token');
    let groupId = e.target.groupId.value;

    try {
        let response = await axios.post("group/add-member", { email, groupId }, { headers: { "Authorization": token } });
        console.log(response.data);
        alert("Member Added Successfully");
        window.location.href = ("/chat");
    } catch (err) {
        console.error("Error adding member:", err);
        alert("Failed to add member. Please try again.");
    }
});
