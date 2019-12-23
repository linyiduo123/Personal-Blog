const express = require("express");
const router = express.Router();
const User = require('../models/User')
const Category = require('../models/Category')
const Content = require('../models/Content')
const encrypy = require('../utils/encrypt')

var data = {}
router.use(function (req, res, next) {
  data = {
    userInfo: req.userInfo,
    categories: []
  }
  Category.find().then(function (categories) {
    data.categories = categories
    next()
  })
})

router.get("/", (req, res, next) => {
  data.category = req.query.category || '',
    data.count = 0,
    data.page = Number(req.query.page || 1),
    data.limit = 5,
    data.pages = 0

  // 筛选首页分类
  var where = {}
  if (data.category) {
    where.category = data.category
  }

  Category.countDocuments().then(function (count) {

    data.count = count
    data.pages = Math.ceil(data.count / data.limit)
    data.page = Math.min(data.page, data.pages) // page最大为pages
    data.page = Math.max(data.page, 1) // page 最小为1
    var skip = (data.page - 1) * data.limit
    return Content.where(where).find().sort({
      addTime: -1
    }).limit(data.limit).skip(skip).populate(['category', 'user'])
  }).then(function (contents) {
    data.contents = contents
    res.render("main/index", data)
  })
});

router.get('/view', (req, res) => {

  var contentid = req.query.contentid || ''
  Content.findOne({
    _id: contentid
  }).then(function (content) {
    data.content = content

    // 记录阅读数
    content.view++
    content.save()
    res.render('main/view', data)
  })
})

//编辑用户信息
router.get('/edit', function (req, res) {
  // 筛选首页分类
  var where = {}
  if (data.category) {
    where.category = data.category
  }
  //1. 在客户端的列表中处理链接问题（需要有 id 参数）
  //获取要编辑的学生 通过id
  User.findById(data.userInfo._id.replace(/"/g, ''), function (err, user) {
    if (err) {
      return res.status(500).send('Server error')
    }
    res.render('main/editUser', {
      userInfo: req.userInfo,
      user: user
    })
  })
})

//提交用户的数据
router.post('/edit', function (req, res) {
  //1. 获取表单数据 req.body
  //2. 通过 id 更新 User.findByIdAndUpdate()
  //3. 重定向到首页
  if (req.body.password.length < 10) {
    req.body.password = encrypy.encrypt(req.body.password);
  }
  User.findByIdAndUpdate(req.body.id.replace(/"/g, ''), req.body, function (err) {
    if (err) {
      return res.status(500).send('server error')
    }
    res.redirect('/')
  }).exec()
})
module.exports = router;