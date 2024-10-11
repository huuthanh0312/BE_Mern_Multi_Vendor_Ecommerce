const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { dbConnect } = require('./utils/db')

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));

//bodyParser
app.use(bodyParser.json())
app.use(cookieParser())


app.use('/api', require('./routes/authRoutes'))
app.get('/', (req, res) => res.send('My Backend'))

const port = process.env.PORT || 8000
dbConnect()
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
