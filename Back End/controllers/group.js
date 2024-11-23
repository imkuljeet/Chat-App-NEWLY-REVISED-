const Group = require('../models/groups');
const UserGroup = require('../models/usergroup');
const User = require("../models/users");
const { Op } = require('sequelize');

const namegroup = async (req, res, next) => {
    try {
        console.log(req.body);

        const { groupName } = req.body;
        const userId = req.user.id; // Assuming req.user.id is set and contains the user ID

        // Create a new group
        const group = await Group.create({ groupName });

        // Update UserGroup table with the new group and user ID
        await UserGroup.create({ userId: userId, groupId: group.id ,isAdmin : true });

        // Send a success response
        res.status(201).json({
            message: 'Group created successfully!',
            group: group
        });
    } catch (error) {
        console.error('Error creating group:', error);

        // Send an error response
        res.status(500).json({
            message: 'Failed to create group',
            error: error.message
        });
    }
};

const addMember = async (req, res, next) => {
    try {
        const { email, groupId } = req.body; // Assuming groupId is passed in the request body

        // Find the user by email
        let user = await User.findOne({ where: { email: email } });

        if (user) {
            // Check if the group exists
            let group = await Group.findOne({ where: { id: groupId } });
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }

            // Create the UserGroup entry
            await UserGroup.create({ userId: user.id, groupId: groupId });

            // Send a success response
            res.status(201).json({ message: 'Member added to group successfully!' });
        } else {
            // User not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error("Error adding member to group:", err);

        // Send an error response
        res.status(500).json({ message: 'Failed to add member to group', error: err.message });
    }
};

const allGroups = async (req, res, next) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const getGroupsByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have middleware that sets req.userId from the token

    // Find all group IDs that the user is part of
    const userGroups = await UserGroup.findAll({ where: { userId: userId } });
    const groupIds = userGroups.map(ug => ug.groupId);

    // Find all groups that match these IDs
    const groups = await Group.findAll({
      where: {
        id: {
          [Op.in]: groupIds
        }
      }
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Assuming you have middleware that sets req.user.id

    try {
        // Check if the user belongs to the group
        const userGroup = await UserGroup.findOne({ where: { userId, groupId } });
        if (!userGroup) {
            return res.status(403).json({ error: "User does not belong to the group" });
        }

        // Fetch group members
        const groupMembers = await UserGroup.findAll({
            where: { groupId },
            include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        });

        res.status(200).json({ groupMembers });
    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const currentUserDetails = async (req, res, next) => {
    try {
        // Get the user ID from the request
        let userId = req.user.id;
        let { groupId } = req.params;

        // Find the user details from the UserGroup table (or any relevant table)
        let currentFoundUser = await UserGroup.findOne({ where: { userId, groupId } });

        // Check if the user details are found
        if (currentFoundUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user details as a response
        res.status(200).json(currentFoundUser);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { namegroup,addMember, allGroups, getGroupsByUserId,  getGroupMembers, currentUserDetails };
