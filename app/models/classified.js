
/**
 * Module dependencies.
 */
function S4() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
var mongoose = require('mongoose')
  , Imager = require('imager')
  , AWS = require('aws-sdk')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , imagerConfig = require(config.root + '/config/imager.js')
  , Schema = mongoose.Schema
  , imager = new Imager(imagerConfig, 'S3')

var s3 = require('s3');

// createClient allows any options that knox does.
var client = s3.createClient({
	key: "AKIAIMYJ7ZVBNX7ILNZQ",
	secret: "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",
	bucket: "rizature"
});
/**
 * Getters
 */

var getTags = function (tags) {
  return tags.join(',')
}

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',')
}

/**
 * Article Schema
 */

var ClassifiedSchema = new Schema({
  title: {type : String, default : '', trim : true},
  body: {type : String, default : '', trim : true},
  user: {type : Schema.ObjectId, ref : 'User'},
  comments: [{
    body: { type : String, default : '' },
    user: { type : Schema.ObjectId, ref : 'User' },
    createdAt: { type : Date, default : Date.now }
  }],
  tags: {type: [], get: getTags, set: setTags},
  image: {
    cdnUri: String,
    files: []
  },
  createdAt  : {type : Date, default : Date.now}
})

/**
 * Validations
 */

/*ArticleSchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Article title cannot be blank')*/

ClassifiedSchema.path('body').validate(function (body) {
  return body.length > 0
}, 'Article body cannot be blank')

/**
 * Pre-remove hook
 
ClassifiedSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3')
  var files = this.image.files

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err)
  }, 'classified')

  next()
})
*/
/**
 * Methods
 */

ClassifiedSchema.methods = {

  /**
   * Save article and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
	  var self = this;
	  /*// optional headers
	  var headers = {
		  'Content-Type' : 'image/jpg',
		  'x-amz-acl'    : 'public-read'
	  };

	  // upload a file to s3
	  var gid = guid();
	  var uploader = client.upload(images.path,  gid+"-"+images.name, headers);
	  uploader.on('error', function(err) {
		  console.error("unable to upload:", err.stack);
		  self.save(err);
	  });
	  uploader.on('progress', function(amountDone, amountTotal) {
		  console.log("progress", amountDone, amountTotal);
	  });
	  uploader.on('end', function(url) {
		  console.log("file available at", url);
		  self.image = { cdnUri : url, files : images }
		  self.save(cb);
	  });     */


    


	 // AWS.config.loadFromPath("./config/aws-config.json");
	//  var s3 = new AWS.S3();

	  //s3.createBucket({Bucket: 'rizature'}, function() {
		 /* var buffer = new Buffer(images);
		  var params = {Bucket: 'rizature', Key: 'qws', Body: buffer};
		  s3.putObject(params, function(err, data) {
			  if (err)
				  console.log(err)
			  else
				  console.log("Successfully uploaded data to myBucket/myKey");


		  }); */
	 // });

	 // if (!images || !images.length)
		//  return this.save(cb);


    imager.upload(images, function (err, cdnUri, files) {
      if (err)
	  {
		  console.log("Error: "+ err)
    	  return cb(err);
	  }
		else{
		  console.log("Upload completed!")
	  }
      if (files.length) {
        self.image = { cdnUri : cdnUri, files : files }
		  console.log(cdnUri);
      }
		else{
		  console.log(files.length);
	  }
      self.save(cb)
    }, 'article')




  },

  
  
  
  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @param {Function} cb
   * @api private
   */

  addComment: function (user, comment, cb) {
    var notify = require('../mailer/notify')

    this.comments.push({
      body: comment.body,
      user: user._id
    })

    notify.comment({
      article: this,
      currentUser: user,
      comment: comment.body
    })

    this.save(cb)
  }

}

/**
 * Statics
 */

ClassifiedSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec(cb)
  },

  /**
   * List articles
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb)
  }

}

mongoose.model('Classified', ClassifiedSchema)