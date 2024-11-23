async function nameTheGroup(e) {
    try {
        e.preventDefault();

        // Extract group name from the form
        let groupName = e.target.namethegroup.value;

        // Get the token from local storage
        let token = localStorage.getItem('token');

        // Send the POST request to the server with group name and token for authorization
        let response = await axios.post(
            'http://localhost:3000/group/namegroup', 
            { groupName }, 
            { headers: { Authorization: token } }
        );

        // Log the server response and alert the user
        console.log(response.data);
        alert("Group Created");
    } catch (err) {
        // Log any error that occurs
        console.error("Error creating group:", err);
        alert("Failed to create group. Please try again.");
    }
}

// Add event listener to the form submission (make sure you have the form with id `groupForm`)
document.getElementById('groupForm').addEventListener('submit', nameTheGroup);
