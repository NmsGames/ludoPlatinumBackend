const router = require('express').Router()
// import auth controller
const AuthController = require('../controllers/AuthController')

// Import auth middleware
// const Auth = require('../middleware/Auth')

//import validation
const check = require('../validation/CheckValidation')

// route list
// router.post('/register',check.registerValidator(),AuthController.authSignUp)
router.post('/login',check.loginValidator(),AuthController.authLogin)
// router.post('/sendOtp',check.sendOtp(),AuthController.sendOtp)
// router.post('/forgotPassword',check.forgotPasswordValidator(),AuthController.forgotPassword)


module.exports = router