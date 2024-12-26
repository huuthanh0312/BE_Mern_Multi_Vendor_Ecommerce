const { responseReturn } = require('../../utils/response')
const sellerModel = require('../../models/sellerModel')

class sellerController {
  //@desc  Fetch get sellers
  //@route GET /api/sellers
  //@access private
  getSellers = async (req, res) => {
    const { page, parPage, searchValue } = req.query
    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue && page && parPage) {
        const sellers = await sellerModel
          .find({ $text: { $search: `${searchValue}` }, status: 'pending' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalSeller = await sellerModel.find({
          $text: { $search: `${searchValue}` },
          status: 'pending'
        }).countDocuments
        responseReturn(res, 200, { sellers, totalSeller })
      } else if (searchValue == '' && page && parPage) {
        const sellers = await sellerModel
          .find({ status: 'pending' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalSeller = await sellerModel.find({ status: 'pending' }).countDocuments()
        responseReturn(res, 200, { sellers, totalSeller })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch get seller by id
  //@route get /api/sellers/:sellerId
  //@access private
  getSeller = async (req, res) => {
    const { sellerId } = req.params
    try {
      const seller = await sellerModel.findById(sellerId)
      //console.log(seller)
      responseReturn(res, 200, { seller })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
    //end method
  }

  //@desc  Fetch update status seller by id
  //@route get /api/sellers/update-status
  //@access private
  updateSellerStatus = async (req, res) => {
    const { sellerId, status } = req.body
    try {
      const result = await sellerModel.findByIdAndUpdate(sellerId, { status: status })
      if (!result) {
        return responseReturn(res, 404, { error: 'Updated Status failed' })
      }
      const seller = await sellerModel.findById(sellerId)
      responseReturn(res, 200, { seller, message: ' Seller Updated Status Successfully' })
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
    //end method
  }

  //@desc  Fetch get sellers
  //@route GET /api/sellers/active?page=searchValue=parPage=
  //@access private
  getActiveSellers = async (req, res) => {
    let { page, searchValue, parPage } = req.query
    //console.log(req.query)
    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue == '' && page && parPage) {
        const sellers = await sellerModel
          .find({ status: 'active' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        // Đếm tổng số sellers phù hợp
        const totalSeller = await sellerModel.countDocuments({ status: 'active' })
        responseReturn(res, 200, { sellers, totalSeller })
      } else if (searchValue && page && parPage) {
        const sellers = await sellerModel
          .find({ $text: { $search: searchValue }, status: 'active' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalSeller = await sellerModel.find({
          $text: { $search: searchValue },
          status: 'active'
        }).countDocuments
        responseReturn(res, 200, { sellers, totalSeller })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method

  //@desc  Fetch get sellers
  //@route GET /api/sellers/active?page=searchValue=parPage=
  //@access private
  getDeactiveSellers = async (req, res) => {
    let { page, searchValue, parPage } = req.query
    //console.log(req.query)
    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue == '' && page && parPage) {
        const sellers = await sellerModel
          .find({ status: 'deactive' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        // Đếm tổng số sellers phù hợp
        const totalSeller = await sellerModel.countDocuments({ status: 'deactive' })
        responseReturn(res, 200, { sellers, totalSeller })
      } else if (searchValue && page && parPage) {
        const sellers = await sellerModel
          .find({ $text: { $search: searchValue }, status: 'deactive' })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 })
        const totalSeller = await sellerModel.find({
          $text: { $search: searchValue },
          status: 'deactive'
        }).countDocuments
        responseReturn(res, 200, { sellers, totalSeller })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}
module.exports = new sellerController()
