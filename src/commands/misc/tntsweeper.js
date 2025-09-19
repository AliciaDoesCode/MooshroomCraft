const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function generateBoard(size, tntCount) {
  // Create board with TNTs randomly placed
  const board = Array(size * size).fill('safe');
  let placed = 0;
  while (placed < tntCount) {
    const idx = Math.floor(Math.random() * board.length);
    if (board[idx] === 'safe') {
      board[idx] = 'tnt';
      placed++;
    }
  }
  return board;
}

module.exports = {
  name: 'tntsweeper',
  description: 'Play Minecraft TNT Sweeper!',
  options: [],
    callback: async (client, interaction) => {
      let gameState = 'active';
    const size = 5; // 5x5 board
    const tntCount = 5;
    const board = generateBoard(size, tntCount);
    const revealed = Array(size * size).fill(false);

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Minecraft TNT Sweeper')
      .setDescription('Click the buttons to reveal safe spots. Avoid the TNT!');

    function getRows() {
      const rows = [];
      for (let r = 0; r < size; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < size; c++) {
          const idx = r * size + c;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`tntsweeper_${idx}`)
              .setLabel(revealed[idx] ? (board[idx] === 'tnt' ? '💣' : '🟩') : '❓')
              .setStyle(revealed[idx] ? (board[idx] === 'tnt' ? ButtonStyle.Danger : ButtonStyle.Success) : ButtonStyle.Secondary)
              .setDisabled(revealed[idx])
          );
        }
        rows.push(row);
      }
      return rows;
    }

    await interaction.reply({ embeds: [embed], components: getRows() });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith('tntsweeper_') && i.user.id === interaction.user.id,
      time: 300000
    });

    collector.on('collect', async i => {
      const idx = parseInt(i.customId.split('_')[1]);
      revealed[idx] = true;
      if (board[idx] === 'tnt') {
        gameState = 'lost';
        embed.setDescription('💥 You hit TNT! Game over.\n\n🟩 = Safe\n💣 = TNT\n❓ = Unrevealed');
        embed.setColor(0x8B0000);
        await i.update({ embeds: [embed], components: getRows() });
        collector.stop();
      } else {
        // Check win
        const safeLeft = board.filter((b, j) => b === 'safe' && !revealed[j]).length;
        if (safeLeft === 0) {
          gameState = 'won';
          embed.setDescription('🎉 You cleared all safe spots! You win!\n\n🟩 = Safe\n💣 = TNT\n❓ = Unrevealed');
          embed.setColor(0x00ff00);
          await i.update({ embeds: [embed], components: getRows() });
          collector.stop();
        } else {
          await i.update({ embeds: [embed], components: getRows() });
        }
      }
    });

    collector.on('end', () => {
      // Disable all buttons after game ends
      gameState = 'ended';
      embed.setFooter({ text: 'Game ended. Start a new game with /tntsweeper!' });
      interaction.editReply({ embeds: [embed], components: getRows().map(row => {
        row.components.forEach(btn => btn.setDisabled(true));
        return row;
      }) });
    });
  }
};
