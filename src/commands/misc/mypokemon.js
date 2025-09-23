const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '../../data/pokemon.json');
function getUserPokemon(userId) {
// Simple icon map for starters and common Pokémon
const pokemonIcons = {
  Bulbasaur: '🌱',
  Charmander: '🔥',
  Squirtle: '💧',
  Pikachu: '⚡',
  Chikorita: '🍃',
  Cyndaquil: '🔥',
  Totodile: '💧',
  Eevee: '🦊',
  Jigglypuff: '🎤',
  Meowth: '😺',
  Psyduck: '🦆',
  Snorlax: '😴',
  Gengar: '👻',
  Magikarp: '🐟',
  Lapras: '🦕',
  Ditto: '🟪',
  Mew: '✨',
  Mewtwo: '🧠',
  Dragonite: '🐉',
  Lucario: '🥋',
  Greninja: '🥷',
  Togepi: '🥚',
};
  if (!fs.existsSync(dataPath)) return [];
  const data = JSON.parse(fs.readFileSync(dataPath));
  return data[userId]?.captured || [];
}

module.exports = {
  name: 'mypokemon',
  description: 'Show the Pokémon you have captured.',
  options: [],
  callback: async (client, interaction) => {
    const userId = interaction.user.id;
    const captured = getUserPokemon(userId);
    const embed = new EmbedBuilder()
      .setColor(0x00c3ff)
      .setTitle(`${interaction.user.username}'s Pokémon Collection`)
      .setDescription(
        captured.length
          ? captured.map(p => `${pokemonIcons[p] || '❔'} ${p}`).join('\n')
          : 'You have not captured any Pokémon yet!'
      );
    await interaction.reply({ embeds: [embed] });
  }
};
