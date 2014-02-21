
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema


/**
 * Message Schema
 */

var MessageSchema = new Schema({
  title: {type : String, default : '', trim : true},
  viewed:{type: String, default:'', trim:true},
  body: {type : String, default : '', trim : true},
  //From
  userfrom: {type : Schema.ObjectId, ref : 'User'},
  //To
  userto: {type : Schema.ObjectId, ref : 'User'},
  replies:[{
	    body: { type : String, default : '' },
	    user: { type : Schema.ObjectId, ref : 'User' },
	    createdAt: { type : Date, default : Date.now }
	  }],
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

MessageSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Message title cannot be blank')

MessageSchema.path('body').validate(function (body) {
  return body.length > 0
}, 'Message body cannot be blank')

/**
 * Methods
 */

MessageSchema.methods = {

  send: function (cb) { 
    	return this.save(cb);  
  }

};

/**
 * Statics
 */

MessageSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('userfrom', 'name email username')
      .populate('userto', 'name')
      .exec(cb)
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (id, cb) {
   // var criteria = options.criteria || {}

    this.find({userto: id })
      .populate('userfrom', 'name username')
	  .populate('userto', 'name')
      .sort({'createdAt': -1}) // sort by date
      .exec(cb) ;




  } ,
	sentList: function (id, cb) {
		// var criteria = options.criteria || {}

		this.find({userfrom: id })
			.populate('userfrom', 'name username')
			.populate('userto', 'name')
			.sort({'createdAt': -1}) // sort by date
			.exec(cb) ;




	} ,
	readUpdate: function(id,cb)
	{
		/*this.update({userto: id}, { $set: { viewed: '1' }}, { multi: true }, function (err, numberAffected, raw) {
			if (err) return console.log(err);
			console.log('The number of updated documents was %d', numberAffected);
			console.log('The raw response from Mongo was ', raw);
		});  */
	}
   ,
	unreadCount: function (id, cb) {
		// var criteria = options.criteria || {}

		this.find({userto: id })
			.where('viewed').equals('')
//      .limit(options.perPage)
//      .skip(options.perPage * options.page)
			.exec(cb)
	}
}
mongoose.model('Message', MessageSchema)