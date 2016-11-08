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
/*var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }*/
};

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

// DELETE
exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};
