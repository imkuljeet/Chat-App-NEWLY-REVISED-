const express = require('express');

const router = express.Router();
const Authorization = require('../middleware/auth');
const groupController = require('../controllers/group');

router.post('/namegroup',Authorization.authenticate, groupController.namegroup);
router.post('/add-member', Authorization.authenticate, groupController.addMember);
router.get('/all-groups',Authorization.authenticate, groupController.allGroups);
router.get('/user-groups',Authorization.authenticate, groupController.getGroupsByUserId);
router.get('/getGroupMembers/:groupId', Authorization.authenticate, groupController.getGroupMembers);
router.get('/get-currentuser/:groupId',Authorization.authenticate,groupController.currentUserDetails);

module.exports = router;