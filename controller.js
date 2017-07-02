var videoApp = angular.module('videoApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

// Values required for fetching RSS feed
var url = "https://channel9.msdn.com/all/rss",
// Yahoo api transforms xml feed into json
    jsonFeed = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'" +
               url + "'&format=json";

/* Allows the use of dynamic src for videos. */
videoApp.config(function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain..
   'http://video.ch9.ms/ch9/**']);
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

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.feed = {}; // template feed
  var feed = {      // altered feed
    title: String,
    items: []
  };
  var feed_item = { // values from feed items that we want
    title: String,
    author: String,
    date: String,
    thumbnail: String,
    description: String,
    video: String,
    tags: []
  };

  // GET RSS feed form Channel9
  $http.get(jsonFeed).success(function (data) {
      var original_feed = data.query.results.rss;
      feed.title = original_feed.channel.title;
      console.log(original_feed);

      // Loop through feed & modify iff necessary
      angular.forEach(original_feed.channel.item, function(item) {
        // Used to remove the ending img tag that causes error for us
        var img_loc = item.description.indexOf('<img');

        // Assign item attributes that we want
        feed_item.title = item.title;
        feed_item.author = item.author;
        feed_item.date = item.pubDate;
        feed_item.thumbnail = item.thumbnail[1].url;
        feed_item.description = item.description.slice(0, img_loc);
        if (item.group) feed_item.video = find_mp4(item.group.content);
        // iff tag is string, convert to array
        if (angular.isString(item.category)) feed_item.tags.push(item.category);
        else feed_item.tags = item.category;

        feed.items.push(angular.copy(feed_item));
      });

      $scope.feed = angular.copy(feed);
  });

  /* Search feed for feed item's that match search_val. */
  $scope.search_feed = function(search_val) {

    // If no search val, return to default
    if (!search_val) {
      $scope.feed.items = feed.items;
      return false;
    }

    search_val = search_val.toLowerCase();
    var matching_items = [];

    // Loop through items from original feed
    for (var key in feed.items) {
      var item = feed.items[key];
      var matches = false;

      // Check if matches with item tags || title || author.
      for (var key in item.tags) {
        if (item.tags[key].toLowerCase().indexOf(search_val) > -1)
          matches = true;
      }
      if (item.title.toLowerCase().indexOf(search_val) > -1)
        matches = true;
      if (item.author.toLowerCase().indexOf(search_val) > -1 )
        matches = true;

      if (matches)
        matching_items.push(item);
    }

    $scope.feed.items = matching_items;
  }

  /* Tries to find the first playable mp4 video in rss feed item's list
   * of videos.
   */
  function find_mp4(videos) {
    //console.log(videos);
    for (var vid in videos) {
      //console.log(vid);
      // return if mp4 and is not filesize 1
      if (videos[vid].fileSize > 1 && videos[vid].type == "video/mp4")
        return videos[vid].url;
    }
  }

}]);
