const express = require('express');
const cors = require('cors');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
//const morgan = require('morgan');


const app = express();

const apiRouter = require('./api/api');

const PORT = process.env.PORT || 4000;

//app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
//app.use(morgan('dev'));


app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
  
module.exports = app;