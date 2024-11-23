const Group = require('../models/groups');
const UserGroup = require('../models/usergroup');
const User = require("../models/users");

const makeAdmin = async (req, res, next) => {
    try {
        const { userId, groupId, isAdmin } = req.body.member;

        console.log("AHHHA??>>>", userId, groupId, isAdmin);

        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the user is a member of the group
        const userGroup = await UserGroup.findOne({ where: { userId, groupId } });
        if (!userGroup) {
            return res.status(404).json({ message: 'User is not a member of the group' });
        }

        // Check if the user is already an admin
        if (userGroup.isAdmin) {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        // Update the user's role in the group to admin
        userGroup.isAdmin = true;
        await userGroup.save();

        return res.status(200).json({ message: 'User has been made an admin', userGroup });
    } catch (error) {
        console.error("There was an error making the user an admin:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { makeAdmin };
