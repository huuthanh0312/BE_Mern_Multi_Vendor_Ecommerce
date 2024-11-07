const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const { cloudinaryConfig } = require('../../utils/cloudinaryConfig');
const productModel = require('../../models/productModel');


class productControllers {

  //@desc  Fetch add product
  //@route POST /api/produts
  //@access private
  addProduct = async (req, res) => {
    const { id } = req
    const form = formidable({ multiples: true })
    form.parse(req, async (error, fields, files) => {
      if (error) {
        responseReturn(res, 404, { error: 'Add Product Error' })
      } else {

        let { name, category, price, stock, discount, description, brand, shopName } = fields
        let { images } = files
        const slug = name.trim().toLowerCase().replace(/[/\s]+/g, '-').replace(/[^\w-]+/g, '')

        try {
          const allImageUrl = []
          if (!Array.isArray(images)) {
            images = [images];
          }
          //config cloudinary
          await cloudinaryConfig();
          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(images[i].filepath, { folder: 'products' })
            allImageUrl.push(result.url)
          }

          await productModel.create({
            sellerId: id,
            name,
            slug,
            category: category.trim(),
            price: parseInt(price),
            stock: parseInt(stock),
            discount: parseInt(discount),
            description: description.trim(),
            brand: brand.trim(),
            shopName,
            images: allImageUrl,
          })
          responseReturn(res, 201, { message: "Product Add Successfully" })

        } catch (error) {
          responseReturn(res, 500, { error: error.message })
        }

      }
    })

  }
  //end method

  //@desc  Fetch get category
  //@route POST /api/categories
  //@access private
  getProduct = async (req, res) => {
    const { page, parPage, searchValue } = req.query

    try {
      let skipPage = ''
      if (parPage && page) {
        skipPage = parseInt(parPage) * (parseInt(page) - 1)
      }
      if (searchValue && page && parPage) {
        const products = await productModel.find({ name: { $regex: `${searchValue}`, $options: 'i' } }).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({ name: { $regex: `${searchValue}`, $options: 'i' } }).countDocuments
        responseReturn(res, 200, { products, totalProduct })

      } else if (searchValue == '' && page && parPage) {
        const products = await productModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({}).countDocuments()
        responseReturn(res, 200, { products, totalProduct })

      } else {
        const products = await productModel.find({}).sort({ createdAt: - 1 })
        const totalProduct = await productModel.find({}).countDocuments()
        responseReturn(res, 200, { products, totalProduct })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }
  }
  //end method
}

module.exports = new productControllers()