//Generate auth token
const jwt =  require('jsonwebtoken')
const conn = require('../../config/db')
  
async function authToken(data) {  
    const tokens = jwt.sign({ user_id: data.id,role: data.role_name,role_id: data.role_id,admin_id:data.user_id}, 'the-super-strong-secrect', { expiresIn: '1h' });
    const formData = {
        token:tokens
    }
    let sql = ""
    if(data.role_id ===1){
        sql = "UPDATE admin Set ? WHERE admin_id= ?"
    }else if(data.role_id ===2){
        sql = "UPDATE distributor Set ? WHERE id= ?"
    }else if(data.role_id ===3){
        sql = "UPDATE user Set ? WHERE id= ?"
    }else{
        sql = "UPDATE user Set ? WHERE id= ?"
    } 
    await conn.query(sql, [formData,data.id])
    return tokens
}

module.exports = {
	authToken, 
};