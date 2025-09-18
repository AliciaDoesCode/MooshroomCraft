const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/economy.json');
function getEconomy() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return {};
  }
}
function saveEconomy(economy) {
  fs.writeFileSync(dbPath, JSON.stringify(economy, null, 2));
}

const blocks = [
  { name: 'Stone', emoji: '🪨', coins: 1 },
  { name: 'Coal', emoji: '⚫', coins: 3 },
  { name: 'Iron', emoji: '⛓️', coins: 5 },
  { name: 'Gold', emoji: '🟡', coins: 10 },
  { name: 'Diamond', emoji: '💎', coins: 25 },
  { name: 'Emerald', emoji: '🟢', coins: 50 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Go mining and find coins!'),
  async execute(interaction) {
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const userId = user.id;
    const economy = getEconomy();

    // Pick a random block
    const block = blocks[Math.floor(Math.random() * blocks.length)];

    // Ensure structure exists
    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId][userId]) economy[guildId][userId] = { coins: 0, saved: 0, lastClaim: null };

    // Update coins
    economy[guildId][userId].coins = Number(economy[guildId][userId].coins) + block.coins;
    saveEconomy(economy);

    // All values are strings and not undefined
    const blockName = typeof block.name === 'string' ? block.name : 'Unknown';
    const blockCoins = typeof block.coins === 'number' ? block.coins.toString() : '0';
    const blockEmoji = typeof block.emoji === 'string' ? block.emoji : '';

    const embed = new EmbedBuilder()
      .setColor(0x00c3ff)
      .setTitle('⛏️ Mining Adventure!')
      .setDescription(`${user} mined ${blockEmoji} **${blockName}** and found **${blockCoins} coins**!`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: 'Block', value: blockName, inline: true },
        { name: 'Coins Found', value: blockCoins, inline: true },
        { name: 'Total Coins', value: economy[guildId][userId].coins.toString(), inline: true }
      )
      .setFooter({ text: 'Keep mining for more treasures!' });

    await interaction.reply({ embeds: [embed] });
  }
};