var mongoose = require('mongoose');
var courseSchema = require('./schema');
var jsonfile = require('jsonfile');
var catalog_path = 'course_catalog.json';

mongoose.connect(process.env.DB_URL);

// POST - creates a comment for that course
exports.postComment = function (req, res) {
  var courseId = req.params.course;
  var mainpost = req.params.mainpost;

  // push the new post onto the list of posts
  courseSchema.update({course_abbreviation : courseId}, 
    {$push : {"posts" : {"post" : mainpost, "vote" : 0}}},
    {safe: true, upsert: true},
    function(err, newpost){
      // TODO: returns the new post
      res.json(newpost);
    });
};

// GET - subcomments for comment
exports.getSubComments = function(req, res) {
  var courseId = req.params.course;
  var index = parseInt(req.params.postind);
  var data = {error : false};

  courseSchema.findOne({
    course_abbreviation: courseId
  }, function(err, course) {
    if (err) {
      data.error = true;
      data.errorMessage = err;
    } else {
      data.data = course.posts[index].subcomments;
    }
    
    res.json(data);
  });
};

// POST - create a subcomment for the comment
exports.postSubComment = function(req,res) {
  var courseId = req.params.course;
  var subcomment = req.params.subcomment;
  var tobeconvertedindex = req.params.postind;
  var indexval = parseInt(tobeconvertedindex);
  
  courseSchema.findOne({course_abbreviation : courseId},
    function(err,data){
      data.posts[indexval].subcomments.push({subcomment : subcomment});
      data.posts[indexval].subvotes.push({subvote : 0});
      data.save();
      res.json(data.posts);
    });
};

// PUT - Update vote count for sub comment
exports.subupvotedownvote = function(req,res){
  var courseId = req.params.course;
  var tobeconvertedindex = req.params.ind;
  var tobeconvertedindex2 = req.params.ind2;
  var tobeconvertedvalue = req.params.val;
  var numericalval = parseInt(tobeconvertedvalue);
  var numericalindex = parseInt(tobeconvertedindex);
  var numericalindex2 = parseInt(tobeconvertedindex2);

  courseSchema.findOne({course_abbreviation : courseId}, 
    function(err,data){
      data.posts[numericalindex].subvotes[numericalindex2].subvote =
        data.posts[numericalindex].subvotes[numericalindex2].subvote +
        numericalval;
        console.log( data.posts[numericalindex].subvotes[numericalindex2].subvote);
        data.save();
        res.json(data.posts);
    });
};

// PUT - Update vote count
exports.upvotedownvote = function(req,res) {
  var courseId = req.params.course;
  var index = req.params.ind;
  var tobeconvertedindex = index; 
  var tobeconvertedvalue = req.params.val;
  var numericalval = parseInt(tobeconvertedvalue);
  var numericalindex = parseInt(tobeconvertedindex);
  
  courseSchema.findOne({course_abbreviation : courseId},
    function(err,data){
      data.posts[numericalindex].vote = data.posts[numericalindex].vote + numericalval;
      data.save();         
    });
  courseSchema.findOne({course_abbreviation : courseId},
    function(err,data){
      console.log(data.posts);
      res.json(data.posts);
    });
};


// GET - Retrieve list of all classes (course abbreviations)
exports.getCourses = function (req, res) {
  jsonfile.readFile(catalog_path, function(err, courses) {
    if (err) res.send(err);

    res.json(courses);
  });
};

// GET - Retrieve list of comments for specified course
exports.getOneCourse = function (req, res) {
  var courseId = req.params.course;
  courseSchema.findOne({
    course_abbreviation : courseId
  }, function(err, data) {
    res.json(data);
  });
};
