var authentication = function (username, password, passwordConfirm) {
  var illegals = /\W/;
  var errorArray = [];
  //username
  if (username.length < 5 && username !=0) {
    errorArray.push('User Name must be longer than 4 characters')
  }
  if (username.length > 15) {
    errorArray.push('User Name must be less than 15 characters');
  }
  if (illegals.test(username)) {
    errorArray.push('User Name contains illegal characters. Can only use letters, numbers and underscores (no spaces)');
  }
  if (username === undefined || !username.replace(/\s/g, '').length) {
    errorArray.push('User Name can not be blank');
  }
  //password
  if (password === undefined || !password.replace(/\s/g, '').length) {
    errorArray.push('Password can not be blank');
  }
  if (password.length < 6 && password != 0) {
    errorArray.push('Password must be greater than 5 characters');
  }
  if (password.length >= 31) {
    errorArray.push('Password may not be more than 30 characters');
  }
  if (password != passwordConfirm) {
    errorArray.push('Passwords do not match');
  }
  return errorArray;
}
