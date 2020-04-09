var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '11' });
});

router.get('/mongooseTest', function (req, res, next) {
  mongoose.connect('mongodb://localhost/pets', {

  })
  mongoose.Promise = global.Promise;
  var Cat = mongoose.model('Cat', { name: String, age: Number });
  var tom = new Cat({ name: 'Tom', age: 18 });
  var rick = new Cat({ name: 'Rick', age: 18 });
  tom.save(function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('success insert');
    }
  });
  rick.save(function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('success insert');
    }
  });
  res.send('数据库链接测1试')
})

module.exports = router;
