const { Collection } = require('discord.js');

// Shared collections for warnings and cooldowns
const userWarnings = new Collection();
const warningCooldowns = new Collection();

module.exports = {
  userWarnings,
  warningCooldowns
};
