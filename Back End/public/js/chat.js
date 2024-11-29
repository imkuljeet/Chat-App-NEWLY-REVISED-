const baseURL = 'http://localhost:3000';

const socket = io(baseURL);

socket.on('connect',()=>{
  console.log("Server is printing on to the client side",socket.id)
})

const groupId = localStorage.getItem('selectedGroupId');
socket.on('recdMsg',(id)=>{
  console.log(id);

  fetchAndDisplayMessages(id);

})

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

document.getElementById("creategroup").addEventListener("click", () => {
  window.location.href = "/nameGroup";
});

async function sendMessage() {
  let message = document.getElementById("messageInput").value;
  let fileInput = document.getElementById("fileInput");
  let file = fileInput.files[0];

  try {
    let token = localStorage.getItem("token");
    let groupId = localStorage.getItem("selectedGroupId");
    
    // Check if a group is selected
    if (!groupId) {
      alert("Please select a group first.");
      return;
    }

    let storedMsgsInLS = localStorage.getItem("messagesStored");
    let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

    let formData = new FormData();
    formData.append("message", message);
    formData.append("groupId", groupId);
    if (file) {
      formData.append("file", file);
    }

    let response = await axios.post(
      "message/send",
      formData,
      { headers: { Authorization: token, "Content-Type": "multipart/form-data" } }
    );

    // Emit the message using socket
    socket.emit('send-message', message, groupId);

    document.getElementById("messageInput").value = ""; // Clear the input field
    fileInput.value = ""; // Clear the file input field
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear(); // Clear the local storage
  window.location.href = "/login"; // Redirect to the login page
});

document.addEventListener("DOMContentLoaded", async () => {
  let token = localStorage.getItem("token");
  let decodedToken = jwt_decode(token);
  let currentUserId = decodedToken.userId;
 
  // Display all groups
  await displayGroups(token);

});

let selectedGroupId;

async function displayGroups(token) {
  let groups = await fetchGroupsByUserId(token);
  let groupContainer = document.getElementById("groupContainer");

  groups.forEach((group) => {
    // Create a container for the group
    let groupElement = document.createElement("div");
    groupElement.classList.add("group-item");

    // Create a header for the group name
    let groupHeader = document.createElement("h4");
    groupHeader.textContent = group.groupName;
    groupElement.appendChild(groupHeader);

    // Create the additional button and initially hide it
    let additionalButton = document.createElement("button");
    additionalButton.textContent = "Delete Group"; // You can rename it later
    additionalButton.classList.add("additional-button");
    additionalButton.style.display = "none"; // Initially hide the button
    groupElement.appendChild(additionalButton);

    // Add event listener for the additional button
    additionalButton.addEventListener("click", async () => {
      try {
        const token = localStorage.getItem("token");
        let response = await axios.delete(
          `admin/delete-group/${group.id}`,
          {
            headers: { Authorization: token },
          }
        );

        alert(`${group.groupName} : ${response.data.message}`);
      } catch (err) {
        console.log(err);

        // Safely access the error message
        const errorMessage =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "An error occurred";

        alert(`${group.groupName} : ${errorMessage}`);
      }
    });

    // Create a ul for the group's messages
    let messageUl = document.createElement("ul");
    messageUl.id = `messageul-${group.id}`;
    messageUl.style.display = "none"; // Initially hide all message uls
    groupElement.appendChild(messageUl);

    // Create a div for group members
    let memberDiv = document.createElement("div");
    memberDiv.id = `memberDiv-${group.id}`;
    memberDiv.style.display = "none"; // Initially hide all member divs
    groupElement.appendChild(memberDiv);

    // Create the "Show Members" button and initially hide it
    let showMembersButton = document.createElement("button");
    showMembersButton.textContent = "Show Members";
    showMembersButton.classList.add("show-members-button");
    showMembersButton.style.display = "none"; // Initially hide the button
    showMembersButton.addEventListener("click", async () => {
      await fetchAndDisplayMembers(group.id, token);
      memberDiv.style.display = "block"; // Show the member div when button is clicked
    });
    groupElement.appendChild(showMembersButton);

    groupContainer.appendChild(groupElement);

    groupElement.addEventListener("click", () => {
      document.querySelectorAll(".add-member-button").forEach((button) => {
        button.remove();
      });

      let addButton = document.createElement("button");
      addButton.textContent = "Add Member";
      addButton.classList.add("add-member-button");
      addButton.addEventListener("click", () => {
        alert(`Add member to group: ${group.groupName}`);

        // Redirect to the Add Member page with the group's ID
        // window.location.href = `./addMembers.html?groupId=${group.id}`;

        // Redirect to the Add Member page with the group's ID
        window.location.href = `/addMembers?groupId=${group.id}`;
      });

      groupElement.appendChild(addButton);

      // Store the selected groupId in localStorage
      localStorage.setItem("selectedGroupId", group.id);

      // Hide all message uls and member divs
      document.querySelectorAll(".group-item ul").forEach((ul) => {
        ul.style.display = "none";
      });
      document.querySelectorAll(".group-item div").forEach((div) => {
        div.style.display = "none";
      });
      document.querySelectorAll(".show-members-button").forEach((button) => {
        button.style.display = "none";
      });
      document.querySelectorAll(".additional-button").forEach((button) => {
        button.style.display = "none";
      });

      // Show the message ul, member div, and additional button for the clicked group
      messageUl.style.display = "block";
      memberDiv.style.display = "block";
      showMembersButton.style.display = "block";
      additionalButton.style.display = "block";

      // Fetch and display messages for the group
      fetchAndDisplayMessages(group.id, token);
    });
  });
}
async function fetchGroupsByUserId(token) {
  try {
    let response = await axios.get("group/user-groups", {
      headers: { Authorization: token },
    });
    return response.data.groups;
  } catch (err) {
    console.error("Error fetching user groups:", err);
    return [];
  }
}
async function fetchAndDisplayMessages(groupId, token) {
  try {
    const token = localStorage.getItem('token');
    let response = await axios.get(
      `message/getGroupMessages/${groupId}`,
      {
        headers: { Authorization: token },
      }
    );

    let messages = response.data.messages;
    let currentUserId = jwt_decode(token).userId; // Assuming token contains userId
    displayMessages(messages, currentUserId, groupId);
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
}
function displayMessages(messages, currentUserId, groupId) {
  let ul = document.getElementById(`messageul-${groupId}`);

  // Check if ul element exists
  if (!ul) {
    console.error(`Element with ID messageul-${groupId} not found`);
    return;
  }

  ul.innerHTML = ""; // Clear any existing messages

  if (messages.length === 0) {
    let li = document.createElement("li");
    li.textContent = "No messages available.";
    ul.appendChild(li);
  } else {
    messages.forEach((message) => {
      let li = document.createElement("li");

      if (message.fileUrl) {
        // Create a link or an image element
        let fileElement;
        if (/\.(jpe?g|png|gif|bmp)$/i.test(message.fileUrl)) { // Check if the file is an image
          fileElement = document.createElement("img");
          fileElement.src = message.fileUrl;
          fileElement.alt = "Uploaded image";
          fileElement.style.maxWidth = "200px"; // Adjust the image size as needed
        } else {
          fileElement = document.createElement("a");
          fileElement.href = message.fileUrl;
          fileElement.textContent = "Download File";
          fileElement.target = "_blank"; // Open in a new tab
        }

        li.appendChild(fileElement);
      }

      let textNode = document.createTextNode(
        message.userId === currentUserId
          ? `You: ${message.message}`
          : `${message.user.name}: ${message.message}`
      );
      // li.appendChild(document.createElement("br")); // Add a line break before the text
      li.appendChild(textNode);

      ul.appendChild(li);
    });
  }
}
async function fetchAndDisplayMembers(groupId, token) {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    // console.log("DECODEDTOKEM",decodedToken);
    let response = await axios.get(
      `group/getGroupMembers/${groupId}`,
      {
        headers: { "Authorization": token },
      }
    );


    let members = response.data.groupMembers;
    let memberDiv = document.getElementById(`memberDiv-${groupId}`);
    memberDiv.innerHTML = ""; // Clear any existing members

    let currentUser = await axios.get(
      `group/get-currentuser/${groupId}`,
      {
          headers: { "Authorization": token },
          // params: { groupId: groupId }
      }
  );
  
  console.log("CURRENTUSER", currentUser.data.isAdmin);
  

    members.forEach((member) => {
      console.log("MEMEBRR>>>",member);
      
      let memberElement = document.createElement("div");
      memberElement.innerHTML = `${member.user.name} (${member.user.email})`;

      if (!member.isAdmin && member.userId !== decodedToken.userId && currentUser.data.isAdmin) {
        memberElement.innerHTML += `<button class="make-admin-btn">Make Admin</button><button class="remove-user-btn">Remove User</button>`;
    }
 
      memberDiv.appendChild(memberElement);

      // Add event listener for "Make Admin" button
      let makeAdminButton = memberElement.querySelector(".make-admin-btn");
      if (makeAdminButton) {
        makeAdminButton.addEventListener("click", async () => {
          console.log(`Making ${member.user.name} an admin`);
          try {
            let groupId = localStorage.getItem("selectedGroupId");
            let token = localStorage.getItem("token");
            const response = await axios.post(
              `admin/make-admin`,
              { member },
              {
                headers: { Authorization: token },
              }
            );
            console.log(response.data);
          } catch (error) {
            console.error(
              "There was an error making the user an admin:",
              error
            );
          }
        });
      }

      // Add event listener for "Remove User" button
      let removeUserButton = memberElement.querySelector(".remove-user-btn");
      if (removeUserButton) {
        removeUserButton.addEventListener("click", async () => {
          console.log(`Removing ${member.user.name} from the group`);
          try {
            // let groupId = localStorage.getItem("selectedGroupId");
            let token = localStorage.getItem("token");
            const response = await axios.post(
              `admin/remove-user`,
              { member },
              {
                headers: { Authorization: token },
              }
            );
            console.log(response.data);
          } catch (error) {
            console.error("There was an error removing the user:", error);
          }
        });
      }
    });
  } catch (err) {
    console.error("Error fetching group members:", err);
  }
}
