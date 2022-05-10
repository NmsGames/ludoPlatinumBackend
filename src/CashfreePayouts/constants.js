const URLS = {
    BENEFICIARY_ADD: '/payout/v1/addBeneficiary',
    BENEFICIARY_GET_BY_ID: '/payout/v1/getBeneficiary/',
    BENEFICIARY_GET_ID_BY_BANK_DETAILS: '/payout/v1/getBeneId',
    BENEFICIARY_REMOVE: '/payout/v1/removeBeneficiary',
  
    CASHGRAM_CREATE: '/payout/v1/createCashgram',
    CASHGRAM_GET_STATUS: '/payout/v1/getCashgramStatus',
    CASHGRAM_DEACTIVATE: '/payout/v1/deactivateCashgram',
  
    SELF_WITHDRAWAL: '/payout/v1/selfWithdrawal',
    GET_BALANCE: '/payout/v1/getBalance',
  
    REQUEST_TRANSFER: '/payout/v1/requestTransfer',
    ASYNC_REQUEST_TRANSFER: '/payout/v1/requestAsyncTransfer',
    GET_TRANSFER_STATUS: '/payout/v1/getTransferStatus',
    GET_TRANSFERS: '/payout/v1/getTransfers',
    REQUEST_BATCH_TRANSFER: '/payout/v1/requestBatchTransfer',
    GET_BATCH_TRANSFER_STATUS: '/payout/v1/getBatchTransferStatus',
  
    VALIDATE_BANK_DETAILS: '/payout/v1/validation/bankDetails',
    ASYNC_VALIDATE_BANK_DETAILS: '/payout/v1/asyncValidation/bankDetails',
    GET_BANK_VALIDATION_STATUS: '/payout/v1/getValidationStatus/bank',
    VALIDATE_UPI_DETAILS: '/payout/v1/validation/upiDetails',
    VALIDATE_BULK_BANK_ACTIVATION: '/payout/v1/bulkValidation/bankDetails',
    GET_BULK_VALIDATION_STATUS: '/payout/v1/getBulkValidationStatus',
  };
  
  const ENVS = {
    TEST:'https://payout-api.cashfree.com',
    PRODUCTION:'https://payout-api.cashfree.com',
  };
  const KEYS = {
    TEST:{
      ClientId    :'CF163432C93F0FE2HA3KP9U0GICG',
      ClientSecret:'3e7e8c33906be3a2a012066cf3b2aa03c6ff6c31'
    },
    PRODUCTION:{
      ClientId    :'CF145039C8U5U8RG1A0QGEN8J0I0',
      ClientSecret:'c132bbed518248aae3859bd1c0b9dbe043f6ed80'
    },
  }
  
  module.exports = {URLS,ENVS,KEYS};
  

//   clientId : CF163432C93F0FE2HA3KP9U0GICG
// clientSecret : 3e7e8c33906be3a2a012066cf3b2aa03c6ff6c31

// payment gatway
// AppID
// 1634328881cd96cf49ef35fbd4234361
// Secret Key
// 8d3d64d458a441b699b40db9b674aa184a5c89d