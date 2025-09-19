const { EmbedBuilder } = require('discord.js');
let fetch;
try {
  fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
} catch (e) {
  fetch = require('node-fetch');
}

module.exports = {
  name: 'minecraftstatus',
  description: 'Get the current Minecraft server status.',
  options: [],
  callback: async (client, interaction) => {
    await interaction.deferReply();
    try {
      // Mojang status API (use new endpoint)
      const res = await fetch('https://api.mojang.com/check');
      if (!res.ok) throw new Error('API returned non-OK status');
      const data = await res.json();
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
        .setFooter({ text: 'Source: api.mojang.com' });
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('Could not fetch Minecraft status.');
    }
  }
};
