
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Article = mongoose.model('Article')
  , Message = mongoose.model('Message')
  , utils = require('../../lib/utils')
  , _ = require('underscore')

/**
 * Load
 */

exports.load = function(req, res, next, id){
  var User = mongoose.model('User')

  Article.load(id, function (err, article) {
    if (err) return next(err)
    if (!article) return next(new Error('not found'))
    req.article = article
    next()
  })
}

/**
 * List
 */

exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var perPage = 30
  var options = {
    perPage: perPage,
    page: page
  }
   var unreadMsg=0;

	//Message.unreadCount(req.user.id, function(err, messages) {
	//	if (err) return res.render('500')
		//Message.count.exec(function (err, count) {

		//	unreadMsg = messages.length;
			//res.render('messages/inbox', {
			//	title: '',
			//	messages: messages
			//})
		//})
	//})

	Article.list(options, function(err, articles) {
    if (err) return res.render('500')
    Article.count().exec(function (err, count) {
      res.render('articles/index', {
        title: '',
        articles: articles,
        page: page + 1,
        pages: Math.ceil(count / perPage) ,
		messageCount: unreadMsg  ,
		  navid:''
      })
    })
  })  
}






/**
 * New article
 */

exports.new = function(req, res){
  res.render('articles/new', {
    title: 'New Article',
    article: new Article({}) ,
	  navid:''
  })
}

/**
 * Create an article
 */

exports.create = function (req, res) {
  var article = new Article(req.body)
  article.user = req.user

  article.uploadAndSave(req.files && req.files.image, function (err) {
    if (!err) {
      req.flash('success', 'Successfully posted!')
      return res.redirect('/');//res.redirect('/articles/'+article._id)
    }

    res.render('articles/new', {
      title: 'New Article',
      article: article,
		navid:'',
      errors: utils.errors(err.errors || err)
    })
  })
}

/**
 * Edit an article
 */

exports.edit = function (req, res) {
  res.render('articles/edit', {
    //title: 'Edit ' + req.article.title,
    article: req.article  ,
	  navid:''
  })
}

/**
 * Update article
 */

exports.update = function(req, res){
  var article = req.article
  article = _.extend(article, req.body)

  article.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      return res.redirect('/articles/' + article._id)
    }

    res.render('articles/edit', {
      title: 'Edit Article',
      article: article,
      errors: err.errors ,
		navid:''
    })
  })
}

/**
 * Show
 */

exports.show = function(req, res){
  res.render('articles/show', {
    title: req.article.title,
    article: req.article ,
	  navid:''
  })
}

/**
 * Delete an article
 */

exports.destroy = function(req, res){
  var article = req.article
  article.remove(function(err){
    req.flash('info', 'Deleted successfully')
    res.redirect('/articles')
  })
}
