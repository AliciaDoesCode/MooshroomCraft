const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const starters = [
  'Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Chikorita', 'Cyndaquil', 'Totodile', 'Eevee'
]
const pokemonIcons = {
  Bulbasaur: '🌱',
  Charmander: '🔥',
  Squirtle: '💧',
  Pikachu: '⚡',
  Chikorita: '🍃',
  Cyndaquil: '🔥',
  Totodile: '💧',
  Eevee: '🦊',
};
const dataPath = path.join(__dirname, '../../data/pokemon.json');
function getUserData(userId) {
  if (!fs.existsSync(dataPath)) return {};
  const data = JSON.parse(fs.readFileSync(dataPath));
  return data[userId] || {};
}
function setUserStarter(userId, starter) {
  let data = {};
  if (fs.existsSync(dataPath)) data = JSON.parse(fs.readFileSync(dataPath));
  if (!data[userId]) data[userId] = { captured: [] };
  data[userId].starter = starter;
  if (!data[userId].captured.includes(starter)) data[userId].captured.push(starter);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'starter',
  description: 'Choose your starter Pokémon!',
  options: [],
  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const userData = getUserData(userId);
    if (userData.starter) {
      await interaction.reply({ content: `You already chose ${userData.starter} as your starter!`, ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(0xffcb05)
      .setTitle('Choose Your Starter Pokémon!')
      .setDescription('Select your starter Pokémon from the menu below. You will receive a Pokéball with your starter!');
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('choose_starter')
      .setPlaceholder('Select your starter Pokémon...')
      .addOptions(starters.map(p => ({ label: `${pokemonIcons[p] || ''} ${p}`, value: p })));
    const row = new ActionRowBuilder().addComponents(selectMenu);
    try {
      await interaction.reply({ embeds: [embed], components: [row] });
      // Use channel collector as a fallback
      const collector = interaction.channel.createMessageComponentCollector({
        filter: i => i.customId === 'choose_starter' && i.user.id === userId,
        time: 60000,
        max: 1
      });
      collector.on('collect', async i => {
        const chosen = i.values[0];
        setUserStarter(userId, chosen);
        await i.update({ embeds: [embed.setDescription(`You chose ${pokemonIcons[chosen] || ''} **${chosen}** as your starter! You received a Pokéball!\n\n${pokemonIcons[chosen] || ''} **${chosen}** has been added to your collection!`)], components: [] });
      });
      collector.on('end', async collected => {
        if (collected.size === 0) {
          try {
            await interaction.editReply({ content: 'Starter selection timed out.', embeds: [], components: [] });
          } catch (e) {}
        }
      });
    } catch (err) {
      await interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
    }
  }
};
