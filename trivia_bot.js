// ============================================================
//  VideoManic Trivia Bot
//  Requirements: Node.js 18+, discord.js v14
//  Install: npm install discord.js
//  Usage: node trivia_bot.js
// ============================================================

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

// ─── CONFIG ─────────────────────────────────────────────────
const BOT_TOKEN   = "YOUR_BOT_TOKEN_HERE";
const ROLE_ID     = "1475557966026641642"; // VideoManic role
const QUESTIONS_PER_GAME = 3;
const COOLDOWN_MS = 60_000; // 1 minute
// ────────────────────────────────────────────────────────────

// 50-question pool across Movies/TV, Music, Gaming, General
const QUESTION_POOL = [
  // 🎬 Movies & TV
  { q: "What color pill does Neo take in The Matrix?",         a: "Red",       choices: ["Blue", "Red", "Green", "Yellow"] },
  { q: "What studio made Toy Story?",                          a: "Pixar",     choices: ["Disney", "Pixar", "DreamWorks", "Sony"] },
  { q: "Who plays Iron Man in the MCU?",                       a: "Robert Downey Jr.", choices: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"] },
  { q: "What show features the Stark family?",                 a: "Game of Thrones", choices: ["Vikings", "The Witcher", "Game of Thrones", "House of the Dragon"] },
  { q: "In Finding Nemo, what kind of fish is Nemo?",          a: "Clownfish", choices: ["Goldfish", "Blowfish", "Clownfish", "Swordfish"] },
  { q: "What is the name of Batman's butler?",                 a: "Alfred",    choices: ["James", "Alfred", "Thomas", "Richard"] },
  { q: "How many Infinity Stones are there in the MCU?",       a: "6",         choices: ["4", "5", "6", "7"] },
  { q: "What streaming platform makes Stranger Things?",       a: "Netflix",   choices: ["HBO", "Hulu", "Netflix", "Disney+"] },
  { q: "What color is the Teletubbies' Tinky Winky?",          a: "Purple",    choices: ["Red", "Yellow", "Green", "Purple"] },
  { q: "What movie has the quote 'To infinity and beyond!'?",  a: "Toy Story", choices: ["A Bug's Life", "Toy Story", "Cars", "Brave"] },
  { q: "Who directed Jurassic Park?",                          a: "Steven Spielberg", choices: ["James Cameron", "George Lucas", "Steven Spielberg", "Christopher Nolan"] },
  { q: "What is the highest-grossing film of all time?",       a: "Avatar",    choices: ["Titanic", "Endgame", "Avatar", "Star Wars"] },
  { q: "In SpongeBob, what is the name of the Krabby Patty restaurant?", a: "The Krusty Krab", choices: ["The Fry Cook", "The Krusty Krab", "The Patty Shack", "Burger Barn"] },

  // 🎵 Music & Pop Culture
  { q: "What artist released the album 'Thriller'?",           a: "Michael Jackson", choices: ["Prince", "Michael Jackson", "David Bowie", "Elton John"] },
  { q: "How many members are in BTS?",                         a: "7",         choices: ["5", "6", "7", "8"] },
  { q: "What pop star is known as 'Queen Bey'?",               a: "Beyoncé",   choices: ["Rihanna", "Beyoncé", "Adele", "Lady Gaga"] },
  { q: "What band sings 'Bohemian Rhapsody'?",                 a: "Queen",     choices: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"] },
  { q: "What app is known for short viral videos and dances?", a: "TikTok",    choices: ["Instagram", "Snapchat", "TikTok", "YouTube"] },
  { q: "What color is the Spotify logo?",                      a: "Green",     choices: ["Blue", "Red", "Green", "Orange"] },
  { q: "Which artist has the most Grammy wins ever?",          a: "Beyoncé",   choices: ["Taylor Swift", "Adele", "Beyoncé", "Jay-Z"] },
  { q: "What music streaming service has the most subscribers?", a: "Spotify", choices: ["Apple Music", "Tidal", "Spotify", "Amazon Music"] },
  { q: "What does 'OG' stand for in pop culture?",             a: "Original Gangster", choices: ["Original Genius", "Outstanding Greatness", "Original Gangster", "Officially Great"] },
  { q: "What social media platform uses hashtags most famously?", a: "Twitter/X", choices: ["Facebook", "Instagram", "Twitter/X", "LinkedIn"] },
  { q: "What singer is known for the album '1989'?",           a: "Taylor Swift", choices: ["Katy Perry", "Taylor Swift", "Selena Gomez", "Demi Lovato"] },

  // 🎮 Gaming
  { q: "What color are Mario's overalls?",                     a: "Blue",      choices: ["Red", "Blue", "Green", "Yellow"] },
  { q: "What is the best-selling video game of all time?",     a: "Minecraft", choices: ["Tetris", "GTA V", "Minecraft", "Wii Sports"] },
  { q: "What game features a 'Battle Royale' mode on an island shrinking with a storm?", a: "Fortnite", choices: ["PUBG", "Fortnite", "Apex Legends", "Warzone"] },
  { q: "What is the main currency in The Legend of Zelda?",    a: "Rupees",    choices: ["Gold", "Coins", "Rupees", "Gems"] },
  { q: "What company makes the PlayStation?",                  a: "Sony",      choices: ["Microsoft", "Nintendo", "Sony", "Sega"] },
  { q: "What game do you punch trees to gather wood in?",      a: "Minecraft", choices: ["Roblox", "Minecraft", "Terraria", "Valheim"] },
  { q: "What is Pikachu's type in Pokémon?",                   a: "Electric",  choices: ["Fire", "Water", "Grass", "Electric"] },
  { q: "In Among Us, what are the killers called?",            a: "Impostors", choices: ["Killers", "Aliens", "Impostors", "Traitors"] },
  { q: "What game features a Creeper enemy?",                  a: "Minecraft", choices: ["Terraria", "Minecraft", "Roblox", "Subnautica"] },
  { q: "What console does Nintendo currently sell?",           a: "Nintendo Switch", choices: ["Wii U", "Nintendo Switch", "3DS", "GameCube"] },
  { q: "What is the name of Link's nemesis in Zelda?",         a: "Ganon",     choices: ["Bowser", "Ganon", "Eggman", "Wario"] },
  { q: "What game popularized the 'Battle Pass' system?",      a: "Fortnite",  choices: ["Apex Legends", "Warzone", "Fortnite", "Valorant"] },
  { q: "How many players start in a standard Fortnite Battle Royale match?", a: "100", choices: ["50", "75", "100", "150"] },

  // 🌍 General Knowledge
  { q: "How many continents are there on Earth?",              a: "7",         choices: ["5", "6", "7", "8"] },
  { q: "What is the capital of France?",                       a: "Paris",     choices: ["London", "Berlin", "Paris", "Rome"] },
  { q: "How many sides does a hexagon have?",                  a: "6",         choices: ["5", "6", "7", "8"] },
  { q: "What planet is known as the Red Planet?",              a: "Mars",      choices: ["Venus", "Jupiter", "Mars", "Saturn"] },
  { q: "What is the fastest land animal?",                     a: "Cheetah",   choices: ["Lion", "Horse", "Cheetah", "Greyhound"] },
  { q: "How many colors are in a rainbow?",                    a: "7",         choices: ["5", "6", "7", "8"] },
  { q: "What is H2O more commonly known as?",                  a: "Water",     choices: ["Oxygen", "Hydrogen", "Water", "Salt"] },
  { q: "What is the largest ocean on Earth?",                  a: "Pacific",   choices: ["Atlantic", "Indian", "Pacific", "Arctic"] },
  { q: "How many months are in a year?",                       a: "12",        choices: ["10", "11", "12", "13"] },
  { q: "What animal is known as man's best friend?",           a: "Dog",       choices: ["Cat", "Dog", "Horse", "Rabbit"] },
  { q: "What is the color of the sky on a clear day?",         a: "Blue",      choices: ["White", "Blue", "Gray", "Cyan"] },
  { q: "How many legs does a spider have?",                    a: "8",         choices: ["6", "7", "8", "10"] },
];

// ─── In-memory cooldown tracker ─────────────────────────────
const cooldowns = new Map(); // userId → timestamp when cooldown expires

// ─── Utility: pick N unique random items from array ─────────
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Shuffle answer choices ──────────────────────────────────
function shuffleChoices(choices) {
  return [...choices].sort(() => Math.random() - 0.5);
}

// ─── Build button row for a question ────────────────────────
function buildButtons(choices, disabled = false) {
  const styles = [ButtonStyle.Primary, ButtonStyle.Secondary, ButtonStyle.Success, ButtonStyle.Danger];
  const row = new ActionRowBuilder().addComponents(
    choices.map((choice, i) =>
      new ButtonBuilder()
        .setCustomId(`answer_${i}`)
        .setLabel(choice)
        .setStyle(styles[i])
        .setDisabled(disabled)
    )
  );
  return row;
}

// ─── Run the trivia game for one user ───────────────────────
async function runTrivia(interaction) {
  const userId = interaction.user.id;

  // Check cooldown
  if (cooldowns.has(userId)) {
    const remaining = cooldowns.get(userId) - Date.now();
    if (remaining > 0) {
      const secs = Math.ceil(remaining / 1000);
      return interaction.reply({
        content: `⏳ You failed recently! Please wait **${secs} second(s)** before trying again.`,
        ephemeral: true,
      });
    } else {
      cooldowns.delete(userId);
    }
  }

  // Check if user already has the role
  const member = interaction.member;
  if (member.roles.cache.has(ROLE_ID)) {
    return interaction.reply({
      content: `✅ You already have the <@&${ROLE_ID}> role!`,
      ephemeral: true,
    });
  }

  const questions = pickRandom(QUESTION_POOL, QUESTIONS_PER_GAME);

  await interaction.reply({
    content: `🎬 **VideoManic Trivia!**\nAnswer **${QUESTIONS_PER_GAME} questions** correctly to earn the <@&${ROLE_ID}> role!\n\n_Only you can see this. Good luck!_`,
    ephemeral: true,
  });

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const shuffledChoices = shuffleChoices(q.choices);
    const row = buildButtons(shuffledChoices);

    const msg = await interaction.followUp({
      content: `**Question ${i + 1} of ${QUESTIONS_PER_GAME}:**\n\n> ${q.q}`,
      components: [row],
      ephemeral: true,
    });

    // Wait for button click (30 second timeout)
    let collected;
    try {
      collected = await msg.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (btn) => btn.user.id === userId,
        time: 30_000,
      });
    } catch {
      // Timed out
      await interaction.followUp({
        content: `⌛ Time's up! You took too long. Wait **1 minute** and try again with \`/trivia\`.`,
        ephemeral: true,
      });
      cooldowns.set(userId, Date.now() + COOLDOWN_MS);
      return;
    }

    const chosenIndex = parseInt(collected.customId.split("_")[1]);
    const chosenAnswer = shuffledChoices[chosenIndex];
    const correct = chosenAnswer === q.a;

    // Disable buttons and show result
    const disabledRow = buildButtons(shuffledChoices, true);

    if (correct) {
      await collected.update({
        content: `**Question ${i + 1} of ${QUESTIONS_PER_GAME}:**\n\n> ${q.q}\n\n✅ **Correct!** The answer was **${q.a}**.`,
        components: [disabledRow],
      });
    } else {
      await collected.update({
        content: `**Question ${i + 1} of ${QUESTIONS_PER_GAME}:**\n\n> ${q.q}\n\n❌ **Wrong!** The correct answer was **${q.a}**.\n\nYou'll need to wait **1 minute** and try again.`,
        components: [disabledRow],
      });
      cooldowns.set(userId, Date.now() + COOLDOWN_MS);

      await interaction.followUp({
        content: `😔 Better luck next time! Come back in **60 seconds** and use \`/trivia\` to get a fresh set of questions.`,
        ephemeral: true,
      });
      return;
    }
  }

  // All 3 correct — assign role
  try {
    await member.roles.add(ROLE_ID);
    await interaction.followUp({
      content: `🎉 **You passed!** You've been given the <@&${ROLE_ID}> role. Welcome to the club!`,
      ephemeral: true,
    });
  } catch (err) {
    console.error("Failed to assign role:", err);
    await interaction.followUp({
      content: `✅ You answered everything correctly, but I couldn't assign the role. Please contact an admin. (Make sure my role is above VideoManic in the role list!)`,
      ephemeral: true,
    });
  }
}

// ─── Client setup ────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Register slash command globally (or per guild for instant updates)
  const command = new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Answer 3 quick trivia questions to earn the VideoManic role!");

  await client.application.commands.set([command]);
  console.log("✅ Slash command /trivia registered.");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "trivia") {
    await runTrivia(interaction).catch(console.error);
  }
});

client.login(BOT_TOKEN);
