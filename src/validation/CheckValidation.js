const { validationResult, check } = require('express-validator')


// validate  the result 
const resultsValidator =  (req) => {
  const messages = []
  if (!validationResult(req).isEmpty()) {
    const errors = validationResult(req).array()
    for (const i of errors) {
      messages.push(i.msg)
    }
  }
  return messages
}

// Register validation
const registerValidator = () => {
  return [ 
    check('username').notEmpty()
      .withMessage('Username is required!')
      .isLength({ min: 6 })
      .withMessage('Username container at least 6 ')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z\d&]/) 
      .withMessage('Username contain At least one uppercase.At least one lower case & one number')
      .trim().escape(),
    check('password')
      .notEmpty().withMessage('password is required').isLength({ min: 6 })
      .withMessage('password must be greater 5 characters')
  ]
}

//login Validation
const loginValidator = () => {
    return [
      check('email').notEmpty().withMessage('email is required'),
      check('password').notEmpty().withMessage('password is required')
    ]
  }
  //Forgot password validation
  const sendOtp = () => {
    return [
      check('username').notEmpty().withMessage('username is required')
    ]
  }

  //Avatar validation
  const AvatarValidation = () => {
    return [
      check('avatar').notEmpty().withMessage('Please upload avatar')
    ]
  }

  //Change password validation
  const changePasswordValidator = () => {
    return [
      check('password').notEmpty().withMessage('Old password is required'),
      check('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({min:6, max:16}) 
      .withMessage('Password must be between 6 to 16 characters') 
    ]
  }
  //Otp verify validation
  const forgotPasswordValidator = () => {
    return [
      check('username').notEmpty().trim().withMessage('Username is required'),
      check('otp').notEmpty().withMessage('Otp is required'),
      check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({min:6, max:16}) 
      .withMessage('Password must be between 6 to 16 characters') 
    ]
  }
  const addMoneyValidator =()=>{
    return [
      check('orderAmount').notEmpty().trim().withMessage('Amount is required'), 
      check('customerPhone').notEmpty().trim().withMessage('Phone is required').isInt() 
      // Custom message
      .withMessage('Mobile is not valid') , 
      check('customerEmail').notEmpty().trim().withMessage('Email is required')  
      .isEmail().withMessage('Email is not valid'),
      check('customerName').notEmpty().trim().withMessage('Name is required')  
    ]
  }
  const userIdValidator =()=>{
    return [
      check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()   
      .withMessage('Enter valid Id')
    ]
  }

//Pan validation
  const panCardValidator =()=>{
    return [
      check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()   
      .withMessage('Enter valid Id'),
      check('pan_card_number').notEmpty().trim().withMessage('Pan Card number is required'), 
      check('pan_card_name').notEmpty().trim().withMessage('Per PAN name is required'),
      check('pan_card_dob').notEmpty().trim().withMessage('DOB is required')
    ]
  }
 
   //DL validation
   const dlCardValidator =()=>{
    return [
      check('user_id').notEmpty().trim().withMessage('User Id is required')  
      .withMessage('Enter valid Id'),
      check('adhar_card_number').notEmpty().trim().withMessage('Adhar number is required'), 
      check('adhar_card_name').notEmpty().trim().withMessage('Full name as Adhar'),
      check('adhar_card_dob').notEmpty().trim().withMessage('DOB is required')
    ]
  }
   //Voter validation
   const voterCardValidator =()=>{
    return [
      check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()   
      .withMessage('Enter valid Id'),
      check('voter_card_number').notEmpty().trim().withMessage('Voter ID number is required'), 
      check('voter_card_name').notEmpty().trim().withMessage('Full name as per Voter ID Card'),
      check('voter_card_dob').notEmpty().trim().withMessage('DOB is required')
    ]
  }
  module.exports = {
    userIdValidator,
    addMoneyValidator,
    loginValidator,
    registerValidator,
    resultsValidator,
    sendOtp,
    AvatarValidation,
    changePasswordValidator,
    forgotPasswordValidator,
    panCardValidator,
    voterCardValidator,
    dlCardValidator
  }