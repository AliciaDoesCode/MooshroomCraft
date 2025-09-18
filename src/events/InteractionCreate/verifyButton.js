module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'verify_button') return;

  try {
    const memberRole = interaction.guild.roles.cache.find(role => role.name === 'Member');
    if (!memberRole) {
      await interaction.reply({ content: 'Member role not found!', ephemeral: true });
      return;
    }

    await interaction.member.roles.add(memberRole);

    await interaction.reply({ content: '✅ You have been verified and given the Member role!', ephemeral: true });
  } catch (error) {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: `There was an error: ${error.message}`, ephemeral: true });
    }
  }
};