const { EmbedBuilder } = require('discord.js');

function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

module.exports = {
  name: 'advice',
  description: 'Get a random piece of advice!',
  callback: async (client, interaction) => {
    try {
      const res = await fetch('https://api.adviceslip.com/advice');
      const data = await res.json();

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(getRandomColor())
            .setTitle('💡 Advice')
            .setDescription(`"${data.slip.advice}"`)
        ]
      });
    } catch (error) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Error')
            .setDescription('Could not fetch advice. Please try again later.')
        ]
      });
    }
  },
};