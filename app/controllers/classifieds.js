
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Classified = mongoose.model('Classified')
  , utils = require('../../lib/utils')
  , _ = require('underscore')

/**
 * Load
 */

exports.load = function(req, res, next, id){
  var User = mongoose.model('User')

  Classified.load(id, function (err, classified) {
    if (err) return next(err)
    if (!classified) return next(new Error('not found'))
	  console.log(classified);
    req.classified = classified
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
    page: page ,
	  navid:'classifieds'
  }

  Classified.list(options, function(err, classifieds) {
    if (err) return res.render('500')
    Classified.count().exec(function (err, count) {
      res.render('classifieds/index', {
        title: '',
        classifieds: classifieds,
        page: page + 1,
        pages: Math.ceil(count / perPage) ,
		  navid:'classifieds'
      })
    })
  })  
}

/**
 * New classified
 */

exports.new = function(req, res){
  res.render('classifieds/new', {
    title: 'New classified',
    classified: new Classified({})   ,
	  navid:'classifieds'
  })
}

/**
 * Create an classified
 */

exports.create = function (req, res) {
  var classified = new Classified(req.body)
  classified.user = req.user
	    // console.log(req.files.image1);
  classified.uploadAndSave(req.files&&req.files.image1, function (err) {
    if (!err) {
      req.flash('success', 'Successfully posted!')
      return res.redirect('/');//res.redirect('/classifieds/'+classified._id)
    }

    res.render('classifieds/new', {
      title: 'New classified',
      classified: classified,
		navid:'classifieds',
      errors: utils.errors(err.errors || err)
    })
  })
}

/**
 * Edit an classified
 */

exports.edit = function (req, res) {
  res.render('classifieds/edit', {
    //title: 'Edit ' + req.classified.title,
    classified: req.classified ,
	  navid:'classifieds'
  })
}

/**
 * Update classified
 */

exports.update = function(req, res){
  var classified = req.classified
  classified = _.extend(classified, req.body)

  classified.uploadAndSave(req.files.image, function(err) {
    if (!err) {
      return res.redirect('/classifieds/' + classified._id)
    }

    res.render('classifieds/edit', {
      title: 'Edit classified',
      classified: classified,
		navid:'classifieds',
      errors: err.errors
    })
  })
}

/**
 * Show
 */

exports.show = function(req, res){
  res.render('classifieds/show', {
    title: req.classified.title,
    classified: req.classified ,
	  navid: 'classifieds'
  })
}

/**
 * Delete an classified
 */

exports.destroy = function(req, res){
  var classified = req.classified
  classified.remove(function(err){
    req.flash('info', 'Deleted successfully')
    res.redirect('/classifieds')
  })
}
