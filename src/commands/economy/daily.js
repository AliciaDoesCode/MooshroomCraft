const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/economy.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');

function getEconomy() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (typeof data !== 'object' || Array.isArray(data)) data = {};
  } catch {
    data = {};
  }
  return data;
}
function saveEconomy(economy) {
  fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));
}

module.exports = {
  name: 'daily',
  description: 'Claim your daily 50 coins!',
  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const economy = getEconomy();

    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId][userId]) economy[guildId][userId] = { coins: 0, saved: 0, lastClaim: 0 };

    const now = Date.now();
    const lastClaim = economy[guildId][userId].lastClaim || 0;

    // 24 hours in ms
    if (now - lastClaim < 24 * 60 * 60 * 1000) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('⏳ Daily Already Claimed')
            .setDescription('You can only claim your daily coins once every 24 hours.')
        ],
        ephemeral: true,
      });
      return;
    }

    economy[guildId][userId].coins += 50;
    economy[guildId][userId].lastClaim = now;
    saveEconomy(economy);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle('🪙 Daily Coins')
          .setDescription(`You claimed **50 coins**!\nTotal coins: **${economy[guildId][userId].coins}**`)
      ]
    });
  },
};