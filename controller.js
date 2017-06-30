var videoApp = angular.module('videoApp', []);

videoApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.rssFeed = "";
  // TODO: get RSS feed

  //https://steinbring.net/2014/angularjs-creating-a-simple-rss-reader/
  function getFeed(url) {
    var jsonFeed = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'"
    + url + "'&format=json";

    $http.get(jsonFeed).success(function (data) {
        $scope.rssFeed = data.query.results.rss;
    });
  }

  getFeed("https://channel9.msdn.com/all/rss");
}]);
