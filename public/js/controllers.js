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
  $scope.showCanvas = false;

  // get the list of posts for this course
  $http.get('/api/UCSD/' + $routeParams.id)
    .success(function(data) {
      $scope.courseAbbreviation = data['course_abbreviation'];
      $scope.postList = data['posts'];
      if ($scope.postList) {
        $scope.postList.reverse();
      }

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

      for (var i = 0; data['posts'] && i < data['posts'].length; i++) {
        $scope.expandedSubComments.push(false);
        $scope.replyBoxes.push(false);
      }
      
      //storing the values of the cookies in an array so we can display 
      //to the user if the user has upvoted or downvoted a post 
      //this is to be represented by highlighting the upvote icon or 
      //highlighting the downvote icon 
      for (var i = 0; data['posts'] && i < data['posts'].length; i++){
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
      for(var i = 0; $scope.postList && i < $scope.postList.length; i++){
        $scope.subUpvoteStyles.push([]);
        $scope.subDownvoteStyles.push([]);
      }
      //for preserving whether the user upvoted or downvoted a subcomment 
      //use of two two dimensional array scope objects: one for the subcomment 
      //upvotes and one for the subcomment downvotes 
      for( var i = 0; $scope.postList && i < $scope.postList.length; i++){
        for(var j = 0; $scope.postList && j < $scope.postList[i].subcomments.length; j++){
          if($cookieStore.get($scope.postList[i].subcomments[j]._id) == 1){
            $scope.subUpvoteStyles[i].push({
              color : 'green'
            });
            $scope.subDownvoteStyles[i].push({
              color : ''
            });
          }
          else if($cookieStore.get($scope.postList[i].subcomments[j]._id) == -1){
            $scope.subUpvoteStyles[i].push({
              color : ''
            });
            $scope.subDownvoteStyles[i].push({
              color : 'red'
            });
          }
          else{
            $scope.subUpvoteStyles[i].push({
              color : ''
            });
            $scope.subDownvoteStyles[i].push({
              color : ''
            });
          }
        }
      }
    });

  $scope.wordCloud = function() {
    // make new get request to get list of words and frequencies
    $http.get('/api/freq/UCSD/' + $routeParams.id)
      .success(function(data) {
        var options = {
          list: data.frequencies,
          fontWeight: 600,
          weightFactor: 16 
        };
        //console.log(data);

        if (!data.error) {
          WordCloud(document.getElementById('canvas'), options);
          $scope.showCanvas = true;
        }
      })
  }

  $scope.expandSubComments = function(index) {
    $scope.expandedSubComments[index] = true;
  };

  $scope.replyToComment = function(index) {
    $scope.replyBoxes[index] = !($scope.replyBoxes[index]);
    $scope.expandedSubComments[index] = !($scope.expandedSubComments[index]);
  };

  $scope.cancelReply = function(index) {
    $scope.replyBoxes[index] = false;
    $scope.expandedSubComments[index] = false;
  };

  $scope.upvote = function(index , displayindex, obj_id){
    if($cookieStore.get(obj_id) == 1){
    //console.log('index ' + index)
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        //console.log($cookieStore.get(obj_id));
        $scope.upvoteStyles[displayindex] = {
          color : ''
        }
        $scope.postList = data;
         $scope.postList.reverse();
      });
    }
    else if($cookieStore.get(obj_id) == -1){
    //console.log('index ' + index)
      $http.put('/api/' + $routeParams.id + '/' + index +'/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        // console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.postList.reverse();
        $scope.upvoteStyles[displayindex] = {
            color : 'green'
          }
        $scope.downvoteStyles[displayindex] = {
          color : ''
        }
      });
    }
    else{
    // console.log('index ' + index)
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      // console.log($cookieStore.get(obj_id));
       $scope.postList = data;
        $scope.postList.reverse();
       $scope.upvoteStyles[displayindex] = {
        color : 'green'
       } 
    });
    }
  };

   $scope.downvote = function(index ,displayindex, obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '1').success(function(data){
      // console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      // console.log($cookieStore.get(obj_id));
       $scope.postList = data;
        $scope.postList.reverse();
       $scope.downvoteStyles[displayindex] = {
        color : ''
       }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        // console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.postList.reverse();
         $scope.upvoteStyles[displayindex] = {
          color : ''
         } 
         $scope.downvoteStyles[displayindex] = {
          color : 'red'
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      // console.log($cookieStore.get(obj_id));
       $scope.postList = data;
        $scope.postList.reverse();
       $scope.downvoteStyles[displayindex] = {
        color : 'red'
       } 
    });
    }
  };

  $scope.subUpvote = function(parentindex, childindex, obj_id , displayindex){
    //console.log("atleastiprinted!!~~");
    //console.log(parentindex);
    //console.log(childindex);
    //console.log(obj_id);
    if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data;
        $scope.postList.reverse();
        $scope.subUpvoteStyles[displayindex][childindex] = {
          color : ''
        }
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        // console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.postList.reverse();
        $scope.subUpvoteStyles[displayindex][childindex] = {
          color : 'green'
        }
        $scope.subDownvoteStyles[displayindex][childindex] = {
          color : ''
        }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ parentindex + '/' + childindex + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      // console.log($cookieStore.get(obj_id));
       $scope.postList = data;
        $scope.postList.reverse();
       $scope.subUpvoteStyles[displayindex][childindex] = {
        color : 'green'
       } 
    });
    }
  };

  $scope.subDownvote = function(parentindex, childindex, obj_id, displayindex){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '1').success(function(data){
      // console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      // console.log($cookieStore.get(obj_id));
      $scope.postList = data;
       $scope.postList.reverse();
      $scope.subDownvoteStyles[displayindex][childindex] = {
        color : ''
      }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        // console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.postList.reverse();
         $scope.subDownvoteStyles[displayindex][childindex] = {
          color : 'red'
         } 
         $scope.subUpvoteStyles[displayindex][childindex] = {
          color : ''
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      // console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.postList.reverse();
       $scope.subDownvoteStyles[displayindex][childindex] = {
        color : 'red'
       } 
    });
    }
  }
  
  $scope.makePost = function(){
    if ($scope.commentText && $scope.commentText.trim()) {
      var encodedText = escape($scope.commentText);
      $http.put('/api/UCSD/' + $routeParams.id + '/' + encodedText)
        .success(function(data) {
          $scope.postList = data;
          $scope.postList.reverse(); 
          $scope.commentText = null;
        });
    } else {
      // Show error message?
      // console.log('Please enter comment')
    }
  };

  $scope.makeSubPost = function(index){
    var text = $scope.reply.text;
    if (text && text.trim()){
      var encodedText = escape(text);
      // console.log(encodedText);
      // console.log(index);
      $http.put('/api/UCSD/' + $routeParams.id + '/' + encodedText + '/' + index)
        .success(function(data){
          $scope.postList = data;
          $scope.postList.reverse();
          $scope.reply = {};
        });
    }
  };
}
