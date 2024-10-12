const adminModel = require('../models/adminModel');
const { responseReturn } = require('../utils/response');
const bcrpty = require('bcrypt');
const { createToken } = require('../utils/tokenCreate');

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
      const admin = await adminModel.findOne({ email }).select('+password')
      //console.log(admin)
      if (admin) {
        const match = await bcrpty.compare(password, admin.password)
        //console.log(match)
        if (match) {
          //create token 7day
          const token = await createToken({
            id: admin.id,
            role: admin.role
          })
          //setup cookie token 7day
          res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          responseReturn(res, 200, { token, message: "Login Success" })
        } else {
          responseReturn(res, 404, { error: "Password Wrong" })
        }
      } else {
        responseReturn(res, 404, { error: "Email not Found" })
      }
    } catch (error) {
      // console.log(error.message)
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method


  getUser = async (req, res) => {
    const { id, role } = req
    try {
      if (role === 'admin') {
        const user = await adminModel.findById(id)
        responseReturn(res, 200, { userInfo: user })
      } else {
        console.log('Seller Info')
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}

module.exports = new authControllers()