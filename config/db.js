"use strict"
const mysql = require('mysql')
const util = require('util')

const pool = mysql.createPool({
    connectionLimit: 5000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,

    // connection variable
    database: 'ludo_platinum',
    // host            : '127.0.0.1',
    port: 3306,
    user: 'root',
    // password        : '',
   // host: '127.0.0.1',
    user: 'root',
     password: 'LudoPlatinum#1234',
    //password: '',
    // database : 'Ludo_platinum',
    debug: false

})

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }

    if (connection) connection.release()
    return
})

pool.query = util.promisify(pool.query)

module.exports = pool;