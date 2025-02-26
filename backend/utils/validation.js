const validator = require('validator');

exports.validateEmail = (email) => {
  return validator.isEmail(email);
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.validateMobileNumber = (mobileNumber) => {
  // Remove any non-digit characters
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  // Check if it's a valid mobile number (adjust the length check according to your requirements)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
};

exports.validateMessage = (message) => {
  return message && message.trim().length > 0;
}; 