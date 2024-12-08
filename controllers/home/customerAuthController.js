const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const { cloudinaryConfig } = require('../../utils/cloudinaryConfig')
const customerModel = require('../../models/customerModel')
const { createToken } = require('../../utils/tokenCreate')
const bcrpty = require("bcrypt")
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')


class customerAuthController {

  //@desc  Fetch customer register
  //@route POST /api/customer/register
  //@access private
  customer_register = async (req, res) => {
    const { email, name, password } = req.body
    //console.log(req.body)
    try {
      if (!email || !name || !password) {
        return responseReturn(res, 400, { error: 'All fields are required.' })
      }
      if (password.length < 8) {
        return responseReturn(res, 400, { error: 'Password must be at least 8 characters long.' })
      }

      const getUser = await customerModel.findOne({ email })
      if (getUser) {
        responseReturn(res, 404, { error: "Email Already Exit" })
      } else {
        const customer = await customerModel.create({
          email: email.trim(), name: name.trim(), password: await bcrpty.hash(password, 10), method: 'menualy'
        })
        await sellerCustomerModel.create({
          myId: customer.id
        })
        //create token 7day
        const token = await createToken({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          method: customer.method,
        })
        //setup cookie token 7day
        res.cookie('customerToken', token, {
          httpOnly: true, // Ngăn JavaScript phía client truy cập cookie
          sameSite: 'Strict', // Giúp ngăn chặn các cuộc tấn công CSRF
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        responseReturn(res, 201, { token, message: "Register Success" })

      }
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }
  //end method

  //@desc  Fetch customer login
  //@route POST /api/customer/login
  //@access private
  customer_login = async (req, res) => {
    const { email, password } = req.body;
    //console.log(req.body)
    try {
      const customer = await customerModel.findOne({ email }).select('+password')
      //console.log(customer)
      if (customer) {
        const match = await bcrpty.compare(password, customer.password)
        //console.log(match)
        if (match) {
          //create token 7day
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          })
          //setup cookie token 7day
          res.cookie('customerToken', token, {
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
        const user = await customerModel.findById(id)
        responseReturn(res, 200, { userInfo: user })
      } else {
        const customer = await customerModel.findById(id)
        responseReturn(res, 200, { userInfo: customer })
      }
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal Server Error' })
    }
  }

  customer_logout = async (req, res) => {
    res.cookie('customerToken', "", {
      expires: new Date(Date.now())
    })
    responseReturn(res, 200, { message: 'Logout Success' })
  }
  // End Method
}
module.exports = new customerAuthController()