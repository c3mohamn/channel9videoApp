var videoApp = angular.module('videoApp', ['ngSanitize']);

// Values required for fetching RSS feed
var url = "https://channel9.msdn.com/all/rss";
// Yahoo api transforms xml feed into json
var jsonFeed = "https://query.yahooapis.com/v1/public/yql?" +
"q=select%20*%20from%20xml%20where%20url%3D'" + url + "'&format=json";

/* Allows the use of dynamic src for videos. */
videoApp.config(function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain..
   'http://video.ch9.ms/ch9/**']);
});

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  var feed = []; // stores initial feed
  $scope.feed = []; // template feed
  $scope.isArray = angular.isArray; // insert array check into scope
  $scope.isString = angular.isString; // insert string check into scope

  // GET RSS feed form Channel9
  $http.get(jsonFeed).success(function (data) {
      feed = data.query.results.rss;
      console.log(feed);

      // Loop through feed & modify iff necessary
      angular.forEach(feed.channel.item, function(item) {
        // Removes the ending img tag that causes error for us
        var img_loc = item.description.indexOf('<img');
        item.description = item.description.slice(0, img_loc);
      });

      $scope.feed = angular.copy(feed);
  });

  /* Search feed for feed item's that match search_val. */
  $scope.search_feed = function(search_val) {

    // If no search val, return to default
    if (!search_val) {
      $scope.feed.channel.item = feed.channel.item;
      return false;
    }

    search_val = search_val.toLowerCase();
    var matching_items = [];

    // Loop through items from original feed
    for (var key in feed.channel.item) {
      var item = feed.channel.item[key];
      var matches = false;

      // Check if matches with item category || title || author.
      if (angular.isArray(item.category)) {
        for (var key in item.category) {
          if (item.category[key].toLowerCase().indexOf(search_val) > -1)
            matches = true;
        }
      } else {
        if (item.category.toLowerCase().indexOf(search_val) > -1)
          matches = true;
      }
      if (item.title.toLowerCase().indexOf(search_val) > -1)
        matches = true;
      if (item.author.toLowerCase().indexOf(search_val) > -1 )
        matches = true;

      if (matches)
        matching_items.push(item);
    }

    $scope.feed.channel.item = matching_items;
  }

  /* Tries to find the first playable mp4 video in rss feed item's list
   * of videos.
   */
  $scope.find_mp4 = function(videos) {
    //console.log(videos);
    for (var vid in videos) {
      //console.log(vid);
      // return if mp4 and is not filesize 1
      if (videos[vid].fileSize > 1 && videos[vid].type == "video/mp4")
        return videos[vid].url;
    }
  }
}]);
