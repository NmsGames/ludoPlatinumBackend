 
const axios     = require('axios');
const commanEnv = require("./constants").ENVS
const commanVar = require("./constants").KEYS
 

const PATH = '/payout/v1/authorize';
 
 
const generateToken =async()=>{
    let status = 404
    try {
        const config = {
            method  : 'POST',
            url     : `${commanEnv.TEST}/payout/v1/authorize`,
            headers : { 
                'X-Client-Id': commanVar.TEST.ClientId, 
                'X-Client-Secret':commanVar.TEST.ClientSecret
            }
        };
        const responseData =  await axios(config); 
       
        // console.log(responseData,'adfdsfdfdf')
        // axios(config).then(function (response) {
        //     console.log((response.data,'adfdafdf')); 
        //     })
        //     .catch(function (error) {
        //     console.log(error);
        //     });
       
        if(responseData.data.status == 'SUCCESS')
        { 
            let respose = {
                status :200,
                token  :responseData.data.data.token
            }
            return respose;
        }else{
            let respose = {
                status :404,
                token  :''
            }
            return respose
        }  
    } catch (error) {
        let respose = {
            status :500,
            token  :'',
            error
        }
        return respose
    }
}

module.exports = {generateToken};
