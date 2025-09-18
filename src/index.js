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
      .setImage(imageUrl)
      .setFooter({ text: 'First person to type the name wins!' });
    await channel.send({ embeds: [embed] });

    // Improved filter: ignore case, trim spaces, remove punctuation
    function normalize(str) {
      return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }
    const filter = m => normalize(m.content) === normalize(randomPokemon) && !m.author.bot;
  // Give users 5 minutes (300000 ms) to reply
  const collector = channel.createMessageCollector({ filter, time: 300000 });
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
  // Random interval between 2 and 4 hours
  return Math.floor(Math.random() * (4 - 2 + 1) + 2) * 60 * 60 * 1000;
  }

  async function loopSpawn() {
    await spawnPokemon();
    setTimeout(loopSpawn, randomInterval());
  }
  setTimeout(loopSpawn, randomInterval());
});

eventHandler(client);

client.login(process.env.TOKEN);

