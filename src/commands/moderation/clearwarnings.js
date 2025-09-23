
const { userWarnings } = require('.../data/warnings');

module.exports = {
  name: 'clearwarnings',
  description: 'Clear all spam warnings for a user',
  options: [
    {
      name: 'user',
      description: 'User to clear warnings for',
      type: 6, // USER
      required: true
    }
  ],
  async execute(interaction) {
    // Only allow users with the mod role to use
    const modRoleId = '1411681101277171846';
    if (!interaction.member.roles.cache.has(modRoleId)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    if (!userWarnings) return interaction.reply({ content: 'Warning system not available.', ephemeral: true });
    userWarnings.set(user.id, 0);
    const embed = {
      color: 0x00ff99,
      title: 'Warnings Cleared',
      description: `All spam warnings for <@${user.id}> have been cleared.`,
      footer: { text: 'MooshroomCraft Bot' },
      timestamp: new Date().toISOString()
    };
    return interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
