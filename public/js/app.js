'use strict';

// Declare app level module which depends on filters, and services
angular.module('ofcourse', ['ngCookies']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      when('/UCSD', {
        templateUrl: 'partials/UCSD',
        controller: UcsdCtrl
      }).
       when('/UCSD/b', {
         templateUrl: 'partials/UCSDalt',
         controller: UcsdCtrl
       }).
      when('/UCSD/:id', {
        templateUrl: 'partials/course',
        controller: CourseCtrl
      }).
      when('/UCSD/courseb', {
        templateUrl: 'partials/courseB',
        controller: CourseCtrl
      }).
      otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  }]);