const Group = require('../models/groups');
const UserGroup = require('../models/usergroup');

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

module.exports = { namegroup };
