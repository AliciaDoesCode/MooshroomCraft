const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

const dbPath = path.join(__dirname, '../../../data/economy.json');
function getEconomy() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return {};
  }
}

module.exports = {
  name: 'coins',
  description: 'See how many coins you have gained.',
  options: [
    {
      name: 'user',
      description: 'User to check (optional)',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const economy = getEconomy();

    const data = economy[guildId]?.[user.id];
    const coins = data?.coins || 0;
    const saved = data?.saved || 0;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffd700)
          .setTitle('🪙 Coin Balance')
          .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
          .setDescription(`${user} has **${coins} coins**.\nSaved coins: **${saved}**`)
      ]
    });
  },
};