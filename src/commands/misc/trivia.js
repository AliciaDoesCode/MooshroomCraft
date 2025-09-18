const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const triviaQuestions = [
  {
    question: "Which mob explodes when it gets close to you?",
    choices: [
      { label: "Zombie", value: "Zombie" },
      { label: "Creeper", value: "Creeper" },
      { label: "Skeleton", value: "Skeleton" },
      { label: "Spider", value: "Spider" }
    ],
    answer: "Creeper"
  },
  {
    question: "What do you need to make a Nether Portal?",
    choices: [
      { label: "Obsidian", value: "Obsidian" },
      { label: "Stone", value: "Stone" },
      { label: "Sand", value: "Sand" },
      { label: "Wood", value: "Wood" }
    ],
    answer: "Obsidian"
  },
  {
    question: "Which item lets you respawn in the Nether?",
    choices: [
      { label: "Bed", value: "Bed" },
      { label: "Respawn Anchor", value: "Respawn Anchor" },
      { label: "Ender Pearl", value: "Ender Pearl" },
      { label: "Totem of Undying", value: "Totem of Undying" }
    ],
    answer: "Respawn Anchor"
  },
  {
    question: "Which mob drops string?",
    choices: [
      { label: "Spider", value: "Spider" },
      { label: "Pig", value: "Pig" },
      { label: "Cow", value: "Cow" },
      { label: "Chicken", value: "Chicken" }
    ],
    answer: "Spider"
  },
  {
    question: "What is the rarest ore in Minecraft?",
    choices: [
      { label: "Diamond", value: "Diamond" },
      { label: "Emerald", value: "Emerald" },
      { label: "Gold", value: "Gold" },
      { label: "Iron", value: "Iron" }
    ],
    answer: "Emerald"
  }
];

module.exports = {
  name: 'trivia',
  description: 'Answer a random Minecraft trivia question!',
  options: [],
  callback: async (client, interaction) => {
    const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];

    const embed = new EmbedBuilder()
      .setColor(0x00c3ff)
      .setTitle('🧠 Minecraft Trivia')
      .setDescription(q.question)
      .setFooter({ text: 'Select your answer below!' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('trivia_answer')
      .setPlaceholder('Choose your answer...')
      .addOptions(q.choices);

    const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({ embeds: [embed], components: [row] });

    // Create a collector for the select menu
    const filter = i => i.customId === 'trivia_answer' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async i => {
      const selected = i.values[0];
      if (selected === q.answer) {
        await i.reply({ content: '✅ Correct! You know your Minecraft!' });
      } else {
        await i.reply({ content: `❌ Wrong! The correct answer was **${q.answer}**.` });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: '⏰ Time is up! Try /trivia again.' });
      }
    });
  }
};