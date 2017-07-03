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

videoApp.controller('videoCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.feed = {}; // template feed
  var feed = {      // altered feed
    title: String,
    icon: String,
    description: String,
    items: [] // list of feed_items
  };
  var feed_item = { // values from feed items that we want
    title: String,
    author: String,
    date: String,
    link: String,
    thumbnail: String,
    description: String,
    duration: String,
    video: String,
    tags: []
  };
  $scope.playVideo = false;
  $scope.searchFilters = {
    showFilters: false,
    title: true,
    author: true,
    tags: true,
    duration: false,
    date: false
  }

  // GET RSS feed form Channel9
  $http.get(jsonFeed).success(function (data) {
      var original_feed = data.query.results.rss;

      feed.title = original_feed.channel.title;
      feed.icon = original_feed.channel.image[0].url;
      feed.description = original_feed.channel.description;
      console.log(original_feed);

      // Loop through feed & modify iff necessary
      angular.forEach(original_feed.channel.item, function(item) {
        // Used to remove the ending img tag that causes error for us
        var img_loc = item.description.indexOf('<img');

        // Assign item attributes that we want
        feed_item.title = item.title;
        feed_item.author = item.author;
        feed_item.date = item.pubDate;
        feed_item.link = item.link;
        feed_item.thumbnail = item.thumbnail[1].url;
        feed_item.description = item.description.slice(0, img_loc);
        feed_item.duration = format_time(item.duration);
        if (item.group) feed_item.video = find_mp4(item.group.content);
        else feed_item.video = null;
        // iff tag is string, convert to array
        if (angular.isString(item.category)) feed_item.tags.push(item.category);
        else feed_item.tags = item.category;

        feed.items.push(angular.copy(feed_item));
      });

      $scope.feed = angular.copy(feed);
  });

  /* Search feed for feed item's that match search_val. */
  $scope.search_feed = function(search_val) {
    console.log($scope.searchFilters.title);


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

/* ------ Helper Functions ------ */

/* Converts seconds to 00:00:00 format. */
function format_time(seconds) {
  // Add padding (01:01:01) instad of (1:1:1)
  function padTime(t) { return t < 10 ? "0" + t : t; }

  var hours = padTime(Math.floor(seconds / 3600)),
      minutes = padTime(Math.floor((seconds % 3600) / 60)),
      seconds = padTime(Math.floor(seconds % 60));

  if (hours > 0) return hours + ":" + minutes + ":" + seconds;  // 00:00:00
  else return minutes + ":" + seconds;                          // 00:00
}

/* Tries to find the first playable mp4 video in rss feed item's list
 * of videos.
 */
function find_mp4(videos) {
  for (var vid in videos) {
    // return if mp4
    if (videos[vid].type == "video/mp4")
      return videos[vid].url;
  }
}
