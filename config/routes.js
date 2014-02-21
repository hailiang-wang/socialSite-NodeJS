/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var users = require('../app/controllers/users')
  , articles = require('../app/controllers/articles')
  , classifieds = require('../app/controllers/classifieds')
  , messages = require('../app/controllers/messages')
  , auth = require('./middlewares/authorization')

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization]

var classifiedAuth = [auth.requiresLogin, auth.classified.hasAuthorization]

/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session)
  app.get('/users/:userId',auth.requiresLogin, users.show)
  app.get('/users/',auth.requiresLogin, users.showall)
  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin)
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin)
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback)
  app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
      failureRedirect: '/login',
      scope: [ 
        'r_emailaddress'
      ]
    }), users.signin)
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), users.authCallback)

  app.param('userId', users.user)

  // article routes
  app.get('/articles',auth.requiresLogin, articles.index)
  app.get('/articles/new', auth.requiresLogin, articles.new)
  app.post('/articles', auth.requiresLogin, articles.create)
  app.get('/articles/:id',auth.requiresLogin, articles.show)
  app.get('/articles/:id/edit', articleAuth, articles.edit)
  app.put('/articles/:id', articleAuth, articles.update)
  app.del('/articles/:id', articleAuth, articles.destroy)

  app.param('id', articles.load)

  // classified routes
  app.get('/classifieds',auth.requiresLogin, classifieds.index)
  app.get('/classifieds/new', auth.requiresLogin, classifieds.new)
  app.post('/classifieds', auth.requiresLogin, classifieds.create)
  app.get('/classifieds/:cid',auth.requiresLogin, classifieds.show)
  app.get('/classifieds/:cid/edit', classifiedAuth, classifieds.edit)
  app.put('/classifieds/:cid', classifiedAuth, classifieds.update)
  app.del('/classifieds/:cid', classifiedAuth, classifieds.destroy)

  app.param('cid', classifieds.load)

  
  // message routes
  app.get('/messages',auth.requiresLogin, messages.inbox)
  app.get('/messages/new', auth.requiresLogin, messages.new)
  app.get('/messages/classified/:kid', auth.requiresLogin, messages.newClassified)
  app.get('/messages/reply/:mid', auth.requiresLogin, messages.reply)
  app.post('/messages', auth.requiresLogin, messages.send)
	app.param('mid', messages.load)
	app.param('kid', messages.classfiedLoad)
//  app.post('/messages', auth.requiresLogin, classifieds.create)
//  app.get('/messages/:cid', classifieds.show)
//  app.get('/messages/:cid/edit', classifiedAuth, classifieds.edit)
//  app.put('/messages/:cid', classifiedAuth, classifieds.update)
//  app.del('/messages/:cid', classifiedAuth, classifieds.destroy)
  
  // home route
  app.get('/',auth.requiresLogin, articles.index)

  
  // comment routes
  var comments = require('../app/controllers/comments')
  app.post('/articles/:id/comments', auth.requiresLogin, comments.create)
  app.get('/articles/:id/comments', auth.requiresLogin, comments.create)

  // tag routes
  var tags = require('../app/controllers/tags')
  app.get('/tags/:tag', tags.index)

}
