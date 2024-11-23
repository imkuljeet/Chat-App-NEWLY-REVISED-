const Group = require('../models/groups');

const namegroup = async (req, res, next) => {
    try {
        const { groupName } = req.body;

        // Create a new group
        const group = await Group.create({ groupName });

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
