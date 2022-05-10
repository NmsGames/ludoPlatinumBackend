const router = require('express').Router()
// import auth controller
const UsersController = require('../controllers/UsersController')
 
//import validation
const check = require('../validation/CheckValidation')

router.get('/',UsersController.getUsers)
router.post('/profileUpload',UsersController.uploadProfilePic)
router.get('/:id/avatar',UsersController.retrieveProfilePic)



router.post('/changeStatusPlayer',UsersController.changeStatusPlayer)




router.get('/getReferralData',UsersController.getReferralData)
router.get('/getTransactionData',UsersController.getTransactionData)


//router.post('/changePassword',auth,UsersController.changePassword)




router.get("/test", (req, res) => {
    res.send('sdfdfdfd')
});
module.exports = router