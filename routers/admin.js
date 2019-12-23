const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Category = require('../models/Category')
const Content = require('../models/Content')
const encrypy = require('../utils/encrypt')

// router.use((req, res, next) => {
//   if(!req.userInfo.isAdmin) {
//     res.send('对不起，只有管理员才能进入后台管理')
//     return
//   }
//   next()
// })

router.get('/', (req, res) => {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})

// 用户管理
router.get('/user', (req, res) => {
  // 从数据库读取所有用户数据
  var page = Number(req.query.page || 1)
  var limit = 2
  var pages = 0

  User.countDocuments().then(function (count) {

    pages = Math.ceil(count / limit)
    page = Math.min(page, pages) // page最大为pages
    page = Math.max(page, 1) // page 最小为1
    var skip = (page - 1) * limit
    User.find().limit(limit).skip(skip).then(function (users) {
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})

//编辑用户数据
router.get('/edit', function (req, res) {
  //1. 在客户端的列表中处理链接问题（需要有 id 参数）
  //获取要编辑的学生 通过id
  User.findById(req.query.id.replace(/"/g, ''), function (err, user) {
    if (err) {
      return res.status(500).send('Server error')
    }
    res.render('admin/user_edit', {
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
    res.redirect('user')
  }).exec()
})

//删除用户数据
router.get('/delete', function (req, res) {
  // 通过 id 查找到对应用户进行删除 User.findByIdAndRemove()
  User.findByIdAndRemove(req.query.id.replace(/"/g, ''), {
    new: true
  }, function (err) {
    if (err) {
      return res.status(500).send('server error')
    }
  }).exec()
  res.redirect('user')
})

// 分类首页
router.get('/category', (req, res) => {
  // 从数据库读取所有用户数据
  var page = Number(req.query.page || 1)
  var limit = 5
  var pages = 0

  Category.find().countDocuments().then(function (count) {

    pages = Math.ceil(count / limit)
    page = Math.min(page, pages) // page最大为pages
    page = Math.max(page, 1) // page 最小为1
    var skip = (page - 1) * limit
    // sort _id: 1 升序 _id: -1 降序  _id中包含了时间戳
    Category.find().sort({
      _id: -1
    }).limit(limit).skip(skip).then(function (categories) {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,

        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})

// get 增加分类
router.get('/category/add', (req, res) => {

  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})

// post 保存分类
router.post('/category/add', (req, res) => {

  var name = req.body.name || ''
  if (name == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '分类名称不能为空'
    })
    return
  }
  // 判断数据库中是否存在同名分类
  Category.findOne({
    name: name
  }).then(function (rs) {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类已经存在了'
      })
      return Promise.reject()
    } else {
      return new Category({
        name: name
      }).save()
    }
  }).then(function (newcategory) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    })
  })
})

//编辑分类
router.get('/category/edit', (req, res) => {

  var id = req.query.id || ''

  Category.findOne({
    _id: id
  }).then(function (category) {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在'
      })
      return Promise.reject()
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      })
    }
  })
})

// 保存分类的编辑
router.post('/category/edit', (req, res) => {

  var id = req.query.id || ''
  var name = req.body.name || ''

  // 判断数据库中是否存在同名分类
  Category.findOne({
    _id: id
  }).then(function (category) {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在'
      })
      return Promise.reject()
    } else {
      if (name == category.name) {
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '修改成功',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        return Category.findOne({
          _id: {
            $ne: id
          },
          name: name
        })
      }
    }
  }).then(function (samecategory) {
    if (samecategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类',
      })
      return Promise.reject()
    } else {
      return Category.update({
        _id: id
      }, {
        name: name
      })
    }
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '修改成功',
      url: '/admin/category'
    })
  })
})


//分类的删除
router.get('/category/delete', (req, res) => {

  var id = req.query.id || ''
  Category.remove({
    _id: id
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    })
  })
})

// 内容首页
router.get('/content', (req, res) => {
  // 从数据库读取所有用户数据
  var page = Number(req.query.page || 1)
  var limit = 5
  var pages = 0

  Content.find().countDocuments().then(function (count) {

    pages = Math.ceil(count / limit)
    page = Math.min(page, pages) // page最大为pages
    page = Math.max(page, 1) // page 最小为1
    var skip = (page - 1) * limit
    // sort _id: 1 升序 _id: -1 降序  _id中包含了时间戳
    // populate('category') 关联字段 将id映射为对应的分类 在content.js category中设置
    Content.find().sort({
      _id: -1
    }).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {

      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,

        count: count,
        pages: pages,
        limit: limit,
        page: page
      })
    })
  })
})

// 内容添加
router.get('/content/add', (req, res) => {

  Category.find().sort({
    _id: -1
  }).then((categories) => {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})


// 内容保存
router.post('/content/add', (req, res) => {

  if (req.body.title == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '标题不能为空'
    })
    return
  }
  if (req.body.content == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容不能为空'
    })
    return
  }
  // 保存数据到数据库
  new Content({
    category: req.body.category,
    title: req.body.title,
    user: req.userInfo._id.toString(),
    description: req.body.description,
    content: req.body.content
  }).save().then(function (rs) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '保存成功',
      url: '/admin/content'
    })
  })
})

//内容编辑
router.get('/content/edit', (req, res) => {

  var id = req.query.id || ''
  var categories = []
  // 先查找分类，后查找内容
  Category.find().sort({
    _id: -1
  }).then((rs) => {

    categories = rs

    Content.findOne({
      _id: id
    }).then(function (content) {
      if (!content) {
        res.render('admin/error', {
          userInfo: req.userInfo,
          message: '编辑内容不存在'
        })
        return Promise.reject()
      } else {
        res.render('admin/content_edit', {
          userInfo: req.userInfo,
          categories: categories,
          content: content
        })
      }
    })
  })
})

// 保存编辑的内容
router.post('/content/edit', (req, res) => {

  var id = req.query.id || ''

  if (req.body.title == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '标题不能为空'
    })
    return
  }
  if (req.body.content == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容不能为空'
    })
    return
  }

  Content.update({
    _id: id
  }, {
    category: req.body.category,
    title: req.body.title,
    user: req.userInfo._id.toString(),
    description: req.body.description,
    content: req.body.content
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容保存成功',
      url: '/admin/content/edit?id=' + id
    })
  })

})

//删除内容
router.get('/content/delete', (req, res) => {

  var id = req.query.id || ''
  Content.remove({
    _id: id
  }).then(function () {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/content'
    })
  })
})

module.exports = router