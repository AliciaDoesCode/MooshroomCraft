const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  deleted: true, // This will prevent the command from being registered
  name: 'sendverify',
  description: 'Send the verification button in the verify channel',
  options: [
    {
      name: 'channel',
      description: 'The channel to send the verification message in',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  callback: async (client, interaction) => {
    // ...existing code...
  },
};