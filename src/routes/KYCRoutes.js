const router = require('express').Router()
//Import auth controller
const KYCController = require('../controllers/KYCController') 
//import validation
const check = require('../validation/CheckValidation')

 
router.post('/panCard',check.panCardValidator(),KYCController.panVerification)
router.post('/dlCard',check.dlCardValidator(),KYCController.dlVerification)
router.post('/voterCard',check.voterCardValidator(),KYCController.voterVerification)
router.get('/UsersKYC',KYCController.userKycHistory)
// router.get('/:id/avatar',KYCController.retrieveProfilePic)

module.exports = router
// "Email-id : support@ludopayz.in pssword : Zaqmlp@101"

 