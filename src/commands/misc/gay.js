const { ApplicationCommandOptionType } = require('discord.js');

function ran(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  name: 'gay',
  description: 'Tells you how gay you are. Mentioning a user tells how gay the specified user is.',
  options: [
    {
      name: 'target',
      description: 'The user to check',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  callback: async (client, interaction) => {
    const member = interaction.options.getUser('target') || interaction.user;
    await interaction.reply({
      embeds: [{
        color: 0x00ff99,
        description: `${member} is ${ran(0, 100)}% gay!`,
      }],
      flags: 64, // Ephemeral message
    });
  },
};