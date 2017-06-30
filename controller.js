var videoApp = angular.module('videoApp', ['ngSanitize']);

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.rssFeed = "";
  var feed = [];

  var url = "https://channel9.msdn.com/all/rss";
  // Yahoo api transforms xml feed into json
  var jsonFeed = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'"
  + url + "'&format=json";

  $http.get(jsonFeed).success(function (data) {
      feed = data.query.results.rss;

      // Loop through feed & modify iff necessary
      angular.forEach(feed.channel.item, function(item) {
        console.log(item);
        //console.log(item.description);

        // Removes the ending img tag that causes error for us
        var img_loc = item.description.indexOf('<img');
        item.description = item.description.slice(0, img_loc);

        //console.log(item.description);
      });

      $scope.rssFeed = feed;
  });
}]);
