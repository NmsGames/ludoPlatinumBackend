const router = require('express').Router()
// import auth controller
const Cash = require('./CashfreePayoutsController')

// Import auth middleware
// const Auth = require('../middleware/Auth')
 
router.get('/VerifyAccount',Cash.VerifyAccount) 
router.put('/VerifyBankAccountStatus',Cash.VerifyAccountStatus)
router.put('/acceptPayouts',Cash.acceptPayouts)
module.exports = router