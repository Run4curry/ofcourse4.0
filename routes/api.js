var mongoose = require('mongoose');
var courseSchema = require('./schema');
var jsonfile = require('jsonfile');
var catalog_path = 'course_catalog.json';
var stopwords_path = 'stopwords.json';

mongoose.connect(process.env.DB_URL);

// POST - creates a comment for that course
exports.postComment = function (req, res) {
  var courseId = req.params.course;
  var mainpost = req.params.mainpost;
  console.log("I am in post comment function");
  // push the new post onto the list of posts
  courseSchema.update({course_abbreviation : courseId}, 
    {$push : {"posts" : {"post" : mainpost, "vote" : 0}}},
    {safe: true, upsert: true},
    function(err, newpost){
      // TODO: returns the new post
    });
  courseSchema.findOne({course_abbreviation : courseId},
    function(err,data){

      res.json(data.posts);
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
  console.log("I am in subcomment function");
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

exports.getFrequencies = function(req, res) {
  var courseId = req.params.course;

  courseSchema.findOne({
    course_abbreviation: courseId
  }, function(err, courseContents) {
    if (err) res.send(err)

    // get all text from comments and subcomments
    var allText = '';
    var postList = courseContents.posts;
    for (var i = 1; i < postList.length; i++) {
      allText += postList[i].post + ' ';
      for (var j = 1; j < postList[i].subcomments.length; j++) {
        allText += postList[i].subcomments[j].subcomment + ' ';
      }
    }

    // check for stopwords
    jsonfile.readFile(stopwords_path, function(err, stopwordsList) {
      var stopwords = new Set(stopwordsList);
      var tokens = allText.split(/[^A-Za-z]/);

      // remove stopwords from text
      for (var i = 0; i < tokens.length; ) {
        if (stopwords.has(tokens[i])) tokens.splice(i, 1);
        else i++;
      }

      // get frequencies for each token
      var freqs = {};
      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] in freqs) {
          freqs[tokens[i]]++;
        } else {
          freqs[tokens[i]] = 1;
        }
      }

      var returnList = []
      for (var k in freqs) {
        tmpList = [k, freqs[k]];
        returnList.push(tmpList);
      }

      res.json(returnList);
    });
  });
};
