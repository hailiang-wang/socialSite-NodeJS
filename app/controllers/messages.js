
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Message = mongoose.model('Message')
  , Classified = mongoose.model('Classified')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils')
  , _ = require('underscore');

var users = require('../../app/controllers/users')
/**
 * Load
 */

exports.load = function(req, res, next, id){

  Message.load(id, function (err, message) {
    if (err) return next(err)
    if (!message) return next(new Error('not found'))
    req.message = message
    next()
  })
};

/**
 * List
 */
 exports.classfiedLoad=   function (req, res,next, id){

	 Classified.load(id, function (err, classified) {
		 if (err) return next(err)
		 if (!classified) return next(new Error('not found'))
		 req.classified = classified
		 next()
	 })
 };

exports.newClassified = function (req, res){

	var msg = new Message({});

	msg.title= 'RE: ' + req.classified.title;
	msg.body=' \r\n\n\n--- From: '+' / '+' --- \n'   ;


	res.render('messages/classified', {
		title: '' ,
		navid:'classfieds',
		message:  msg

	}) ;
	 /*
	Classified.load(id, function (err, classified) {
		if (err) return next(err)
		if (!classified) return next(new Error('not found'))
		r//eq.classified = classified
		next()

		var msg = new Message({});

		msg.title= 'RE: '+ classified.title;
		msg.body=' \r\n\n\n--- From: '+' / '+' --- \n'    +classified.body;


		res.render('messages/inbox', {
			title: '  ' ,

			message:  msg

		})
	})  */

};

exports.inbox = function(req, res){

Message.sentList(req.user.id, function(err, sentMessages) {

	Message.list(req.user.id, function(err, messages) {
		if (err) return res.render('500')
		Message.count().exec(function (err, count) {
			res.render('messages/inbox', {
				title: '',
				navid:'messages',
				messages: messages ,
				sentMessages: sentMessages
			})
		})
	})

});





};

/**
 * New message
 */

exports.new = function(req, res){
	var options;
	
	  User.list(options, function(err, users) {
		    if (err) return res.render('500')
		    User.count().exec(function (err, count) {

                var arr = [ ];
                for(var i=0; i<users.length;i++)
                {
                    arr.push('{value:'+"'"+users[i]._id+"',"+'label:'+"'"+users[i].name+"'"+'}'); // insert as last item
                }

				var msg = new Message({});
				msg.userto= new User({});
				msg.userfrom = new User({});

		    	if(err)
		    		console.log(err)
		        res.render('messages/new', {
		        title: '  ' ,
			    navid:'messages',
		        users: users,
                arr: arr,
		        message:  msg
		      })
		    })
		  })
	

};
/**
 * Reply message
 */

exports.reply = function(req, res, id){


	           var msg = req.message;

	           msg.title= 'RE: '+ msg.title;
			   msg.body=' \r\n\n\n--- From: '+msg.userfrom.name+' / '+msg.createdAt+' --- \n'    +msg.body;


			res.render('messages/form', {
				title: '  ' ,
				navid:'messages',
				message:  msg

			})


};

/**
 * Send a message
 */

exports.send = function (req, res) {
  var message = new Message(req.body)
  message.userfrom = req.user
  message.send(function (err) {
    if (!err) {
      req.flash('success', 'Successfully send!')
      return res.redirect('/messages');//res.redirect('/articles/'+article._id)
    }
    else{console.log(err)}

  })
};




