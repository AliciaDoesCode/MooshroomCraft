const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

const X_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAACv44AEAAAAAIKEXhASeA31%2BV94ataNJ4A2yi8w%3D66lJw2quUnru3n5gAM1v0DGzl2SgWSJjc9pgoq3AZSy5zD6aPp';
const DISCORD_CHANNEL_ID = '1411681102334132296';
const X_USERNAME = 'mooshcraftt';

const cachePath = path.join(__dirname, 'lastTweetId.txt');
function getLastTweetId() {
  try {
    return fs.readFileSync(cachePath, 'utf8');
  } catch {
    return null;
  }
}
function setLastTweetId(id) {
  fs.writeFileSync(cachePath, id, 'utf8');
}

let rateLimited = false;
let retryAfter = 10 * 60 * 1000; // 10 minutes

async function fetchLatestTweet() {
  try {
    // Get user ID
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${X_USERNAME}`, {
      headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` }
    });

    if (userRes.status === 429) {
      console.error('Rate limited by Twitter/X API. Waiting before retrying...');
      rateLimited = true;
      setTimeout(() => { rateLimited = false; }, retryAfter);
      return null;
    }

    const userData = await userRes.json();
    if (!userData.data || !userData.data.id) {
      console.error('Could not fetch user ID:', userData);
      return null;
    }
    const userId = userData.data.id;

    // Get latest tweet with media
    const tweetRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&expansions=attachments.media_keys&media.fields=url,preview_image_url,type`,
      { headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` } }
    );

    if (tweetRes.status === 429) {
      console.error('Rate limited by Twitter/X API. Waiting before retrying...');
      rateLimited = true;
      setTimeout(() => { rateLimited = false; }, retryAfter);
      return null;
    }

    const tweetData = await tweetRes.json();
    if (!tweetData.data || !tweetData.data[0]) {
      console.error('Could not fetch tweets:', tweetData);
      return null;
    }
    const tweet = tweetData.data[0];

    // Find media info if present
    let imageUrl = null;
    let videoPreviewUrl = null;
    let mediaType = null;
    if (tweet.attachments && tweet.attachments.media_keys && tweetData.includes && tweetData.includes.media) {
      for (const media of tweetData.includes.media) {
        if (tweet.attachments.media_keys.includes(media.media_key)) {
          if (media.type === 'photo' && media.url) {
            imageUrl = media.url;
            mediaType = 'photo';
            break;
          }
          if ((media.type === 'video' || media.type === 'animated_gif') && media.preview_image_url) {
            videoPreviewUrl = media.preview_image_url;
            mediaType = media.type;
            break;
          }
        }
      }
    }

    return { tweet, imageUrl, videoPreviewUrl, mediaType };
  } catch (err) {
    console.error('Error fetching tweet:', err);
    return null;
  }
}

async function postXEmbed(client) {
  if (rateLimited) {
    console.log('Currently rate limited. Skipping this check.');
    return;
  }

  const result = await fetchLatestTweet();
  console.log('Fetched tweet:', result);

  if (!result || !result.tweet) {
    console.log('No tweet found or error fetching tweet.');
    return;
  }

  const { tweet, imageUrl, videoPreviewUrl, mediaType } = result;
  const lastTweetId = getLastTweetId();

  // Only post if this tweet is new
  if (tweet.id === lastTweetId) {
    console.log('Already posted this tweet. Skipping.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x1da1f2)
    .setTitle('🐮 New Post on X!')
    .setDescription(`[@mooshcraftt](https://x.com/mooshcraftt) just posted:\n\n${tweet.text}`)
    .setURL(`https://x.com/mooshcraftt/status/${tweet.id}`)
    .setFooter({ text: 'Follow us on X for updates!' });

  if (mediaType === 'photo' && imageUrl) {
    embed.setImage(imageUrl);
  } else if ((mediaType === 'video' || mediaType === 'animated_gif') && videoPreviewUrl) {
    embed.setThumbnail(videoPreviewUrl);
    embed.addFields({ name: 'Media', value: `This post contains a ${mediaType.replace('_', ' ')}! [View on X](https://x.com/mooshcraftt/status/${tweet.id})`, inline: false });
  }

  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel) {
    await channel.send({ embeds: [embed] });
    setLastTweetId(tweet.id); // Save the posted tweet ID
    console.log('Embed sent to Discord!');
  } else {
    console.log('Discord channel not found or bot lacks permissions.');
  }
}

function startXMonitor(client) {
  setInterval(() => postXEmbed(client), 10 * 60 * 1000); // Check every 10 minutes
  postXEmbed(client); // Post once on startup for testing
}

module.exports = startXMonitor;