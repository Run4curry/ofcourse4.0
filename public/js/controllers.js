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
      $scope.expandedSubComments = [];
      $scope.replyBoxes = [];
      $scope.glyphicon_color = [];
      $scope.upvotestyles = [];
      $scope.downvotestyles = [];
      $scope.subupvotestyles = [];
      $scope.subdownvotestyles = [];

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
        $scope.glyphicon_color.push($cookieStore.get(data['posts'][i]._id)) 
        : $scope.glyphicon_color.push(0);
        console.log($scope.glyphicon_color[i]);
      }
      for (var i = 0; i < $scope.glyphicon_color.length; i++){
        if($scope.glyphicon_color[i] == 1){
          $scope.upvotestyles.push({
            color : 'green'
          });
        }
        else{
          $scope.upvotestyles.push({
            color : ''
          });
        }
      }
      for (var i = 0; i < $scope.glyphicon_color.length; i++){
        if($scope.glyphicon_color[i] == 1){
          $scope.downvotestyles.push({
            color : ''
          });
        }
        else if($scope.glyphicon_color[i] == -1){
          $scope.downvotestyles.push({
            color : 'red'
          });
        }
        else{
          $scope.downvotestyles.push({
            color : ''
          });
        }
      }
      //initial pushing to create the two dimensional array 
      for(var i = 1; i < data['posts'].length; i++){
        $scope.subupvotestyles.push([]);
        $scope.subdownvotestyles.push([]);
      }
      //for preserving whether the user upvoted or downvoted a subcomment 
      //use of two two dimensional array scope objects: one for the subcomment 
      //upvotes and one for the subcomment downvotes 
      for( var i = 1; i < data['posts'].length; i++){
        for(var j = 0; j < data['posts'][i].subcomments.length; j++){
          console.log(data['posts'][i].subcomments[j]._id);
          console.log($cookieStore.get(data['posts'][i].subcomments[j]._id));
          if($cookieStore.get(data['posts'][i].subcomments[j]._id) == 1){
            //console.log("I am inside here doing upvote cookies");
            $scope.subupvotestyles[i-1].push({
              color : 'green'
            });
            $scope.subdownvotestyles[i-1].push({
              color : ''
            });
          }
          else if($cookieStore.get(data['posts'][i].subcomments[j]._id) == -1){
            $scope.subupvotestyles[i-1].push({
              color : ''
            });
            $scope.subdownvotestyles[i-1].push({
              color : 'red'
            });
          }
          else{
            $scope.subupvotestyles[i-1].push({
              color : ''
            });
            $scope.subdownvotestyles[i-1].push({
              color : ''
            });
          }
        }
      }
      console.log($scope.subupvotestyles[0][0]);
      console.log($scope.subdownvotestyles[0][1]);
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

  $scope.upvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $scope.upvotestyles[index] = {
          color : ''
        }
        $scope.postList = data;
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index +'/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.upvotestyles[index] = {
            color : 'green'
          }
        $scope.downvotestyles[index] = {
          color : ''
        }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.upvotestyles[index] = {
        color : 'green'
       } 
    });
    }
  };

   $scope.downvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '1').success(function(data){
      console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.downvotestyles[index] = {
        color : ''
       }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.upvotestyles[index] = {
          color : ''
         } 
         $scope.downvotestyles[index] = {
          color : 'red'
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.downvotestyles[index] = {
        color : 'red'
       } 
    });
    }
  };

  $scope.subupvotefunc = function(parentindex, childindex, obj_id){
    //console.log("atleastiprinted!!~~");
    //console.log(parentindex);
    //console.log(childindex);
    //console.log(obj_id);
    if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data;
        $scope.subupvotestyles[parentindex-1][childindex] = {
          color : ''
        }
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
        $scope.subupvotestyles[parentindex-1][childindex] = {
          color : 'green'
        }
        $scope.subdownvotestyles[parentindex-1][childindex] = {
          color : ''
        }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ parentindex + '/' + childindex + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.subupvotestyles[parentindex-1][childindex] = {
        color : 'green'
       } 
    });
    }
  };

  $scope.subdownvotefunc = function(parentindex, childindex, obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '1').success(function(data){
      console.log("I am going back to original form");
      $cookieStore.put(obj_id, 0);
      console.log($cookieStore.get(obj_id));
      $scope.postList = data;
      $scope.subdownvotestyles[parentindex-1][childindex] = {
        color : ''
      }
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data;
         $scope.subdownvotestyles[parentindex-1][childindex] = {
          color : 'red'
         } 
         $scope.subupvotestyles[parentindex-1][childindex] = {
          color : ''
         }
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data;
       $scope.subdownvotestyles[parentindex-1][childindex] = {
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
  $scope.makesubpost = function(index , subcommenttext){
    console.log(index);
    console.log(subcommenttext);
    console.log(subcommenttext.trim());
    if(subcommenttext && subcommenttext.trim()){
      var encodedtext = escape(subcommenttext);
      console.log(encodedtext);
      console.log(index);
      $http.put('/api/' + $routeParams.id + '/' + encodedtext + '/' + index).success(function(data){
      $scope.postList = data;
      subcommenttext = null;        
    });
    }
  };
}
