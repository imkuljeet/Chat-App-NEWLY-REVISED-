async function nameTheGroup(e) {
    try {
        e.preventDefault();

        let groupName = e.target.namethegroup.value;
        let token = localStorage.getItem('token');

        let response = await axios.post('http://localhost:3000/group/namegroup', { groupName }, { headers: { Authorization: token } });

        console.log(response.data);
        alert("Group Created");

        // Redirect to the Add Member page with the group's ID
        window.location.href = `./addMembers.html?groupId=${response.data.group.id}`;
    } catch (err) {
        console.error("Error creating group:", err);
        alert("Failed to create group. Please try again.");
    }
}

document.getElementById('groupForm').addEventListener('submit', nameTheGroup);
