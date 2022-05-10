const bcrypt = require("bcrypt");
const check = require("../validation/CheckValidation");
// const Token = require('../middleware/AuthToken')
const conn = require("../../config/db");

const path = require("path");
const moment = require("moment");
// Admin login
let message;
let status;
let data = {};
const calculateAge = (birthday) => {
  const startDate = new Date();
  const endDate = new Date(birthday);
  return Math.abs(moment.duration(endDate - startDate).years());
};

const panVerification = async (req, res) => {
  var d1 = new Date(req.body.pan_card_dob);
  const dob = `${d1.getUTCFullYear()}-${d1.getMonth()}-${d1.getDate()}`;
  if (!(calculateAge(req.body.pan_card_dob) > 10)) {
    res.send({ status: 404, message: "Please enter valid dob" });
  }

  try {
    const errors = check.resultsValidator(req);
    if (errors.length > 0) {
      return res.status(400).json({
        method: req.method,
        status: res.statusCode,
        error: errors,
      });
    } else {
      //check userID
      let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
      let user = await conn.query(sql, [req.body.user_id, 1]);
      if (!user.length > 0)
        res.send({ status: 404, message: "Invalid user ID" });
      //check File Validation
      if (!req.files || Object.keys(req.files).length == 0) {
        res
          .status(400)
          .send({ status: statusCode, message: "No file are uploaded" });
      }
      prfoileFile = req.files.pan_image;
      const extensionName = path.extname(prfoileFile.name); // fetch the file extension
      const allowedExtension = [".png", ".jpg", ".jpeg"];

      if (!allowedExtension.includes(extensionName)) {
        return res.status(422).send("Invalid File formate");
      }

      //file validation
      let reqPath = path.join(__dirname, "../../public");
      const imagUrl = `KYC/${prfoileFile.name}`;
      uploadPath = `${reqPath}/${imagUrl}`;
      const profile = await prfoileFile.mv(uploadPath);

      //create file url link
      const fileLink = `${req.protocol}://${req.headers.host}/${imagUrl}`;

      //check existing kyc details
      let sql1 = `SELECT * FROM kyc_details WHERE user_id= ? AND is_type =? limit ?`;
      let kyc_details = await conn.query(sql1, [req.body.user_id, "PAN", 1]);

      const formData = {
        card_number: req.body.pan_card_number,
        card_dob: dob,
        card_per_name: req.body.pan_card_name,
        file_url: fileLink,
        user_id: req.body.user_id,
        is_type: "PAN",
      };
      //check already exist or not
      if (kyc_details.length > 0) {
        let sql1 = "UPDATE kyc_details Set ? WHERE kyc_id= ?";
        user = await conn.query(sql1, [formData, kyc_details[0].kyc_id]);
        status = 200;
        message = "Successfully uploaded";
      } else {
        sql = `INSERT INTO kyc_details set ?`;
        user = await conn.query(sql, formData);
        if (user) {
          status = 200;
          message = "Successfully uploaded";
        }
      }

      const responseData = {
        status: status,
        message,
      };

      res.send(responseData);
    }
  } catch (error) {
    res.send({ authLogin: error });
  }
};

const dlVerification = async (req, res) => {
  var d1 = new Date(req.body.adhar_card_dob);
  const dob = `${d1.getUTCFullYear()}-${d1.getMonth()}-${d1.getDate()}`;
  if (!(calculateAge(req.body.adhar_card_dob) > 10)) {
    res.send({ status: 404, message: "Please enter valid dob" });
  }
  //check File Validation
  if (!req.files || Object.keys(req.files).length < 1) {
    res.status(400).send({ status: 404, message: "No file are uploaded" });
  }
  try {
    const errors = check.resultsValidator(req);
    if (errors.length > 0) {
      return res.status(400).json({
        method: req.method,
        status: res.statusCode,
        error: errors,
      });
    } else {
      let status = 404;
      //check userID
      let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
      let user = await conn.query(sql, [req.body.user_id, 1]);
      console.log(user);
      if (!user.length > 0)
        res.send({ status: 404, message: "Invalid user ID" });
      //check File Validation
      if (!req.files || Object.keys(req.files).length == 0) {
        res
          .status(400)
          .send({ status: statusCode, message: "No file are uploaded" });
      }
      prfoileFile = req.files.adhar_fronted_image;
      prfoileFile1 = req.files.adhar_backend_image;
      const extensionName = path.extname(prfoileFile.name);
      const extensionName1 = path.extname(prfoileFile.name);
      const allowedExtension = [".png", ".jpg", ".jpeg"];

      if (!allowedExtension.includes(extensionName)) {
        return res.status(422).send("Invalid File formate");
      }

      if (!allowedExtension.includes(extensionName1)) {
        return res.status(422).send("Invalid File formate");
      }
      //file validation
      let reqPath = path.join(__dirname, "../../public");
      const imagUrl = `KYC/${req.body.user_id}2-${prfoileFile.name}`;
      let uploadPath = `${reqPath}/${imagUrl}`;
      await prfoileFile.mv(uploadPath);
      const imagUrl1 = `KYC/${req.body.user_id}1-${prfoileFile1.name}`;
      let uploadPath1 = `${reqPath}/${imagUrl1}`;
      await prfoileFile.mv(uploadPath1);

      const fileLink = `${req.protocol}://${req.headers.host}/${imagUrl}`;
      const fileLink1 = `${req.protocol}://${req.headers.host}/${imagUrl1}`;
      //check existing kyc details
      let sql1 = `SELECT * FROM kyc_details WHERE user_id= ? AND is_type =? limit ?`;
      let kyc_details = await conn.query(sql1, [req.body.user_id, "ADHAR", 1]);

      const formData = {
        card_number: req.body.adhar_card_number,
        card_dob: dob,
        card_per_name: req.body.adhar_card_name,
        file_url: fileLink,
        file2: fileLink1,
        user_id: req.body.user_id,
        is_type: "ADHAR",
      };
      //check already exist or not
      if (kyc_details.length > 0) {
        let sql1 = "UPDATE kyc_details Set ? WHERE kyc_id= ?";
        user = await conn.query(sql1, [formData, kyc_details[0].kyc_id]);
        status = 200;
        message = "Successfully uploaded";
      } else {
        let sql = `INSERT INTO kyc_details set ?`;
        user = await conn.query(sql, formData);
        if (user) {
          status = 200;
          message = "Successfully uploaded";
        }
      }

      const responseData = {
        status: status,
        message,
      };

      res.send(responseData);
    }
  } catch (error) {
    const responseData = {
      status: 500,
      message: "Something went wrong",
    };

    res.send(responseData);
  }
};
const voterVerification = async (req, res) => {
  var d1 = new Date(req.body.voter_card_dob);
  const dob = `${d1.getUTCFullYear()}-${d1.getMonth()}-${d1.getDate()}`;
  if (!(calculateAge(req.body.voter_card_dob) > 10)) {
    res.send({ status: 404, message: "Please enter valid dob" });
  }

  try {
    const errors = check.resultsValidator(req);
    if (errors.length > 0) {
      return res.status(400).json({
        method: req.method,
        status: res.statusCode,
        error: errors,
      });
    } else {
      //check userID
      let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
      let user = await conn.query(sql, [req.body.user_id, 1]);
      if (!user.length > 0)
        res.send({ status: 404, message: "Invalid user ID" });
      //check File Validation
      if (!req.files || Object.keys(req.files).length == 0) {
        res
          .status(400)
          .send({ status: statusCode, message: "No file are uploaded" });
      }
      const file = req.files.voter_image;
      const extensionName = path.extname(file.name); // fetch the file extension
      const allowedExtension = [".png", ".jpg", ".jpeg"];

      if (!allowedExtension.includes(extensionName)) {
        return res.status(422).send("Invalid File formate");
      }

      //file validation
      let reqPath = path.join(__dirname, "../../public");
      prfoileFile = req.files.voter_image;
      const imagUrl = `KYC/${prfoileFile.name}`;
      uploadPath = `${reqPath}/${imagUrl}`;
      const profile = await prfoileFile.mv(uploadPath);

      //create file url link
      const fileLink = `${req.protocol}://${req.headers.host}/${imagUrl}`;

      //check existing kyc details
      //check existing kyc details
      let sql1 = `SELECT * FROM kyc_details WHERE user_id= ? AND is_type =? limit ?`;
      let kyc_details = await conn.query(sql1, [
        req.body.user_id,
        "VoterID",
        1,
      ]);

      const formData = {
        card_number: req.body.voter_card_number,
        card_dob: dob,
        card_per_name: req.body.voter_card_name,
        file_url: fileLink,
        user_id: req.body.user_id,
        is_type: "VoterID",
      };
      //check already exist or not
      if (kyc_details.length > 0) {
        let sql1 = "UPDATE kyc_details Set ? WHERE kyc_id= ?";
        user = await conn.query(sql1, [formData, kyc_details[0].kyc_id]);
        status = 200;
        message = "Successfully uploaded";
      } else {
        sql = `INSERT INTO kyc_details set ?`;
        user = await conn.query(sql, formData);
        if (user) {
          status = 200;
          message = "Successfully uploaded";
        }
      }

      const responseData = {
        status: status,
        message,
      };

      res.send(responseData);
    }
  } catch (error) {
    res.send({ authLogin: error });
  }
};
const userKycHistory = async (req, res) => {
  try {
    //check existing kyc details

    const sql1 = `SELECT * from kyc_details LEFT JOIN users ON kyc_details.user_id = users.user_id`;
    const results = await conn.query(sql1);
    if (results.length > 0) {
      const responses = JSON.parse(JSON.stringify(results));
      message = "Success";
      status = 200;
      data = responses;
    } else {
      status = 404;
      message = "No kyc history";
    }

    const responseData = {
      status,
      message,
      data: data,
    };
    res.send(responseData);
  } catch (error) {
    res.send({ authLogin: error });
  }
};

module.exports = {
  panVerification,
  voterVerification,
  dlVerification,
  userKycHistory,
};
