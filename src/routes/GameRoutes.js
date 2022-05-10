const router = require('express').Router()
//Import auth controller
const KYCController = require('../controllers/ContextTableController') 
//import validation
const check = require('../validation/CheckValidation')

 
router.get('/contestTable', KYCController.getContestTable)
 
router.post('/changeStatusCard', KYCController.changeStatusCard)

 
module.exports = router
 

 

 