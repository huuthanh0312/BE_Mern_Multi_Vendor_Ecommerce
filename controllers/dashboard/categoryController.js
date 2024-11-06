const formidable = require('formidable')
const { responseReturn } = require('../../utils/response')
const cloudinary = require('cloudinary').v2
const categoryModel = require('../../models/categoryModel');

class categoryControllers {


  //@desc  Fetch add category
  //@route POST /api/categories
  //@access private
  addCategory = async (req, res) => {
    const form = formidable()
    form.parse(req, async (error, fields, files) => {
      if (error) {
        responseReturn(res, 404, { error: 'Add Category Error' })
      } else {
        let { name } = fields
        let { image } = files
        const slug = name.trim().toLowerCase().replace(/[/\s]+/g, '-').replace(/[^\w-]+/g, '')

        //config cloudinary
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true
        })
        try {
          const result = await cloudinary.uploader.upload(image.filepath, { folder: 'categories' })
          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url,
            })
            responseReturn(res, 201, { category, message: "Category Add Successfully" })
          } else {
            responseReturn(res, 404, { error: "Image Upload File" })
          }

        } catch (error) {
          responseReturn(res, 500, { error: 'Internal Server Error' })
        }

      }
    })

  }
  //end method

  //@desc  Fetch get category
  //@route POST /api/categories
  //@access private
  getCategory = async (req, res) => {
    const { page, parPage, searchValue } = req.query
    const skipPage = parseInt(parPage) * (parseInt(page) - 1)
    try {
      if (searchValue && page && parPage) {
        const categories = await categoryModel.find({ $text: { $search: searchValue } }).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalCategory = await categoryModel.find({ $text: { $search: searchValue } }).countDocuments
        responseReturn(res, 200, { categories, totalCategory })

      } else if (searchValue == '' && page && parPage) {
        const categories = await categoryModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: - 1 })
        const totalCategory = await categoryModel.find({}).countDocuments()
        responseReturn(res, 200, { categories, totalCategory })

      } else {
        const categories = await categoryModel.find({}).sort({ createdAt: - 1 })
        const totalCategory = await categoryModel.find({}).countDocuments()
        responseReturn(res, 200, { categories, totalCategory })
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message })
    }

  }
  //end method
}

module.exports = new categoryControllers()