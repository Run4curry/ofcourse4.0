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
        $scope.courseList = data;
      });
  };

function CourseCtrl($scope, $http, $routeParams, $route ,$cookies, $cookieStore) {
  $http.get('/api/UCSD/' + $routeParams.id)
    .success(function(data) {
      $scope.courseAbbreviation = data['course_abbreviation'];
      $scope.postList = data['posts'];
    });

  $scope.upvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == 1){
      console.log("returned upvotefunc");
      return;
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      $route.reload();
    });
  }
  };

   $scope.downvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == -1){
      console.log("returned downvotefunc");
      return;
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      $route.reload();
    });
  }
  };

  
  $scope.makePost = function(){
    if ($scope.commentText && $scope.commentText.trim()) {
      $http.put('/api/UCSD/' + $routeParams.id + '/' + $scope.commentText)
        .success(function(data) {
          $route.reload();
        });
    } else {
      // Show error message?
      console.log('Please enter comment')
    }
  };
}
