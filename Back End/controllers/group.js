const Group = require('../models/groups');
const UserGroup = require('../models/usergroup');
const User = require("../models/users");

const namegroup = async (req, res, next) => {
    try {
        console.log(req.body);

        const { groupName } = req.body;
        const userId = req.user.id; // Assuming req.user.id is set and contains the user ID

        // Create a new group
        const group = await Group.create({ groupName });

        // Update UserGroup table with the new group and user ID
        await UserGroup.create({ userId: userId, groupId: group.id });

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

module.exports = { namegroup,addMember };
