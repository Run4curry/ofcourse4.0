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
  var date = new Date();
  //extract month, year, and day fields from date object 
  var month = date.getUTCMonth() + 1;
  var year = date.getUTCFullYear();
  var day = date.getUTCDate();
  courseSchema.update({course_abbreviation : courseId}, 
    {$push : {"posts" : {"post" : mainpost, "vote" : 0, "date" : month + '/' + day + '/' + year}}},
    {safe: true, upsert: false},
    function(err, newpost){
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
  var index = parseInt(req.params.postind);

  var date = new Date();
  //extract month, year, and day fields from date object 
  var month = date.getUTCMonth() + 1;
  var year = date.getUTCFullYear();
  var day = date.getUTCDate();

  console.log("I am in subcomment function");

  courseSchema.findOne({course_abbreviation : courseId},
    function(err, data){
      data.posts[index].subcomments.push({subcomment : subcomment});
      data.posts[index].subvotes.push({subvote : 0});
      data.posts[index].subdates.push({subdate : month + '/' + day + '/' + year});
      data.save();
      res.json(data.posts);
    });
};

// PUT - Update vote count for sub comment
exports.subvote = function(req,res){
  var courseId = req.params.course;
  var objectId = req.params.postid;
  var subobjectId = req.params.subpostid;
  var val = parseInt(req.params.val);

  courseSchema.findOne({course_abbreviation : courseId}, 
    function(err,data){
      for(var i = 0; i < data.posts.length ; i++){
        if(data.posts[i]._id == objectId){
          for(var j = 0; j < data.posts[i].subcomments.length; j++){
            if(data.posts[i].subcomments[j]._id == subobjectId){
              data.posts[i].subvotes[j].subvote += val;
              data.save();
              res.json(data.posts);
              return;              
            }
          }
        }
      }
    });
};

// PUT - Update vote count
exports.vote = function(req,res) {
  var courseId = req.params.course;
  var objectId = req.params.objid;
  var val = parseInt(req.params.val);
  
  courseSchema.findOne({course_abbreviation : courseId},
    function(err, data){
      if (err) console.log(err);
      for(var i = 0; i < data.posts.length; i++){
        if(data.posts[i]._id == objectId){
          data.posts[i].vote += val;
          data.save();
          res.json(data.posts);
          return;
        }
      }     
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
    if (err || !courseContents || !courseContents.posts) {
      res.json({ error: true });
      return;
    }

    // get all text from comments and subcomments
    var allText = '';
    var postList = courseContents.posts;
    for (var i = 0; i < postList.length; i++) {
      if (!postList[i] || postList[i].post === null) continue;
      allText += postList[i].post + ' ';
      for (var j = 0; j < postList[i].subcomments.length; j++) {
        if (!postList[i].subcomments[j] || postList[i].post === null) continue;
        allText += postList[i].subcomments[j].subcomment + ' ';
      }
    }

    // check for stopwords
    jsonfile.readFile(stopwords_path, function(err, stopwordsList) {
      var stopwords = new Set(stopwordsList);
      var tokens = allText.split(/[^A-Za-z]/);

      // remove stopwords from text
      for (var i = 0; i < tokens.length; ) {
        if (stopwords.has(tokens[i].toLowerCase())) tokens.splice(i, 1);
        else i++;
      }

      // get frequencies for each token
      var freqs = {};
      for (var i = 0; i < tokens.length; i++) {
        var tmpToken = tokens[i];
        if (tmpToken in freqs) {
          freqs[tmpToken]++;
        } else {
          freqs[tmpToken] = 1;
        }
      }
      // sort by frequency
      var keys = Object.keys(freqs);
      keys.sort(function(a, b) {
        return freqs[b] - freqs[a];
      });

      // reformat hashmap to list form for wordcloud2.js
      // EX: { 'a': 1, 'b': 2 } --> [['a', 1], ['b', 2]]
      var returnList = [];
      for (var i = 0; i < keys.length; i++) {
        var token = keys[i];
        tmpList = [token, freqs[token]];
        returnList.push(tmpList);
      }

      if (returnList.length != 0) {
        res.json({ 
          error: false, 
          frequencies: returnList
        });
      } else {
        res.json({ error: true });
      }
    });
  });
};
