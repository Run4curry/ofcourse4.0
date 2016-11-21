var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Courseschema = new Schema({	
		posts: [{post : String, vote : Number,
		subcomments : [{subcomment : String}], 
		subvotes : [{subvote : Number}], 
		subdates: [{subdate : String}],
		date : String}],
		course_abbreviation : String
});

//var Courseschemas = mongoose.model('Courseschemas',Courseschema);
module.exports = mongoose.model('courseschemasfinals',Courseschema);
