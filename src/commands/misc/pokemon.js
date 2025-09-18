const { EmbedBuilder } = require('discord.js');

const pokemonList = [
  'Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Eevee', 'Jigglypuff', 'Meowth', 'Psyduck', 'Snorlax', 'Gengar',
  'Magikarp', 'Lapras', 'Ditto', 'Mew', 'Mewtwo', 'Dragonite', 'Lucario', 'Greninja', 'Togepi', 'Chikorita'
];

module.exports = {
  name: 'pokemon',
  description: 'Spawn a random Pokémon in the chat. Type its name to capture it!',
  options: [],
  callback: async (client, interaction) => {
    // Only allow spawning in the specified channel
    const allowedChannelId = '1418185059504230452';
    if (interaction.channel.id !== allowedChannelId) {
      await interaction.reply({ content: 'Pokémon can only spawn in the designated channel!', ephemeral: true });
      return;
    }

    const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    // Use PokéAPI sprites for images (fallback to official artwork)
    const imageUrl = `https://img.pokemondb.net/artwork/large/${randomPokemon.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;

    const embed = new EmbedBuilder()
      .setColor(0xffcb05)
      .setTitle('A wild Pokémon appeared!')
      .setDescription(`Can you catch it? Type the name in chat to capture it!`)
      .addFields({ name: 'Hint', value: `It's a Generation 1 or 2 Pokémon.` })
      .setImage(imageUrl)
      .setFooter({ text: 'First person to type the name wins!' });

    await interaction.reply({ content: `A wild **${randomPokemon}** appeared!`, embeds: [embed] });

    const filter = m => m.content.toLowerCase() === randomPokemon.toLowerCase() && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', async m => {
      await interaction.channel.send(`🎉 ${m.author} caught **${randomPokemon}**!`);
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.channel.send(`The wild **${randomPokemon}** escaped!`);
      }
    });
  }
};
