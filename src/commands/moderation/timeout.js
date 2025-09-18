const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
  callback: async (client, interaction) => {
    const mentionable = interaction.options.get('target-user').value;
    const duration = interaction.options.get('duration').value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply("I can't timeout a bot.");
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply('Please provide a valid timeout duration.');
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply('Timeout duration cannot be less than 5 seconds or more than 28 days.');
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply("You can't timeout that user because they have the same/higher role than you.");
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply("I can't timeout that user because they have the same/higher role than me.");
      return;
    }

    try {
      const { default: prettyMs } = await import('pretty-ms');

      let replyMsg;
      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        replyMsg = `${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`;
        await interaction.editReply(replyMsg);
      } else {
        await targetUser.timeout(msDuration, reason);
        replyMsg = `${targetUser} was timed out for ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`;
        await interaction.editReply(replyMsg);
      }

      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.get('1411681102019694718');
      console.log('Attempting to log to mod log channel:', logChannel?.id);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor(0xff3366)
          .setTitle('⏳ User Timed Out')
          .setThumbnail(targetUser.user.displayAvatarURL({ dynamic: true, size: 512 }))
          .addFields(
            { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Target', value: `${targetUser.user.tag} (${targetUser.id})`, inline: true },
            { name: 'Duration', value: prettyMs(msDuration, { verbose: true }), inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      } else {
        console.log('Mod log channel not found or bot lacks permissions.');
      }
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `There was an error when timing out: ${error.message}`, ephemeral: true });
      } else {
        await interaction.editReply(`There was an error when timing out: ${error.message}`);
      }
    }
  },

  name: 'timeout',
  description: 'Timeout a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to timeout.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'Timeout duration (30m, 1h, 1 day).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};