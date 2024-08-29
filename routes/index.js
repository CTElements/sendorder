const express = require("express");
const router = express.Router();
const sendXML = require('../controllers/sendXML')

router.post('/sendXML', sendXML.sendXML)

router.get('/', (req, res) => {
   res.status(200).json({status: 200, msg:"Api running..."})
})
module.exports = router
