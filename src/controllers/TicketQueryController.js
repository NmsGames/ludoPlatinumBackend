 
 
const conn = require("../../config/db");

const path      = require("path");
const moment    = require("moment");
// Admin login
let message;
let status;
let data = {};
let sql = ""
let responseData;
let updateResponse;
 

const CreateTicket = async (req, res) => {
  
  try {
        const {user_id,query_title,query_description,tournament_id} = req.body
        sql           = `SELECT * FROM users WHERE user_id= ? limit ?`;
        responseData  = await conn.query(sql, [user_id, 1]);
        if(responseData.length>0)
        {

           
            //If Scrren shot available
            let fileLink = "" 
            if(req.files)
            {
              if ((Object.keys(req.files).length) >0) 
              {
                  let prfoileFile     = req.files.query_screen_shot;
                  const extensionName = path.extname(prfoileFile.name); // fetch the file extension
                  const allowedExtension= [".png", ".jpg", ".jpeg"];
              
                  if (!allowedExtension.includes(extensionName)) {
                      return res.status(422).send("Invalid File formate");
                  }
                  let randomGen = moment().utcOffset(330).format("YYYYMMDDHHmmss")
                //file validation
                let reqPath   = path.join(__dirname, "../../public");
                const imagUrl = `Query/${randomGen}-${prfoileFile.name}`;
                uploadPath    = `${reqPath}/${imagUrl}`;
                const profile = await prfoileFile.mv(uploadPath);
                fileLink      = `${req.protocol}://${req.headers.host}/${imagUrl}`;
              }
            }
          

            if(query_title)
            {
                if(query_description){
                 let NewTicket = moment().utcOffset(330).format("MMDDHHmmss")
                    const formData = {
                        ticket_title    : query_title,
                        ticket_id       : NewTicket,
                        description     : query_description,
                        created_date    : moment().utcOffset(330).format("YYYY-MM-DD"),
                        image           : fileLink,
                        user_id         : user_id,
                        tournament_id   : tournament_id,
                        ticket_generate_time : moment().utcOffset(330).format("HH:mm:ss"),
                      };
                      sql           = `INSERT INTO user_tickets Set ?`
                      responseData  = await conn.query(sql, formData);
                      if(responseData){
                        status  = 200
                        message = `Ticket generated Id# ${NewTicket}`
                      }else{
                        status = 404
                        message = "Something went wrong!"
                      }
                }else{
                    status = 404
                    message = "Description should not be empty!"
                }
            }else{
                status = 404
                message = "Query Title should not be empty!"
            }
             
        }else{
            status = 404
            message = "Invalid user ID"
        } 
       responseData = {
        status: status,
        message,
      }; 
      res.send(responseData); 
  } catch (error) {
    responseData = {
        status: 500,
        message:"Database error!",
        error
      }; 
    res.send(responseData);
  }
};

 
module.exports = {
    CreateTicket,
};
