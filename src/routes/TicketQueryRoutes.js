const router = require('express').Router()
// import auth controller
const TicketQueryController = require('../controllers/TicketQueryController')
 
 
router.post('/CreateTicket',TicketQueryController.CreateTicket)

module.exports = router