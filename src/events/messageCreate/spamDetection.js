const { Collection } = require('discord.js');

// Configurable thresholds
const SPAM_INTERVAL = 5000; // ms between messages considered spam
const SPAM_REPEAT = 3; // Number of repeated messages to trigger spam
const SPAM_MENTIONS = 5; // Number of mentions in one message to trigger spam

// Track user message history and warnings
const userMessages = new Collection();
const userWarnings = new Collection();

module.exports = async (message) => {
  // Guard against undefined or non-object message
  if (!message || typeof message !== 'object') return;
  // Helper to timeout and ban
  async function punishUser(userId, action, reason) {
    try {
      if (action === 'timeout') {
        await message.member.timeout(60 * 60 * 1000, reason); // 1 hour timeout
      } else if (action === 'ban') {
        await message.member.ban({ reason });
      }
    } catch (e) {}
    // Log to staff channel
    const logChannelId = '1411681102019694718';
    const logEmbed = {
      color: action === 'ban' ? 0xff0000 : 0xffa500,
      title: action === 'ban' ? 'User Banned' : 'User Timed Out',
      description: `User: <@${userId}> (${userId})\nAction: **${action}**\nReason: **${reason}**\nChannel: <#${message.channel.id}>`,
      footer: { text: 'MooshroomCraft Bot' },
      timestamp: new Date().toISOString()
    };
    const logChannel = await message.client.channels.fetch(logChannelId).catch(() => null);
    if (logChannel) await logChannel.send({ embeds: [logEmbed] });
  }
  if (!message.author || !message.guild || !message.member) return;
  if (message.author.bot) return;
  const now = Date.now();
  const userId = message.author.id;
  const content = message.content.trim();

  // Track messages
  if (!userMessages.has(userId)) userMessages.set(userId, []);
  const history = userMessages.get(userId);
  history.push({ content, time: now });
  // Keep only last 10 messages
  if (history.length > 10) history.shift();

  // Helper to send warning and log
  async function warnAndLog(reason) {
    // Track warnings
    const prev = userWarnings.get(userId) || 0;
    const newCount = prev + 1;
    userWarnings.set(userId, newCount);

    await message.delete().catch(() => {});
    // Send warning embed to user
    const warnEmbed = {
      color: 0xff0000,
      title: '⚠️ Spam Warning',
      description: `Your message was removed for: **${reason}**. Please do not spam!\n\n**Warning ${newCount}/5**`,
      footer: { text: 'MooshroomCraft Bot' },
      timestamp: new Date().toISOString()
    };
    await message.channel.send({ content: `<@${userId}>`, embeds: [warnEmbed] });
    // Log to staff channel
    const logChannelId = '1411681102019694718';
    const logEmbed = {
      color: 0xffa500,
      title: 'Spam Detected',
      description: `User: <@${userId}> (${userId})\nReason: **${reason}**\nChannel: <#${message.channel.id}>\nContent: ${content}\nWarnings: ${newCount}/5`,
      footer: { text: 'MooshroomCraft Bot' },
      timestamp: new Date().toISOString()
    };
    const logChannel = await message.client.channels.fetch(logChannelId).catch(() => null);
    if (logChannel) await logChannel.send({ embeds: [logEmbed] });

    // Timeout after 3 warnings
    if (newCount === 3) {
      await punishUser(userId, 'timeout', 'Spam: 3 warnings');
    }
    // Ban after 5 warnings
    if (newCount === 5) {
      await punishUser(userId, 'ban', 'Spam: 5 warnings');
    }
  }

  // Spam: rapid sending
  const recent = history.filter(m => now - m.time < SPAM_INTERVAL);
  if (recent.length >= SPAM_REPEAT) {
    await warnAndLog('Rapid message sending');
    return;
  }

  // Spam: repeated content
  const repeats = history.filter(m => m.content === content);
  if (repeats.length >= SPAM_REPEAT) {
    await warnAndLog('Repeated message content');
    return;
  }

  // Spam: excessive mentions
  if (message.mentions.users.size >= SPAM_MENTIONS) {
    await warnAndLog('Excessive mentions');
    return;
  }
};
