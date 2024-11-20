const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { dbConnect } = require('./utils/db')

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS.split(','); // Chuyển thành mảng
    if (allowedOrigins.includes(origin) || !origin) {
      // Nếu origin hợp lệ hoặc không có origin (ví dụ: Postman)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions))

//bodyParser
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/', (req, res) => res.send('My Backend TH Shop'))
//Client
app.use('/api/home', require('./routes/home/homeRoutes'))



//Dashboard
app.use('/api', require('./routes/authRoutes'))
app.use('/api', require('./routes/dashboard/categoryRoutes'))
app.use('/api', require('./routes/dashboard/productRoutes'))
app.use('/api', require('./routes/dashboard/sellerRoutes'))


const port = process.env.PORT || 8080
dbConnect()
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
