const Group = require('../models/groups');
const UserGroup = require('../models/usergroup');
const User = require("../models/users");

const makeAdmin = async (req, res, next) => {
    try {
        const { userId, groupId, isAdmin } = req.body.member;

        console.log("AHHHA??>>>", userId, groupId, isAdmin);

         // Check if the requesting user is an admin
         const requestingUserGroup = await UserGroup.findOne({ where: { userId: req.user.id, groupId } });
         if (!requestingUserGroup || !requestingUserGroup.isAdmin) {
             return res.status(403).json({ message: 'You do not have permission to make admin' });
         }

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


const removeUser = async (req, res, next) => {
    try {
        const { userId, groupId, isAdmin } = req.body.member;

        console.log("Removing User:", userId, groupId, isAdmin);

        // Check if the requesting user is an admin
        const requestingUserGroup = await UserGroup.findOne({ where: { userId: req.user.id, groupId } });
        if (!requestingUserGroup || !requestingUserGroup.isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to remove users from this group' });
        }

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

        // Remove the user from the group
        await userGroup.destroy();

        return res.status(200).json({ message: 'User has been removed from the group' });
    } catch (error) {
        console.error("There was an error removing the user from the group:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteGroup = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        console.log("GROUP ID>>>", groupId);

        const userId = req.user.id;

        // Check if the user is an admin of the group
        let person = await UserGroup.findOne({ where: { groupId, userId } });

        if (!person || !person.isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to delete this group' });
        }

        console.log(person.isAdmin);

        // Delete the group from the Group table
        await Group.destroy({ where: { id: groupId } });

        // Delete associated entries from the UserGroup table
        await UserGroup.destroy({ where: { groupId } });

        // Send a success response to the client
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error(error);

        // Send an error response to the client
        res.status(500).json({ message: 'An error occurred while deleting the group' });
    }
};

module.exports = { makeAdmin , removeUser , deleteGroup };
