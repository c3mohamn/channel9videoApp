// Values required for fetching RSS feed
var url = "https://channel9.msdn.com/all/rss",
// Yahoo api transforms xml feed into json
    jsonFeed = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'" +
               url + "'&format=json";

/* Feed Object */
function Feed(feed) {
 this.title = feed.channel.title,
 this.icon = feed.channel.image[0].url,
 this.description = feed.channel.description,
 this.items = populate_items(feed.channel.item) // FeedItems Array
}

/* Feed Item Object (videos) */
function FeedItem(item) {
 this.title = item.title,
 this.author = item.author,
 this.date = item.pubDate,
 this.link = item.link,
 this.thumbnail = item.thumbnail[1].url,
 this.description = item.description.slice(0, item.description.indexOf('<img')),
 this.duration = format_time(item.duration),
 this.video = find_mp4(item.group),
 this.tags = populate_tags(item.category)
}

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
  if (videos) {
    for (var vid in videos.content) {
      // return if mp4
      if (videos.content[vid].type == "video/mp4")
        return videos.content[vid].url;
    }
  }
  return null;
}

/* Returns an Array of FeedItems. */
function populate_items(items) {
  var new_items = new Array();
  for (var key in items) {
    new_items.push(new FeedItem(items[key]));
  }

  return new_items;
}

/* Returns an Array of tags.
 *
 * If tags is a string, push in to an Array.
 */
function populate_tags(tags) {
  var new_tags = new Array();
  if (angular.isString(tags)) new_tags.push(tags);
  else new_tags = tags;

  return new_tags
}
