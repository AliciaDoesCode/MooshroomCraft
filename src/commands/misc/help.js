const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const pages = [
  {
    name: 'Misc',
    description: 'Fun and utility commands for everyone.',
    commands: [
      { name: 'level', description: 'Check your level and XP.' },
      { name: 'gay', description: 'Tells you how gay you are.' },
      { name: 'kiss', description: 'Kiss another user.' },
      { name: 'advice', description: 'Get a random piece of advice.' },
      { name: 'help', description: 'Show help for all commands.' },
      { name: 'trivia', description: 'Answer a random Minecraft trivia question!' },
      { name: 'pokemon', description: 'Try to catch a wild Pokémon!' },
      { name: 'tntsweeper', description: 'Play Minecraft TNT Sweeper!' },
      { name: 'minecraftstatus', description: 'Get the current Minecraft server status.' },
    ],
    color: 0x00c3ff,
  },
  {
    name: 'Economy',
    description: 'Economy commands for earning and spending coins.',
    commands: [
      { name: 'coins', description: 'Check your coin balance.' },
      { name: 'daily', description: 'Claim your daily coins.' },
      { name: 'mine', description: 'Mine for coins.' },
      { name: 'sell', description: 'Sell items for coins.' },
    ],
    color: 0xf1c40f,
  },
];

function getEmbed(pageIndex) {
  const page = pages[pageIndex];
  return new EmbedBuilder()
    .setColor(page.color)
    .setTitle(`Help - ${page.name} Commands`)
    .setDescription(page.description)
    .addFields(
      ...page.commands.map(cmd => ({
        name: `/${cmd.name}`,
        value: cmd.description,
        inline: false,
      }))
    );
}

function getRow(pageIndex) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_prev')
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === 0),
    new ButtonBuilder()
      .setCustomId('help_next')
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === pages.length - 1)
  );
}

module.exports = {
  name: 'help',
  description: 'Show help for all commands.',
  callback: async (client, interaction) => {
    let pageIndex = 0;
    await interaction.reply({
      embeds: [getEmbed(pageIndex)],
      components: [getRow(pageIndex)],
    });

    // Set up a collector for button interactions
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id && ['help_prev', 'help_next'].includes(i.customId),
      time: 60000,
    });

    collector.on('collect', async i => {
      if (i.customId === 'help_prev' && pageIndex > 0) pageIndex--;
      if (i.customId === 'help_next' && pageIndex < pages.length - 1) pageIndex++;
      await i.update({
        embeds: [getEmbed(pageIndex)],
        components: [getRow(pageIndex)],
      });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch {}
    });
  },
};