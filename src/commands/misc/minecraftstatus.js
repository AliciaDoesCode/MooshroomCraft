const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'minecraftstatus',
  description: 'Get the current Minecraft server status.',
  options: [],
  callback: async (client, interaction) => {
    await interaction.deferReply();
    try {
      // Mojang status API
      const res = await fetch('https://status.mojang.com/check');
      const data = await res.json();
      // Example response: [{"minecraft.net":"green"}, ...]
      const statusMap = {
        green: '🟢 Up',
        yellow: '🟡 Some Issues',
        red: '🔴 Down',
      };
      let statusMsg = '';
      for (const service of data) {
        const [name, status] = Object.entries(service)[0];
        statusMsg += `**${name}**: ${statusMap[status] || status}\n`;
      }
      const embed = new EmbedBuilder()
        .setColor(statusMsg.includes('🔴') ? 0xff0000 : 0x00ff00)
        .setTitle('Minecraft Service Status')
        .setDescription(statusMsg)
        .setFooter({ text: 'Source: status.mojang.com' });
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('Could not fetch Minecraft status.');
    }
  }
};
