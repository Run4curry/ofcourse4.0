'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {
  $http.get('/api/posts')
    .success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
};

function UcsdCtrl($scope, $http, $location) {
    $http.get('/api/UCSD')
      .success(function(data) {
        $scope.quantity = 50;
        $scope.courseList = data;
      });

    $scope.loadMore = function() {
      $scope.quantity += 50;
    };
  };

function CourseCtrl($scope, $http, $routeParams, $route ,$cookies, $cookieStore) {

  // get the list of posts for this course
  $http.get('/api/UCSD/' + $routeParams.id)
    .success(function(data) {
      $scope.courseAbbreviation = data['course_abbreviation'];
      $scope.postList = data['posts'];

      // for subcomments/replying
      $scope.expandedSubComments = [];
      $scope.replyBoxes = [];
      $scope.reply = {};

      // for upvoting/downvoting
      $scope.glyphColors = [];
      $scope.upvoteStyles = [];
      $scope.downvoteStyles = [];
      $scope.subUpvoteStyles = [];
      $scope.subDownvoteStyles = [];

      for (var i = 0; i < data['posts'].length; i++) {
        $scope.expandedSubComments.push(false);
        $scope.replyBoxes.push(false);
      }
      
      //storing the values of the cookies in an array so we can display 
      //to the user if the user has upvoted or downvoted a post 
      //this is to be represented by highlighting the upvote icon or 
      //highlighting the downvote icon 
      for (var i = 0; i < data['posts'].length; i++){
        $cookieStore.get(data['posts'][i]._id) ? 
        $scope.glyphColors.push($cookieStore.get(data['posts'][i]._id)) 
        : $scope.glyphColors.push(0);
      }

      for (var i = 0; i < $scope.glyphColors.length; i++){
        if($scope.glyphColors[i] == 1){
          $scope.upvoteStyles.push({
            color : 'green'
          });
        }
        else{
          $scope.upvoteStyles.push({
            color : ''
          });
        }
      }

      for (var i = 0; i < $scope.glyphColors.length; i++){
        if($scope.glyphColors[i] == 1){
          $scope.downvoteStyles.push({
            color : ''
          });
        }
        else if($scope.glyphColors[i] == -1){
          $scope.downvoteStyles.push({
            color : 'red'
          });
        }
        else{
          $scope.downvoteStyles.push({
            color : ''
          });
        }
      }

      //initial pushing to create the two dimensional array 
      for(var i = 1; i < data['posts'].length; i++){
        $scope.subUpvoteStyles.push([]);
        $scope.subDownvoteStyles.push([]);
      }
      //for preserving whether the user upvoted or downvoted a subcomment 
      //use of two two dimensional array scope objects: one for the subcomment 
      //upvotes and one for the subcomment downvotes 
      for( var i = 1; i < data['posts'].length; i++){
        for(var j = 0; j < data['posts'][i].subcomments.length; j++){
          if($cookieStore.get(data['posts'][i].subcomments[j]._id) == 1){
            //console.log("I am inside here doing upvote cookies");
            $scope.subUpvoteStyles[i-1].push({
              color : 'green'
            });
            $scope.subDownvoteStyles[i-1].push({
              color : ''
            });
          }
          else if($cookieStore.get(data['posts'][i].subcomments[j]._id) == -1){
            $scope.subUpvoteStyles[i-1].push({
              color : ''
            });
            $scope.subDownvoteStyles[i-1].push({
              color : 'red'
            });
          }
          else{
            $scope.subUpvoteStyles[i-1].push({
              color : ''
            });
            $scope.subDownvoteStyles[i-1].push({
              color : ''
            });
          }
        }
      }
      // console.log($scope.subUpvoteStyles[0][0]);
      // console.log($scope.subDownvoteStyles[0][1]);
    });

  $scope.wordCloud = function() {
    // make new get request to get list of words and frequencies
    $http.get('/api/freq/UCSD/' + $routeParams.id)
      .success(function(data) {
        var options = {
          list: data,
          fontWeight: 600,
          weightFactor: 16 
        };

        WordCloud(document.getElementById('canvas'), options);
      })
  }

  $scope.expandSubComments = function(index) {
    $scope.expandedSubComments[index] = true;
  };

  $scope.replyToComment = function(index) {
    $scope.replyBoxes[index] = true;
  };

  $scope.cancelReply = function(index) {
    $scope.replyBoxes[index] = false;
  };

  $scope.upvote = function(index , obj_id){
    if($cookieStore.get(obj_id) == 1){
    console.log('index ' + index)
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $scope.upvoteStyles[index] = {
          color : ''
        }
        $scope.postList = data;
      });
    }
    else if($cookieStore.get(obj_id) == -1){
    console.log('index ' + index)
      $http.put('/api/' + $routeParams.id + '/' + index +'/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.upvoteStyles[index] = {
            color : 'green'
          }
        $scope.downvoteStyles[index] = {
          color : ''
        }
      });
    }
    else{
    console.log('index ' + index)
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.upvoteStyles[index] = {
        color : 'green'
       } 
    });
    }
  };

   $scope.downvote = function(index , obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '1').success(function(data){
      console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.downvoteStyles[index] = {
        color : ''
       }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.upvoteStyles[index] = {
          color : ''
         } 
         $scope.downvoteStyles[index] = {
          color : 'red'
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.downvoteStyles[index] = {
        color : 'red'
       } 
    });
    }
  };

  $scope.subUpvote = function(parentindex, childindex, obj_id){
    //console.log("atleastiprinted!!~~");
    //console.log(parentindex);
    //console.log(childindex);
    //console.log(obj_id);
    if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data;
        $scope.subUpvoteStyles[parentindex-1][childindex] = {
          color : ''
        }
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.subUpvoteStyles[parentindex-1][childindex] = {
          color : 'green'
        }
        $scope.subDownvoteStyles[parentindex-1][childindex] = {
          color : ''
        }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ parentindex + '/' + childindex + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.subUpvoteStyles[parentindex-1][childindex] = {
        color : 'green'
       } 
    });
    }
  };

  $scope.subDownvote = function(parentindex, childindex, obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '1').success(function(data){
      console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      console.log($cookieStore.get(obj_id));
      $scope.postList = data;
      $scope.subDownvoteStyles[parentindex-1][childindex] = {
        color : ''
      }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.subDownvoteStyles[parentindex-1][childindex] = {
          color : 'red'
         } 
         $scope.subUpvoteStyles[parentindex-1][childindex] = {
          color : ''
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.subDownvoteStyles[parentindex-1][childindex] = {
        color : 'red'
       } 
    });
    }
  }
  
  $scope.makePost = function(){
    if ($scope.commentText && $scope.commentText.trim()) {
      $http.put('/api/UCSD/' + $routeParams.id + '/' + $scope.commentText)
        .success(function(data) {
          $scope.postList = data; 
          $scope.commentText = null;
        });
    } else {
      // Show error message?
      console.log('Please enter comment')
    }
  };

  $scope.makeSubPost = function(index){
    var text = $scope.reply.text;
    if (text && text.trim()){
      var encodedText = escape(text);
      console.log(encodedText);
      console.log(index);
      $http.put('/api/UCSD/' + $routeParams.id + '/' + encodedText + '/' + index)
        .success(function(data){
          $scope.postList = data;
          $scope.reply = {};
        });
    }
  };
}
