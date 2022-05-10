const jwt = require('jsonwebtoken')
const conn = require('../../config/db')

const auth = async (req, res, next) => {
    try {
        const token   = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'the-super-strong-secrect')  
        console.log(decoded)
        let sql = "" 
        if(decoded.role_id ===1){
            sql = "SELECT * FROM admin INNER JOIN roles ON roles.role_id = admin.role_id WHERE LOWER(admin.admin_id)= ? AND admin.token=? limit ?"
        }else if(decoded.role_id ===2){
            sql = "SELECT * FROM distributor INNER JOIN roles ON roles.role_id = distributor.role_id WHERE distributor.id= ? AND distributor.token=? limit ?" 
        }else if(decoded.role_id ===3){
           sql = "SELECT * FROM user INNER JOIN roles ON roles.role_id = user.role_id WHERE user.id= ? AND user.token=? limit ?" 
        }else{
           sql = "SELECT * FROM user INNER JOIN roles ON roles.role_id = user.role_id WHERE user.id= ? AND user.token=? limit ?" 
        }  
        let user = await conn.query(sql, [decoded.user_id,token, 1]);  
        if (!user) {
            throw new Error()
        } 
        req.token   = token
        req.user    = user[0]
        req.admin_id= decoded.admin_id
        req.role    = decoded.role
        req.role_id = decoded.role_id
        req.user_id = decoded._id  
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth