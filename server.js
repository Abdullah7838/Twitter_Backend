const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
const db = require('./db')

const userRoute = require('./Routes/userRoute');
app.use('/api',userRoute);

const postRoute = require('./Routes/postRoute');
app.use('/api',postRoute);

const passwordRoute = require('./Routes/passwordRoute');
app.use('/api',passwordRoute);

const Admin = require('./Routes/Admin');
app.use('/api',Admin)

app.get('/', (req, res) => {
    res.send('Hello World');
  });

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
  });