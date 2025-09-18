const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'kiss',
  description: 'Kiss another user!',
  options: [
    {
      name: 'target',
      description: 'The user you want to kiss',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  callback: async (client, interaction) => {
    const target = interaction.options.getUser('target');
    try {
      const res = await fetch('https://nekos.life/api/kiss');
      const data = await res.json();

      await interaction.reply({
        embeds: [{
          title: `${interaction.user.username} kisses ${target.username}`,
          color: 0xeeeeee,
          image: { url: data.url },
        }],
      });
    } catch (err) {
      await interaction.reply({ content: 'There was an error!\n' + err, ephemeral: true });
    }
  },
};