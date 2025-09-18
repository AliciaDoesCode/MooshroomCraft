const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Open a support ticket',
  options: [],
  callback: async (client, interaction) => {
    // Only allow a specific user to use the command
  const allowedUserId = '1388803859182522429';
    if (interaction.user.id !== allowedUserId) {
      await interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
      return;
    }

    // Create an embed for the ticket system
    const embed = new EmbedBuilder()
      .setColor(0x00c3ff)
      .setTitle('Support Ticket')
      .setDescription('Need help? Click the button below to open a support ticket!');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
