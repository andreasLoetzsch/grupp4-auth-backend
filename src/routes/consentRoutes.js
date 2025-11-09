const express = require('express');
const { updateConsent } = require('../controllers/consentController');
const consentUUID = require('../middleware/consentUUID');

const router = express.Router();

router.post('/update', consentUUID, updateConsent);

module.exports = router;