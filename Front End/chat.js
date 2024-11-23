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
  window.location.href = "./nameGroup.html";
});

async function sendMessage() {
  let message = document.getElementById("messageInput").value;
  try {
    let token = localStorage.getItem("token");
    let groupId = localStorage.getItem("selectedGroupId");
    let storedMsgsInLS = localStorage.getItem("messagesStored");
    let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

    let response = await axios.post(
      "http://localhost:3000/message/send",
      { message, groupId },
      { headers: { Authorization: token } }
    );
    // Update the firstMsgId to the earliest message fetched
    if (parsedLSMsgs.length > 0) {
      let firstMsgId = parsedLSMsgs[0].id;
      localStorage.setItem("firstMsgId", firstMsgId);
      console.log("FIRSTMSGID set on load:", firstMsgId);
    }

    document.getElementById("messageInput").value = ""; // Clear the input field
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear(); // Clear the local storage
  window.location.href = "./login.html"; // Redirect to the login page
});

async function fetchMessages() {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    let currentUserId = decodedToken.userId;

    let lastMsgId = localStorage.getItem("lastMsgId") || 0;
    let response = await axios.get(
      `http://localhost:3000/message/fetchMessages?lastmsgid=${lastMsgId}`,
      { headers: { Authorization: token } }
    );

    if (response.status === 200) {
      let newMessages = response.data.messages;

      let storedMsgsInLS = localStorage.getItem("messagesStored");
      let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

      let mergedMessages = [...parsedLSMsgs, ...newMessages];
      let latestFiveMessages = mergedMessages.slice(-5); // Only keep the latest 5 messages

      localStorage.setItem(
        "lastMsgId",
        newMessages.length > 0
          ? newMessages[newMessages.length - 1].id
          : lastMsgId
      );
      localStorage.setItem(
        "messagesStored",
        JSON.stringify(latestFiveMessages)
      );

      // displayMessages(latestFiveMessages, currentUserId);
    }
  } catch (err) {
    console.log(err);
  }
}

async function fetchOlderMessages() {
  try {
    let token = localStorage.getItem("token");
    let decodedToken = jwt_decode(token);
    let currentUserId = decodedToken.userId;

    // Fetch the first message ID from local storage to get older messages
    let firstMsgId = localStorage.getItem("firstMsgId") || 0;
    console.log("FIRSTMSGID>>>", firstMsgId);

    let response = await axios.get(
      `http://localhost:3000/message/fetchOlderMessages?firstmsgid=${firstMsgId}`,
      { headers: { Authorization: token } }
    );

    if (response.status === 200) {
      let olderMessages = response.data.messages;

      if (olderMessages.length > 0) {
        // Update the firstMsgId to the earliest message fetched
        firstMsgId = olderMessages[olderMessages.length - 1].id;
        localStorage.setItem("firstMsgId", firstMsgId);
        console.log("FIRSTMSGID after API call:", firstMsgId);

        let storedMsgsInLS = localStorage.getItem("messagesStored");
        let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];

        // Merge older messages at the beginning of the list
        let mergedMessages = [...olderMessages];

        // localStorage.setItem('messagesStored', JSON.stringify(mergedMessages));

        // Display the merged list of messages
        displayMessages(mergedMessages, currentUserId);
      } else {
        console.log("No older messages to fetch.");
      }
    }
  } catch (err) {
    console.log("Error fetching older messages:", err);
  }
}

// function displayMessages(messages, currentUserId) {
//   let ul = document.getElementById("messageul");
//   ul.innerHTML = ""; // Clear any existing messages

//   if (messages.length === 0) {
//     let li = document.createElement("li");
//     li.textContent = "No messages available.";
//     ul.appendChild(li);
//   } else {
//     messages.forEach((message) => {
//       let li = document.createElement("li");
//       li.textContent =
//         message.userId === currentUserId
//           ? `You: ${message.message}`
//           : `${message.user.name}: ${message.message}`;
//       ul.appendChild(li);
//     });
//   }
// }

document.addEventListener("DOMContentLoaded", async () => {
  let storedMsgsInLS = localStorage.getItem("messagesStored");
  let parsedLSMsgs = JSON.parse(storedMsgsInLS) || [];
  let token = localStorage.getItem("token");
  let decodedToken = jwt_decode(token);
  let currentUserId = decodedToken.userId;

  // Display stored messages
  // displayMessages(parsedLSMsgs, currentUserId);

  // Set the firstMsgId to the earliest message fetched from local storage
  if (parsedLSMsgs.length > 0) {
    let firstMsgId = parsedLSMsgs[0].id;
    localStorage.setItem("firstMsgId", firstMsgId);
    console.log("FIRSTMSGID set on load:", firstMsgId);
  }

  // await fetchMessages(); // Fetch new messages from the server
  // Display all groups
  await displayGroups(token);

  // document
  //   .getElementById("getOlderMessages")
  //   .addEventListener("click", async () => {
  //     await fetchOlderMessages();
  //     // clearInterval(setId);
  //   });
  // let setId = setInterval(fetchMessages, 1000);
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
        window.location.href = `./addMembers.html?groupId=${group.id}`;
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

      // Show the message ul and member div for the clicked group
      messageUl.style.display = "block";
      memberDiv.style.display = "block";

      // Show the "Show Members" button for the clicked group
      showMembersButton.style.display = "block";

      // Fetch and display messages for the group
      fetchAndDisplayMessages(group.id, token);
    });
  });
}

async function fetchGroupsByUserId(token) {
  try {
    let response = await axios.get("http://localhost:3000/group/user-groups", {
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
    let response = await axios.get(
      `http://localhost:3000/message/getGroupMessages/${groupId}`,
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
      li.textContent =
        message.userId === currentUserId
          ? `You: ${message.message}`
          : `${message.user.name}: ${message.message}`;
      ul.appendChild(li);
    });
  }
}

async function fetchAndDisplayMembers(groupId, token) {
  try {
    let response = await axios.get(
      `http://localhost:3000/group/getGroupMembers/${groupId}`,
      {
        headers: { Authorization: token },
      }
    );

    let members = response.data.groupMembers;
    let memberDiv = document.getElementById(`memberDiv-${groupId}`);
    memberDiv.innerHTML = ""; // Clear any existing members

    members.forEach((member) => {
      let memberElement = document.createElement("div");
      memberElement.innerHTML = `${member.user.name} (${member.user.email})`;

      if (!member.isAdmin) {
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
              `http://localhost:3000/admin/make-admin`,
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
              `http://localhost:3000/admin/remove-user`,
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
