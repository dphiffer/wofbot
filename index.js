
var slackToken = process.env.SLACK_API_TOKEN || '';
var wofToken = process.env.WOF_API_TOKEN || '';

if (slackToken == '' || wofToken == '') {
  console.error('Please export environment vars SLACK_API_TOKEN & WOF_API_TOKEN');
  process.exit(1);
}

var https = require('https');
var querystring = require('querystring');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var rtm = new RtmClient(slackToken);
rtm.start();

var botId = null;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function handleRTMAuthenticated(rtmStartData) {
  botId = rtmStartData.self.id;
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {

  if (! botId) {
    return;
  }

  if (message.channel.substr(0, 1) == 'D' &&
      message.subtype != 'bot_message') {

    // Direct message
    searchWithQuery(message.channel, message.text.trim());

  } else {

    // Channel message
    var searchRegex = new RegExp('^\s*<@' + botId + '>(.+)');
    var searchMatch = message.text.match(searchRegex);
    if (! searchMatch) {
      return;
    }
    searchWithQuery(message.channel, searchMatch[1].trim());

  }
});

function searchWithQuery(channel, searchQuery) {

  // Search the Who's On First API with a place query

  var query = querystring.stringify({
    method: 'whosonfirst.places.search',
    q: searchQuery,
    access_token: wofToken
  });

  var options = {
    hostname: 'whosonfirst.mapzen.com',
    path: '/api/rest/?' + query,
    method: 'GET'
  };

  var body = '';
  var req = https.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      var rsp = JSON.parse(body);
      respondWithResults(channel, searchQuery, rsp);
    });
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.end();
}

function respondWithResults(channel, searchQuery, rsp) {

  console.log(`${searchQuery}: ${rsp.total} results`);
  var results = rsp.results;

  var text = '<https://whosonfirst.mapzen.com/spelunker/search/?q=' +
             encodeURIComponent(searchQuery) + '|' +
             rsp.total + ' result' +
             (rsp.total == 1 ? '' : 's') +
             '> for “' + searchQuery + '”';

  var attachments = [];

  for (var result, i = 0; i < Math.floor(5, results.length); i++) {
    result = results[i];
    attachments.push((i + 1) + '. <https://whosonfirst.mapzen.com/spelunker/id/' + result['wof:id'] + '/|' + result['wof:name'] + '> (' + result['wof:placetype'] + ')');
  }
  attachments = attachments.join('\n');
  attachments = [{
    text: attachments
  }];

  var postData = querystring.stringify({
    token: slackToken,
    channel: channel,
    text: text,
    attachments: JSON.stringify(attachments),
    as_user: 'false',
    unfurl_links: 'false',
    username: 'wofbot',
    icon_emoji: ':robot_face:'
  });

  var options = {
    hostname: 'slack.com',
    path: '/api/chat.postMessage',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  var body = '';
  var req = https.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      //console.log(body);
    });
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}
