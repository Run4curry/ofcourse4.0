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

  $http.get('/api/UCSD/' + $routeParams.id)
    .success(function(data) {
      $scope.courseAbbreviation = data['course_abbreviation'];
      $scope.postList = data['posts'];
    });

  $scope.upvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
        $cookieStore.put(obj_id, 0);
        console.log($cookieStore.get(obj_id));
        $route.reload();
      });
    }
    else if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index +'/' + '2').success(function(data){
        $cookieStore.put(obj_id, 1);
        console.log($cookieStore.get(obj_id));
        $route.reload();
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/'+ index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 1);
      console.log($cookieStore.get(obj_id));
       $route.reload();
    });
  }
  };

   $scope.downvotefunc = function(index , obj_id){
    if($cookieStore.get(obj_id) == -1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '1').success(function(data){
      $cookieStore.put(obj_id, 0);
      console.log($cookieStore.get(obj_id));
       $route.reload();
    });
    }
    else if($cookieStore.get(obj_id) == 1){
      $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-2').success(function(data){
        $cookieStore.put(obj_id, -1);
        console.log($cookieStore.get(obj_id));
         $route.reload();
      });
    }
    else{
    $http.put('/api/' + $routeParams.id + '/' + index + '/' + '-1').success(function(data){
      $cookieStore.put(obj_id,-1);
      console.log($cookieStore.get(obj_id));
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
