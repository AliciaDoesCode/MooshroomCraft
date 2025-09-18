const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

const ecoPath = path.join(__dirname, '../../../data/economy.json');
const xpPath = path.join(__dirname, '../../../data/levels.json');
function getEconomy() {
  try {
    return JSON.parse(fs.readFileSync(ecoPath, 'utf8'));
  } catch {
    return {};
  }
}
function saveEconomy(economy) {
  fs.writeFileSync(ecoPath, JSON.stringify(economy, null, 2));
}
function getLevels() {
  try {
    return JSON.parse(fs.readFileSync(xpPath, 'utf8'));
  } catch {
    return {};
  }
}
function saveLevels(levels) {
  fs.writeFileSync(xpPath, JSON.stringify(levels, null, 2));
}

function getXpRate(amount) {
  if (amount >= 100) return 5;
  if (amount >= 50) return 3;
  return 2;
}

module.exports = {
  name: 'sell',
  description: 'Sell coins for XP or save them.',
  options: [
    {
      name: 'amount',
      description: 'Amount of coins to sell or save',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'action',
      description: 'Sell for XP or save',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'xp', value: 'xp' },
        { name: 'save', value: 'save' },
      ],
    },
  ],
  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const amount = interaction.options.getInteger('amount');
    const action = interaction.options.getString('action');
    const economy = getEconomy();

    if (!economy[guildId]) economy[guildId] = {};
    if (!economy[guildId][userId]) economy[guildId][userId] = { coins: 0, saved: 0 };

    if (economy[guildId][userId].coins < amount) {
      await interaction.reply({ content: 'Not enough coins!', ephemeral: true });
      return;
    }

    if (action === 'xp') {
      // Tiered XP rate
      const xpRate = getXpRate(amount);
      const xpGained = amount * xpRate;

      const levels = getLevels();
      if (!levels[guildId]) levels[guildId] = {};
      if (!levels[guildId][userId]) levels[guildId][userId] = { xp: 0, level: 1 };

      levels[guildId][userId].xp += xpGained;
      economy[guildId][userId].coins -= amount;
      saveLevels(levels);
      saveEconomy(economy);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff99)
            .setTitle('💸 Coins Sold for XP')
            .setDescription(`You sold **${amount} coins** for **${xpGained} XP**!\n(Conversion rate: ${xpRate} XP per coin)`)
        ]
      });
    } else {
      // Save coins
      economy[guildId][userId].coins -= amount;
      economy[guildId][userId].saved += amount;
      saveEconomy(economy);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('💰 Coins Saved')
            .setDescription(`You saved **${amount} coins**!\nTotal saved: **${economy[guildId][userId].saved}**`)
        ]
      });
    }
  },
};