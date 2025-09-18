const fs = require('fs');
const path = require('path');

// Simple JSON database for XP
const dbPath = path.join(__dirname, '../../../data/levels.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');

function getLevels() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveLevels(levels) {
  fs.writeFileSync(dbPath, JSON.stringify(levels, null, 2));
}

module.exports = async (message) => {
  // Ignore bots and DMs
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;
  const guildId = message.guild.id;
  const levels = getLevels();

  if (!levels[guildId]) levels[guildId] = {};
  if (!levels[guildId][userId]) {
    levels[guildId][userId] = { xp: 0, level: 1 };
  }

  // Add XP
  const xpGain = Math.floor(Math.random() * 10) + 5; // 5-14 XP per message
  levels[guildId][userId].xp += xpGain;

  // Level up logic
  const nextLevelXp = levels[guildId][userId].level * 100;
  if (levels[guildId][userId].xp >= nextLevelXp) {
    levels[guildId][userId].level += 1;
    levels[guildId][userId].xp = 0;
    saveLevels(levels);

    // Announce level up in the specified channel
    const levelChannel = message.guild.channels.cache.get('1411681102523011208');
    if (levelChannel) {
      levelChannel.send(
        `🎉 ${message.author} has reached level ${levels[guildId][userId].level}!`
      );
    }
  } else {
    saveLevels(levels);
  }
};