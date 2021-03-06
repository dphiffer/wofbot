# Hello

__wofbot__ is a [Slack bot](https://api.slack.com/bot-users) that searches [Who's On First records](https://whosonfirst.mapzen.com/) using the [API](https://whosonfirst.mapzen.com/api/methods/).

It looks a little like this:

![screenshot](https://raw.githubusercontent.com/dphiffer/wofbot/master/screenshot.png)

It is based on the official [node-slack-sdk](https://github.com/slackhq/node-slack-sdk) codebase, written in Node.js.

## Requirements

* [Node.js](https://nodejs.org/)
* A Slack team

## How to wofbot

1. Sign up for [a Who's On First API key](https://whosonfirst.mapzen.com/api/keys/register/)
2. Create a Who's On First __authentication token__ and save it for later
3. Create a [new Slack bot user](https://my.slack.com/services/new/bot)
4. Copy the *Slack bot user's* __authentication token__ and save it for later
5. Do this:

```
cd wofbot
npm install @slack/client --save
export SLACK_API_TOKEN='...'
export WOF_API_TOKEN='...'
node index.js
```

Then you should be able to ask it questions in Slack, either using the direct messages feature, or by mentioning `@wofbot` in a channel it's been invited to.
