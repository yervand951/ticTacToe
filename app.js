const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const server = require('http').Server(app);

require('./routes/socket')(server);
require('./models/Users');
require('./config/passport');

mongoose.promise = global.Promise;

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'passport-tutorial', cookie: {maxAge: 60000}, resave: false, saveUninitialized: false}));
app.use(require('./routes'));

//Configure Mongoose
mongoose.connect('mongodb://localhost/ticTacToe', {
    useNewUrlParser: true,
    useCreateIndex: true,
});
mongoose.set('debug', true);


server.listen(8000, () => console.log('Server running on http://localhost:8000/'));
