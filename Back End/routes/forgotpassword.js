const express = require('express');

const router = express.Router();

const forgotpasswordController = require('../controllers/forgotpassword');

router.post('/forgotpassword',forgotpasswordController.forgotpassword);
router.get('/resetpassword/:id',forgotpasswordController.resetpassword);
router.use('/updatepassword/:resetpasswordid',forgotpasswordController.updatepassword);

module.exports = router;