var videoApp = angular.module('videoApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

/* Allows the use of dynamic src for videos. */
videoApp.config(function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain..
   'http://**']);
});

/* Returns Scroll Position of Page */
videoApp.directive("scrollPos", function($window) {
  return function(scope, element, attrs) {
    angular.element($window).bind("scroll", function() {
      if (!scope.scrollPosition) {
        scope.scrollPosition = 0
      }
      scope.scrollPosition = this.pageYOffset;
      scope.$apply();
    });
  };
});

/* Filter what item to start from, used for pageination */
videoApp.filter('startFrom', function() {
  return function(input, start) {
    start = +start; //parse to int
    if (input) return input.slice(start);
  }
});

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.feed = {}; // template feed
  var feed = {}; // Store a Feed object with extracted RSS feed data
  $scope.playVideo = false;
  $scope.searchFilters = {
    showFilters: false,
    title: true,
    author: true,
    tags: true,
    duration: false,
    date: false
  }
  // Pagination Vars
  $scope.curPage = 0;
  $scope.pageSize = 10;
  $scope.numPages = function() {
    if ($scope.feed.items)
      return Math.ceil($scope.feed.items.length / $scope.pageSize);
  }

  // GET RSS feed form Channel9
  $http.get(jsonFeed).success(function (data) {
      var original_feed = data.query.results.rss;
      feed = new Feed(original_feed);
      $scope.feed = angular.copy(feed);
      console.log(feed);
  });

  /* Search feed for feed item's that match search_val. */
  $scope.search_feed = function(search_val) {

    // Reset Page back to start
    $scope.curPage = 0;

    // If no search val, return to default
    if (!search_val) {
      $scope.feed.items = feed.items;
      return false;
    }

    search_val = search_val.toLowerCase();
    var matching_items = [];

    // Loop through items from original feed and apply checked filters
    for (var key in feed.items) {
      var item = feed.items[key];
      var matches = false;

      // Check if matches with item tags || title || author.
      if ($scope.searchFilters.tags) {
        for (var key in item.tags) {
          if (item.tags[key].toLowerCase().indexOf(search_val) > -1)
            matches = true;
        }
      }
      if ($scope.searchFilters.title)
        if (item.title.toLowerCase().indexOf(search_val) > -1)
          matches = true;
      if ($scope.searchFilters.author)
        if (item.author.toLowerCase().indexOf(search_val) > -1 )
          matches = true;

      if (matches)
        matching_items.push(item);
    }

    $scope.feed.items = matching_items;
  }
}]);
