const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Open a support ticket',
  options: [],
  callback: async (client, interaction) => {
    // Send a message with a button to open a ticket
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: 'Need help? Click below to open a support ticket!', components: [row] });
  }
};
