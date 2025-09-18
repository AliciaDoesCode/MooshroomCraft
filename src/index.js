require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./Handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const startXMonitor = require('./utils/xToDiscord');


client.on('clientReady', () => {
  startXMonitor(client);

  // Automatic random Pokémon spawns
  const allowedChannelId = '1418185059504230452';
  const pokemonList = [
    'Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Eevee', 'Jigglypuff', 'Meowth', 'Psyduck', 'Snorlax', 'Gengar',
    'Magikarp', 'Lapras', 'Ditto', 'Mew', 'Mewtwo', 'Dragonite', 'Lucario', 'Greninja', 'Togepi', 'Chikorita'
  ];
  const { EmbedBuilder } = require('discord.js');

  async function spawnPokemon() {
    const channel = await client.channels.fetch(allowedChannelId).catch(() => null);
    if (!channel) return;
    const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    const imageUrl = `https://img.pokemondb.net/artwork/large/${randomPokemon.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    const embed = new EmbedBuilder()
      .setColor(0xffcb05)
      .setTitle('A wild Pokémon appeared!')
      .setDescription(`Can you catch it? Type the name in chat to capture it!`)
      .addFields({ name: 'Hint', value: `It's a Generation 1 or 2 Pokémon.` })
      .setImage(imageUrl)
      .setFooter({ text: 'First person to type the name wins!' });
    await channel.send({ content: `A wild **${randomPokemon}** appeared!`, embeds: [embed] });

    const filter = m => m.content.toLowerCase() === randomPokemon.toLowerCase() && !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 15000 });
    collector.on('collect', async m => {
      await channel.send(`🎉 ${m.author} caught **${randomPokemon}**!`);
      collector.stop();
    });
    collector.on('end', collected => {
      if (collected.size === 0) {
        channel.send(`The wild **${randomPokemon}** escaped!`);
      }
    });
  }

  function randomInterval() {
    // Random interval between 5 and 15 minutes
    return Math.floor(Math.random() * (15 - 5 + 1) + 5) * 60 * 1000;
  }

  async function loopSpawn() {
    await spawnPokemon();
    setTimeout(loopSpawn, randomInterval());
  }
  setTimeout(loopSpawn, randomInterval());
});

eventHandler(client);

client.login(process.env.TOKEN);

