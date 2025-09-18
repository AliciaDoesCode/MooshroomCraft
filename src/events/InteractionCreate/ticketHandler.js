const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (client, interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'open_ticket') return;

  // Check if user already has a ticket
  const existing = interaction.guild.channels.cache.find(
    c => c.name === `ticket-${interaction.user.id}`
  );
  if (existing) {
    await interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
    return;
  }

  // Create ticket channel
  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: '1411681101277171844',
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setColor(0x00c3ff)
    .setTitle('Support Ticket')
    .setDescription('A staff member will be with you shortly. Please describe your issue.');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
  await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
};
