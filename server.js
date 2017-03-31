var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken'); //Used to create, sign, and verify tokens
var config = require('./config'); //get our config fikle
var User = require('./app/models/user'); //get our mongoose model


//config
var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Use morgan to log request to de console
app.use(morgan('dev'));


//ROUTES
app.get('/', function(req, res) {
  res.send('Hello, api on http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
  var nick = new User({
    name: 'Nick pedestrian',
    password: 'password',
    admin: true
  });

  nick.save(function(err){
    if (err) throw err;

    console.log('user saved successfully');
    res.json({ success: true });
  });
});


var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res) {

  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found'});
    } else if (user) {

      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong Pwd'});
      } else {
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440
        });

        res.json({
          success: true,
          message: 'Enjoy your token',
          token: token
        });
      }
    }
  });
});
//route middleware to verify the token
apiRoutes.use(function(req, res, next ) {

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) { return res.json({ success: false, message: "Failed to authenticate Token "});
    } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    });
  }
});


apiRoutes.get('/', function(req, res) {
  res.json({ message: 'welcome to our API'});
});

apiRoutes.get('/users', function(req, res ) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes);

app.listen(port);
console.log('maggic happens at http://localhost:'+ port);
