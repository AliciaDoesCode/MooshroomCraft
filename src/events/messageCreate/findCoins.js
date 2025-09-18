const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/economy.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');

function getEconomy() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}
function saveEconomy(economy) {
  fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));
}

module.exports = async (message) => {
  // Ignore bots and DMs
  if (message.author.bot || !message.guild) return;

  // 10% chance to find coins per message
  if (Math.random() < 0.10) {
    const userId = message.author.id;
    const guildId = message.guild.id;
    const economy = getEconomy();

    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId][userId]) economy[guildId][userId] = { coins: 0, saved: 0 };

    const coinsFound = Math.floor(Math.random() * 10) + 1; // 1-10 coins
    economy[guildId][userId].coins += coinsFound;
    saveEconomy(economy);

    // Send a message in the channel
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle('🪙 You found some coins!')
          .setDescription(`${message.author} found **${coinsFound} coins** just by chatting!`)
      ]
    });
  }
};