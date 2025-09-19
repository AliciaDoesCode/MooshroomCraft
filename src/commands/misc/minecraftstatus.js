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
      // Use mcstatus.io API for Minecraft Java server status
      const res = await fetch('https://api.mcstatus.io/v2/status/java/minecraft.net');
      if (!res.ok) throw new Error('API returned non-OK status');
      const data = await res.json();
      let statusMsg = '';
      if (data.online) {
        statusMsg = '🟢 Minecraft is online and running.';
      } else {
        statusMsg = '🔴 Minecraft is offline or experiencing issues.';
      }
      const embed = new EmbedBuilder()
        .setColor(data.online ? 0x00ff00 : 0xff0000)
        .setTitle('Minecraft Service Status')
        .setDescription(statusMsg)
        .setFooter({ text: 'Source: mcstatus.io' });
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('Could not fetch Minecraft status.');
    }
  }
};
