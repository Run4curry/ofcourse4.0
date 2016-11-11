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

      for (var i = 0; i < data['posts'].length; i++) {
        $scope.expandedSubComments.push(false);
        $scope.replyBoxes.push(false);
      }
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
        $scope.postList = data;
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index +'/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data; 
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
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data; 
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data; 
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
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $scope.postList = data; 
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ parentindex + '/' + childindex + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data; 
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
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $scope.postList = data; 
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + parentindex + '/' + childindex + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
       $scope.postList = data; 
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
      console.log(index);
      $http.put('/api/UCSD/' + $routeParams.id + '/' + subcommenttext + '/' + index).success(function(data){
      $scope.postList = data;
      subcommenttext = null;        
    });
    }
  };
}
