const express = require('express');

const router = express.Router();
const Authorization = require('../middleware/auth');
const adminController = require('../controllers/admin');

router.post('/make-admin',Authorization.authenticate, adminController.makeAdmin);
router.post('/remove-user',Authorization.authenticate, adminController.removeUser);

module.exports = router;