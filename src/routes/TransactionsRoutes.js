const express   = require('express');
let  router     =  express.Router();
const config    = require('../config.json');
const enums     = require('../helpers/enums');
const helpers   = require('../helpers/signatureCreation');
const transaction= require('../controllers/TransactionsController') 
const check     = require('../validation/CheckValidation')
const {sendResponse} = require('../../services/AppService')
 
router.get('/', async(req, res, next) => {  
        let formObj = {
          orderId: req.query.order_id,
          orderAmount:  req.query.amount,
        //   customerName: req.query.customerName,
          customerEmail: req.query.email,
          customerPhone: req.query.phone
        } 
        let status = 404
        if (!formObj.orderAmount) return sendResponse(status = 404, "Invalid amount.", data)
        if (!formObj.customerEmail) return sendResponse(status = 404, "Invalid Emails.", data)
        if (!formObj.customerPhone) return sendResponse(status = 404, "Invalid phone.", data)
        const userId = req.query.user_id; 
        const secretKey    = config.secretKey; 
        // let { formObj }  = req.body
        let {paymentType}  = {paymentType: 'CHECKOUT'}  
        const notifyUrl = ""
        const returnUrl  = "http://13.127.231.91:5000/success"
        const dataObj = {
        userId          : userId,
        orderId         : formObj.orderId,
        orderAmount     : formObj.orderAmount,
        customerPhone   : formObj.customerPhone,
        customerEmail   : formObj.customerEmail,
        customerName    : formObj.customerName,
        orderCurrency   : "INR",
        notifyUrl   : notifyUrl,
        returnUrl   : returnUrl,
        orderNote   : "Added Amount",
        appId       : config.appId
    } 
  
    // try {
    // 
            const transctions = await transaction.createTransaction(dataObj);
            console.log(transctions,'transctions')
            if(transctions.status ===200)
            { 
                switch (paymentType) {
                    case enums.paymentTypeEnum.checkout: {  
                        formObj.returnUrl = returnUrl;
                        formObj.notifyUrl = "";
                        formObj.appId = config.appId;
                        const signature   = helpers.signatureRequest1(formObj, secretKey);
                        additionalFields  = {
                            returnUrl,
                            notifyUrl,
                            signature,
                            appId: config.appId,
                        };
                       
                        return res.status(200).render("redirect",{signature:signature,app:config.appId}); 
                    } 
            
                    default: {
                        console.log("incorrect payment option recieved");
                        console.log("paymentOption:", paymentType);
                        return res.status(200).send({
                            status: "error",
                            message: "incorrect payment type sent"
                        });
                    }
                }
            }else{
                return res.status(200).json({
                method: req.method,
                status: 404,
                error: transctions
            }) 
        }
 
    // } catch (error) {
        
    // } 
});





//below will not be hit as server is not on https://
router.post('/notify', (req, res, next) => { 
    return res.status(200).send({
        status: "success",
    })
});

//user transaction history
router.get('/userTransactionHistory',transaction.userTransactionHistory);
//user transaction history
router.get('/withdrawRequestHistory',transaction.withdrawRequestHistory);
router.post('/accountDetails',check.userIdValidator(),transaction.accountDetails);
router.post('/transactionHistory',check.userIdValidator(),transaction.transactionHistory);
router.get('/usersAccoutDetails',transaction.usersAccoutDetails);
router.get('/', (req, res, next) => { 
    return res.status(200).render("index");
});
 


module.exports = router