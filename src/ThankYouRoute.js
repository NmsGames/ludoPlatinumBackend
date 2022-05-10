const router    = require('express').Router() 
const transaction= require('./controllers/TransactionsController')
 
 
// Render success and cancelled
router.post('/',async(req, res, next)=>{ 
    const transctions = await transaction.updateTransactionStatus(req.body);
    return res.status(200).render("success");
});


module.exports = router