// const debug = require("debug")("test");
const db     = require("../../config/db");  
let status = 404;
let data ={};
let message
const {sendResponse} = require('../../services/AppService');
// Check battle types
const onCheckVersion = async(req)=>{
    try {
        
        const {version_code} = req
        let curret_version_code;
            const sql = `SELECT * FROM game_settings order by set_id DESC limit 1`
            let versions = await db.query(sql);  

            if(versions.length>0)
            {   
                const version = (JSON.parse(JSON.stringify(versions))[0]);
                console.log(version,versions ,'versions')
                if(version_code == version.version_code)
                {
                  
                    status = 200
                    curret_version_code = version.version_code
                    message = "No update";
                    curret_version_code=version.version_code
                  
                }else{
                   
                   if(version.is_status ==2){
                        status = 404 
                        message ="Update mandatory";
                        curret_version_code=version.version_code
                        
                    }else{
                        status = 200 
                        message = "No Update";
                        curret_version_code=version.version_code
                    }
                      
                }  
            }else{
                message = "Something Went wrong!"
                status  = 404 
            } 
             
            data={
                curret_version_code,
                download_url:"http://localhost:4000/"       
            }  
       
       return sendResponse(status,message,data)
    } catch (error) {
        return error
    }
}
 

module.exports = {
    onCheckVersion, 
}