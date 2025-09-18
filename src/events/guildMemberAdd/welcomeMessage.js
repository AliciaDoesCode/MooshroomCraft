console.log('guildMemberAdd event fired');
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  const channel = member.guild.channels.cache.get('1411681102183268365');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle('🎉 Welcome!')
    .setDescription(`Welcome to MooshroomCraft, ${member.user}! - Keep an eye out for the latest news and updates for the upcoming Minecraft Server of MooshroomCraft!`)
    .setThumbnail(member.user.displayAvatarURL());

  channel.send({ embeds: [embed] });
};