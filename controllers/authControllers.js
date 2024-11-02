const adminModel = require('../models/adminModel');
const { responseReturn } = require('../utils/response');
const bcrpty = require('bcrypt');
const { createToken } = require('../utils/tokenCreate');
const sellerModel = require('../models/sellerModel');
const sellerCustomerModel = require('../models/chat/sellerCustomerModel');

class authControllers {

  //@desc  Fetch admin login
  //@route POST /api/admin-login
  //@access private
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


  //@desc  Fetch seller register
  //@route POST /api/seller-register
  //@access private
  seller_register = async (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.body)
    try {
      const getUser = await sellerModel.findOne({ email })
      //console.log(getUser)
      if (getUser) {
        responseReturn(res, 404, { error: "Email Already Exit" })

      } else {
        const seller = await sellerModel.create({
          email, name, password: await bcrpty.hash(password, 10), method: 'menualy', shopInfo: {}
        })
        await sellerCustomerModel.create({
          myId: seller.id
        })
        //create token 7day
        const token = await createToken({
          id: seller.id,
          role: seller.role
        })
        //setup cookie token 7day
        res.cookie('accessToken', token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        responseReturn(res, 201, { message: "Register Success" })

      }
    } catch (error) {
      // console.log(error.message)
      responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }
  //end method

  //@desc  Fetch seller login
  //@route POST /api/seller-login
  //@access private
  seller_login = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
      const seller = await sellerModel.findOne({ email }).select('+password')
      //console.log(seller)
      if (seller) {
        const match = await bcrpty.compare(password, seller.password)
        //console.log(match)
        if (match) {
          //create token 7day
          const token = await createToken({
            id: seller.id,
            role: seller.role
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

  //@desc  Fetch get info user
  //@route get /api/get-user
  //@access private middleware
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