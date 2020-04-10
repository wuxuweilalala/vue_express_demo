var express = require('express');
var router = express.Router();

var user = require('../models/user.js');
var crypto = require('crypto');
var movie = require('../models/movie.js')
var mail = require('../models/mail.js')
var comment = require('../models/comment.js')
const init_token = 'TKL02o'

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 用户登录接口
router.post('/login', function (req, res, next) {
  if (!req.body.username) {
    res.json({ status: 1, message: "用户名为空" })
  }
  if (!req.body.password) {
    res.json({ status: 1, message: "密码为空" })
  }
  user.findUserLogin(req.body.username, req.body.password, function (err, userSave) {
    if (userSave.length !== 0) {
      var token_after = getMD5Password(userSave[0]._id)
      res.json({ status: 0, data: { token: token_after, user: userSave }, message: "用户登录成功" })
    } else {
      res.json({ status: 1, message: "用户名或者密码错误" })
    }
  })
})
// 用户注册接口
router.post('/register', function (req, res, next) {
  if (!req.body.username) {
    res.json({ status: 1, message: "用户名为空" })
  }
  if (!req.body.password) {
    res.json({ status: 1, message: "密码为空" })
  }
  if (!req.body.userMail) {
    res.json({ status: 1, message: "邮箱为空" })
  }
  if (!req.body.userPhone) {
    res.json({ status: 1, message: "手机为空" })
  }
  user.findByUsername(req.body.username, function (err, userSave) {
    if (userSave.length !== 0) {
      console.log(userSave)
      res.json({ status: 1, message: '用户已注册' })
    } else {
      var registerUser = new user({
        username: req.body.username,
        password: req.body.password,
        userMail: req.body.userMail,
        userPhone: req.body.userPhone,
        userAdmin: 0,
        userPower: 0,
        userStop: 0
      })
      registerUser.save(function () {
        res.json({ status: 0, message: '注册成功' })
      })
    }
  })
})
// 用户提交评论
router.post('/postComment', function (req, res, next) {
  if (!req.body.username) {
    var username = '匿名用户'
  }
  if (!req.body.movie_id) {
    res.json({ status: 1, message: "电影 id 为空" })
  }
  if (!req.body.context) {
    res.json({ status: 1, message: "评论内容为空" })
  }
  var saveComment = new comment({
    movie_id: req.body.movie_id,
    username: req.body.username ? req.body.username : username,
    context: req.body.context,
    check: 0
  })
  saveComment.save(function (err) {
    if (err) {
      res.json({ status: 1, message: err })
    } else {
      res.json({ status: 0, message: '评论成功' })
    }
  })
})
// 用户点赞
router.post('/support', function (req, res, next) {
  if (!req.body.movie_id) {
    res.json({ status: 1, message: "电影id传递失败" })
  }
  movie.findById(req.body.movie_id, function (err, supportMovie) {
    console.log('supportMovie')
    console.log(supportMovie)
    movie.update({ _id: req.body.movie_id }, { movieNumSuppose: supportMovie.movieNumSuppose + 1 }, function (err) {
      if (err) {
        res.json({ status: 1, message: '点赞失败', data: err })
      } else {
        res.json({ status: 0, message: "点赞成功" })
      }
    })
  })
})
// 用户找回密码
router.post('/findPassword', function (req, res, next) {
  if (req.body.repassword) {
    if (req.body.token) {
      if (!req.body.user_id) {
        res.json({ status: 1, message: "用户登录错误" })
      }
      if (!req.body.password) {
        res.json({ status: 1, message: "用户老密码错误" })
      }
      if (req.body.token == getMD5Password(req.body.user_id)) {
        user.findOne({ _id: req.body.user_id, password: req.body.password }, function (err, checkUser) {
          if (checkUser) {
            user.update({ _id: req.body.user_id }, { password: req.body.repassword }, function (err, userUpdate) {
              if (err) {
                res.json({ status: 1, message: "更改错误", data: err })
              }
              res.json({ status: 0, message: "更改成功", data: userUpdate })
            })
          } else {
            res.json({ status: 1, message: "用户老密码错误" })
          }
        })
      } else {
        res.json({ status: 1, message: '用户登录错误' })
      }
    } else {
      user.findUserPassword(req.body.username, req.body.userMail, req.body.userPhone, function (err, userFound) {
        if (userFound.length !== 0) {
          user.update({ _id: userFound[0]._id }, { password: req.body.repassword }, function (err, userUpdate) {
            if (err) {
              res.json({ status: 1, message: '更改错误', data: err })
            }
            res.json({ status: 0, message: "更改成功", data: userUpdate })
          })
        } else {
          res.json({ status: 1, message: "信息错误" })
        }
      })
    }
  } else {
    if (!req.body.username) {
      res.json({ status: 1, message: "用户名为空" })
    }
    if (!req.body.userMail) {
      res.json({ status: 1, message: "邮箱为空" })
    }
    if (!req.body.userPhone) {
      res.json({ status: 1, message: "手机为空" })
    }
    user.findUserPassword(req.body.username, req.body.userMail, req.body.userPhone, function (err, userFound) {
      if (userFound.length !== 0) {
        res.json({ status: 0, message: '验证成功,请修改密码', data: { username: req.body.username, userMail: req.body.userMail, userPhone: req.body.userPhone, } })
      } else {
        res.json({ status: 1, message: "信息错误" })
      }
    })
  }
})
// 用户发送站内信
router.post('/sendEmail', function (req, res, next) {
  if (req.body.token === getMD5Password(req.body.user_id)) {
    user.findByUsername(req.body.toUserName, function (err, toUser) {
      if (toUser.length !== 0) {
        var newEmail = new mail({
          fromUser: req.body.user_id,
          toUser: toUser[0]._id,
          title: req.body.title,
          context: req.body.context,
        })
        newEmail.save(function () {
          res.json({ status: 0, message: "发送成功" })
        })
      } else {
        res.json({ status: 1, message: "您发送的对象不存在" })
      }
    })
  } else {
    res.json({ status: 1, message: "用户登录错误" })
  }
})
// 获取 MD5 值
function getMD5Password(id) {
  var md5 = crypto.createHash('md5');
  var token_before = id + init_token;
  return md5.update(token_before).digest('hex')
}

module.exports = router;
