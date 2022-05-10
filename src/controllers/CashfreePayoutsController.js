const conn = require("../../config/db");
const path = require("path")
const moment = require("moment");
const cfSdk = require('cashfree-sdk');
const axios = require('axios');
const { verify } = require("crypto");

const createAuthorization =async()=>{ 
    try {
        const config = {
            method: 'post',
            url: 'https://payout-gamma.cashfree.com/payout/v1/authorize',
                headers: { 
                    'X-Client-Id': 'CF145039C8U5U8RG1A0QGEN8J0I0', 
                    'X-Client-Secret': 'c132bbed518248aae3859bd1c0b9dbe043f6ed80'
                }
            };
          const responseData =  await axios(config); 
        if(responseData.status == 200){
            return responseData.data.data.token;
        }else{
            return 500
        } 
    } catch (error) {
        console.log('error',error);
    }
}
const getBenificiary =async(req,res)=>{ 
    try {
        const token = await createAuthorization();
        const config = {
            method: 'get',
            url: 'https://payout-gamma.cashfree.com/payout/v1/getBeneId?bankAccount=8123510002103&ifsc=BKID0001520',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/x-www-form-urlencoded'
            }, 
            };
        //   const responseData =  await axios(config);
        //   console.log(responseData,'res')
        axios(config)
        .then(function (response) {
        console.log((response.data));
        res.send(response.data)
        })
        .catch(function (error) {
        console.log(error);
        });
        // if(responseData.status == 200){
        //     return res.send(responseData);
        // }else{
        //     return 500
        // } 
    } catch (error) {
        console.log('error',error);
    }
}
 
const addBenificiary =async(req,res)=>{ 
    try {
        const token = await createAuthorization();
        console.log('token',token) 
        var data = '{\n  "beneId": "RAJE9060665647",\n  "name": "rajendraakmr",\n  "email": "rajendra@nmsgames.com",\n  "phone": "9060665647",\n  "bankAccount": "585410510001106",\n  "ifsc": "BKID0005854",\n  "address1": "No 5,Narayana mistry 2nd street, Villivakkam",\n  "city": "Chennai",\n  "state": "Tamilnadu",\n  "pincode": "600049"\n}';
        const config = {
            method: 'post',
            url: 'https://payout-gamma.cashfree.com/payout/v1/addBeneficiary',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
            };
        //   const responseData =  await axios(config);
        //   console.log(responseData,'res')
        axios(config)
        .then(function (response) {
        console.log((response.data));
        res.send(response.data)
        })
        .catch(function (error) {
        console.log(error);
        });
        // if(responseData.status == 200){
        //     return res.send(responseData);
        // }else{
        //     return 500
        // } 
    } catch (error) {
        console.log('error',error);
    }
}
const createTransaferRequest =async(req,res)=>{ 
    try {
        const token = await createAuthorization();
        // var data = '{\n  "beneId": "RAJEN9060665647",\n  "amount": "10.00",\n  "transferId": "RAJEN2018"\n}'; 
        // var config = {
        // method: 'post',
        // url: 'https://payout-gamma.cashfree.com/payout/v1/requestTransfer',
        // headers: { 
        //     'Authorization': `Bearer ${token}`
        // },
        // data : data
        // };
        //   const responseData =  await axios(config); 
        // if(responseData.status == 200){
        //     return res.send(responseData);
        // }else{
        //     return 500
        // } 
        var data = '{\n  "beneId": "RAJEN9060665647",\n  "amount": "10.00",\n "method": "IMPS",\n "transferId": "1236d54"\n}';

        var config = {
        method: 'post',
        url: 'https://payout-gamma.cashfree.com/payout/v1/requestTransfer',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
        data : data
        };

        axios(config)
        .then(function (response) {
        console.log((response.data));
        })
        .catch(function (error) {
        console.log(error);
        });
    } catch (error) {
        console.log('error',error);
    }
}

const verifyBankAccount=async(req,res)=>{
    const {Payouts} = cfSdk;
    const {Validation} = Payouts;

    const config = {
        Payouts: {
            ClientID: "CF145039C8U5U8RG1A0QGEN8J0I0",
            ClientSecret: "c132bbed518248aae3859bd1c0b9dbe043f6ed80",
            ENV: "TEST",
        }
    }; 
    //init
    Payouts.Init(config.Payouts);
    //bank validation
    try{
        const response = await Validation.ValidateBankDetails({
            name: "RajendraKumarMarandi",
            phone: "9000000000",
            bankAccount: "585410510001106",
            ifsc: "BKID0005854"
        });
        console.log("bank validation response");
        console.log(response);
    }
    catch(err){
        console.log("err caught in bank validation");
        console.log(err);
    } 
}
 

module.exports = {
    addBenificiary,
    verifyBankAccount,
    createTransaferRequest,
    getBenificiary
};
