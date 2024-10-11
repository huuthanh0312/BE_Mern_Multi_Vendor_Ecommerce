const jwt = require("jsonwebtoken");

module.exports.createToken = async (data) => {
  //create token admin 7 day sign in
  const token = await jwt.sign(data, process.env.SECRET, {
    expiresIn: '7d'
  })
  return token
}