const express     = require('express');
const router      = express.Router();
const config      = require('../config.json');
const enums       = require('../helpers/enums');
const signatureVerification = require('../helpers/signatureCreation');

router.get('/index' , (req, res, next)=>{
    console.log("index get dfdfd hit",config.enviornment);
    res.render('checkout',{ 
        postUrl: config.paths[config.enviornment].cashfreePayUrl
    });
});

router.post('/result',(req, res, next)=>{ 
    const txnTypes = enums.transactionStatusEnum;
    try{
    switch(req.body.txStatus){
        case txnTypes.cancelled: {
            //buisness logic if payment was cancelled
            return res.status(200).render('result',{data:{
                status: "failed",
                message: "transaction was cancelled by user",
            }});
        }
        case txnTypes.failed: {
            //buisness logic if payment failed
            const signature = req.body.signature;
            const derivedSignature = signatureVerification.signatureResponse1(req.body, config.secretKey);
            if(derivedSignature !== signature){
                throw {name:"signature missmatchs", message:"there was a missmatch in signatures genereated and received"}
            }
            return res.status(200).render('result',{data:{
                status: "failed",
                message: "payment failure",
            }});
        }
        case txnTypes.success: {
            //buisness logic if payments succeed
            const signature = req.body.signature;
            const derivedSignature = signatureVerification.signatureResponse1(req.body, config.secretKey);
            if(derivedSignature !== signature){
                throw {name:"signature missmatchs", message:"there was a missmatch in signatures genereated and received"}
            }
            return res.status(200).render('result',{data:{
                status: "success",
                message: "payment success",
            }});
        }
    }
    }
    catch(err){
        return res.status(500).render('result',{data:{
            status:"error",
            err: err,
            name: err.name,
            message: err.message,
        }});
    }

    const signature = req.body.signature;
    const derivedSignature = signatureVerification.signatureResponse1(req.body, config.secretKey);
    if(derivedSignature === signature){
        console.log("works");
        return res.status(200).send({
            status:req.body.txStatus,
        })
    }
    else{
        console.log("signature gotten: ", signature);
        console.log("signature derived: ", derivedSignature);
        return res.status(200).send({
            status: "error",
            message: "signature mismatch",
        })
    }
});

module.exports = router;