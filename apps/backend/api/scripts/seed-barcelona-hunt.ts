import { config } from 'dotenv';
import path from 'path';

// Load env BEFORE other imports
config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { databaseUrl } from '../src/config/env.config';
import {
  HuntModel,
  HuntVersionModel,
  StepModel,
  UserModel,
} from '../src/database/models';

// Get user email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Usage: npm run seed:barcelona <user-email>');
  console.error('Example: npm run seed:barcelona myemail@gmail.com');
  process.exit(1);
}

// Hunt metadata
const BARCELONA_HUNT = {
  name: 'Barcelona Treasures: A Gaudí & Gothic Adventure',
  description:
    "Discover Barcelona's most iconic landmarks from Plaça de Catalunya through the Gothic Quarter to Gaudí's masterpieces. A 4-5 hour walking adventure through history, art, and architecture.",
  startLocation: {
    lat: 41.3874,
    lng: 2.1686,
    radius: 100,
    address: 'Plaça de Catalunya, Barcelona',
  },
};

// 12-step Barcelona route with varied challenge types
// Structure matches API/DB format:
// - Clue: challenge.clue.{title, description}
// - Quiz (choice): challenge.quiz.{title, description, type, options, targetId}
// - Quiz (input): challenge.quiz.{title, description, type, target}
// - Mission: challenge.mission.{title, description, type, targetLocation}
// - Task: challenge.task.{title, instructions, aiInstructions}
const BARCELONA_STEPS = [
  // Step 1: Plaça de Catalunya - Starting Point (clue)
  {
    type: 'clue',
    challenge: {
      clue: {
        title: 'The Heart of Barcelona',
        description:
          "Welcome to Plaça de Catalunya, the beating heart of Barcelona! This is where the old city meets the new. Stand at the central fountain and look around - you're surrounded by history. To the south lies the famous Las Ramblas, to the north the elegant Passeig de Gràcia. Your adventure begins here. When you're ready, head south toward the tree-lined promenade.",
      },
    },
    hint: 'The fountain is in the center of the square, usually surrounded by pigeons',
    requiredLocation: {
      lat: 41.3874,
      lng: 2.1686,
      radius: 100,
      address: 'Plaça de Catalunya, Barcelona',
    },
  },

  // Step 2: Las Ramblas - Quiz (with time limit and max attempts)
  {
    type: 'quiz',
    challenge: {
      quiz: {
        title: 'The Story of Las Ramblas',
        description:
          "You're walking down one of the world's most famous pedestrian streets. Las Ramblas stretches 1.2 km from Plaça de Catalunya to the sea. But what was this street before it became a promenade?",
        type: 'choice',
        options: [
          { id: 'a', text: 'A seasonal riverbed (rambla)' },
          { id: 'b', text: 'A Roman military road' },
          { id: 'c', text: 'A medieval market street' },
          { id: 'd', text: 'A Moorish garden path' },
        ],
        targetId: 'a',
      },
    },
    hint: 'The name "Rambla" comes from Arabic "ramla" meaning sand',
    timeLimit: 60,
    maxAttempts: 3,
    requiredLocation: {
      lat: 41.3817,
      lng: 2.1734,
      radius: 75,
      address: 'Las Ramblas, Barcelona',
    },
  },

  // Step 3: La Boqueria Market - Mission (match-location)
  {
    type: 'mission',
    challenge: {
      mission: {
        title: 'Market of Colors',
        description:
          'Find the entrance to La Boqueria, Barcelona\'s most famous food market. Since 1217, vendors have sold fresh produce here. Look for the iconic metal and glass entrance arch with "MERCAT DE SANT JOSEP" written above. Check in when you find it!',
        type: 'match-location',
        targetLocation: {
          lat: 41.3819,
          lng: 2.172,
          radius: 50,
          address: 'Mercat de la Boqueria, Las Ramblas 91',
        },
      },
    },
    hint: 'The market is on the right side of Las Ramblas when walking toward the sea',
    requiredLocation: {
      lat: 41.3819,
      lng: 2.172,
      radius: 50,
      address: 'Mercat de la Boqueria, Barcelona',
    },
  },

  // Step 4: Plaça Reial - Gaudí's First Public Work (clue)
  {
    type: 'clue',
    challenge: {
      clue: {
        title: "Young Gaudí's Debut",
        description:
          "Enter Plaça Reial through one of the arched entrances. This elegant square with palm trees and outdoor cafés hides an early secret - the lampposts! In 1878, a young architect named Antoni Gaudí designed these six-armed lampposts for the city. They were his first public commission. Look for the winged helmet of Mercury (god of commerce) at the top. Find them and you'll see the beginnings of Barcelona's most famous architect.",
      },
    },
    hint: 'There are two lampposts near the central fountain with the Three Graces',
    requiredLocation: {
      lat: 41.3801,
      lng: 2.1752,
      radius: 50,
      address: 'Plaça Reial, Barcelona',
    },
  },

  // Step 5: Barcelona Cathedral - Gothic Quiz (with time limit)
  {
    type: 'quiz',
    challenge: {
      quiz: {
        title: 'Gothic Quarter Secrets',
        description:
          "You've entered the Gothic Quarter, Barcelona's medieval heart. Before you stands the Barcelona Cathedral, dedicated to Santa Eulàlia, the city's patron saint. In the cloister garden, something unusual lives among the palm trees. What will you find there?",
        type: 'choice',
        options: [
          { id: 'a', text: '13 white geese' },
          { id: 'b', text: 'A colony of cats' },
          { id: 'c', text: 'Peacocks' },
          { id: 'd', text: 'Koi fish in a pond' },
        ],
        targetId: 'a',
      },
    },
    hint: 'The number represents the age at which Santa Eulàlia was martyred',
    timeLimit: 45,
    requiredLocation: {
      lat: 41.384,
      lng: 2.1762,
      radius: 75,
      address: 'Catedral de Barcelona, Pla de la Seu',
    },
  },

  // Step 6: Bishop's Bridge - Observation Task
  {
    type: 'task',
    challenge: {
      task: {
        title: 'The Legend of the Skull',
        instructions:
          "Find the famous Pont del Bisbe (Bishop's Bridge) connecting two buildings on Carrer del Bisbe. This Neo-Gothic bridge from 1928 is one of Barcelona's most photographed spots. Look underneath the bridge and find the skull with a dagger. Legend says if you don't look at it while passing under, you'll have bad luck. Stand under the bridge, spot the skull, and continue your journey with good fortune!",
        aiInstructions:
          'Accept if player describes finding the skull or mentions passing under the bridge. Look for mentions of: skull, dagger, bridge, looking up, or photos of the bridge.',
      },
    },
    hint: "The bridge is on a narrow street between the Generalitat Palace and the Canon's House",
    requiredLocation: {
      lat: 41.3835,
      lng: 2.1768,
      radius: 40,
      address: 'Carrer del Bisbe, Gothic Quarter',
    },
  },

  // Step 7: Plaça Sant Felip Neri - Hidden History (clue, no location required)
  {
    type: 'clue',
    challenge: {
      clue: {
        title: 'Echoes of the Past',
        description:
          "Navigate through the narrow streets to find Plaça Sant Felip Neri, one of Barcelona's most peaceful yet poignant squares. Look at the walls of the church - the pockmarks you see are not from age, but from a tragic bombing during the Spanish Civil War in 1938. The fountain and children playing today speak of resilience. Take a moment to appreciate the contrast between beauty and history.",
      },
    },
    hint: 'Enter from Carrer de Sant Felip Neri, a small alley behind the Cathedral',
    // No requiredLocation - player can proceed without being at exact spot
  },

  // Step 8: Casa Batlló - Gaudí Quiz (with max attempts only)
  {
    type: 'quiz',
    challenge: {
      quiz: {
        title: "The Dragon's House",
        description:
          "Welcome to Passeig de Gràcia and Casa Batlló, one of Gaudí's most fantastical creations (1904-1906). The facade resembles bones and skulls, the roof a dragon's back, and the cross-topped tower represents Saint George's lance. What nickname do locals give to this building because of its skeletal facade?",
        type: 'choice',
        options: [
          { id: 'a', text: 'Casa dels Ossos (House of Bones)' },
          { id: 'b', text: 'Casa del Drac (House of the Dragon)' },
          { id: 'c', text: 'Casa Màgica (Magic House)' },
          { id: 'd', text: 'Casa de les Escates (House of Scales)' },
        ],
        targetId: 'a',
      },
    },
    hint: 'Look at the balconies - what do they remind you of?',
    maxAttempts: 2,
    requiredLocation: {
      lat: 41.3916,
      lng: 2.1649,
      radius: 50,
      address: 'Passeig de Gràcia 43, Barcelona',
    },
  },

  // Step 9: La Pedrera (Casa Milà) - Mission (match-location, no hint)
  {
    type: 'mission',
    challenge: {
      mission: {
        title: 'The Stone Quarry',
        description:
          "Walk up Passeig de Gràcia to find La Pedrera (Casa Milà), Gaudí's last civil work before dedicating himself entirely to the Sagrada Familia. Built 1906-1912, its undulating stone facade earned it the nickname \"The Stone Quarry\" from skeptical locals. The rooftop with its warrior-like chimneys is legendary. Check in at this UNESCO World Heritage site!",
        type: 'match-location',
        targetLocation: {
          lat: 41.3954,
          lng: 2.1619,
          radius: 50,
          address: 'Passeig de Gràcia 92, Barcelona',
        },
      },
    },
    // No hint - this one is straightforward
    requiredLocation: {
      lat: 41.3954,
      lng: 2.1619,
      radius: 50,
      address: 'La Pedrera, Passeig de Gràcia 92',
    },
  },

  // Step 10: Block of Discord - Task (with time limit for observation)
  {
    type: 'task',
    challenge: {
      task: {
        title: 'The Battle of the Architects',
        instructions:
          "You're standing on the \"Manzana de la Discordia\" (Block of Discord), where three rival modernist architects competed side by side. On this block you'll find: Casa Lleó Morera by Domènech i Montaner, Casa Amatller by Puig i Cadafalch, and Casa Batlló by Gaudí. Each tried to outdo the others! Walk the block and observe the three different facades. Notice how each architect had their own vision of Modernisme.",
        aiInstructions:
          'Accept if player mentions observing the three buildings or describes differences between Casa Batlló, Casa Amatller, and Casa Lleó Morera. Look for architectural observations or comparisons.',
      },
    },
    hint: "The three houses are between Carrer del Consell de Cent and Carrer d'Aragó",
    timeLimit: 300, // 5 minutes to walk and observe
    requiredLocation: {
      lat: 41.3916,
      lng: 2.1649,
      radius: 100,
      address: 'Manzana de la Discordia, Passeig de Gràcia',
    },
  },

  // Step 11: Park Güell - Quiz (text input type, not multiple choice)
  {
    type: 'quiz',
    challenge: {
      quiz: {
        title: 'The Failed Garden City',
        description:
          "You've reached Park Güell, Gaudí's colorful hillside park (1900-1914). Originally planned as a luxury housing development for 60 homes, it was a commercial failure - only 2 houses were ever built! The famous mosaic salamander at the entrance is beloved by visitors. What do locals call this colorful creature?",
        type: 'input',
        expectedAnswer: 'El Drac',
      },
    },
    hint: 'Locals affectionately call it by a Catalan word meaning "The Dragon"',
    maxAttempts: 3,
    requiredLocation: {
      lat: 41.4145,
      lng: 2.1527,
      radius: 100,
      address: 'Park Güell, Barcelona',
    },
  },

  // Step 12: Sagrada Familia - Grand Finale (clue)
  {
    type: 'clue',
    challenge: {
      clue: {
        title: 'The Eternal Masterpiece',
        description:
          'Congratulations! You\'ve reached the Sagrada Familia, Gaudí\'s unfinished masterpiece and Barcelona\'s most iconic landmark. Construction began in 1882 and continues today, making it the world\'s longest-running construction project. Gaudí devoted 43 years of his life to this church, living in his workshop for the final years. He said, "My client is not in a hurry." Stand before the Nativity Facade (the only one Gaudí completed) and marvel at what one man\'s vision created. You\'ve completed the Barcelona Treasures hunt!',
      },
    },
    hint: 'The Nativity Facade faces northeast, toward the rising sun',
    requiredLocation: {
      lat: 41.4036,
      lng: 2.1744,
      radius: 100,
      address: 'Basílica de la Sagrada Familia, Barcelona',
    },
  },
];

async function seedBarcelonaHunt() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(databaseUrl);
    console.log('Connected to MongoDB');

    // 1. Find user by email
    const user = await UserModel.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      console.error(`User not found: ${userEmail}`);
      console.error('Make sure you have logged in at least once to create your user account.');
      await mongoose.disconnect();
      process.exit(1);
    }
    console.log(`Found user: ${user.email} (${user.firstName})`)

    // 2. Check if Barcelona hunt already exists for this user
    const userHunts = await HuntModel.find({ creatorId: user._id, isDeleted: false });
    const userHuntIds = userHunts.map((h) => h.huntId);
    const existingHunt = await HuntVersionModel.findOne({
      huntId: { $in: userHuntIds },
      name: BARCELONA_HUNT.name,
    });
    if (existingHunt) {
      console.log(
        `Hunt "${BARCELONA_HUNT.name}" already exists for this user (huntId: ${existingHunt.huntId})`,
      );
      console.log('Skipping seed to avoid duplicates.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // 3. Create Hunt master
    const hunt = await HuntModel.create({
      creatorId: user._id,
      latestVersion: 1,
      liveVersion: null,
      isDeleted: false,
    });
    console.log(`Created Hunt #${hunt.huntId}`);

    // 4. Create HuntVersion
    const huntVersion = await HuntVersionModel.create({
      huntId: hunt.huntId,
      version: 1,
      ...BARCELONA_HUNT,
      stepOrder: [],
      isPublished: false,
    });
    console.log(`Created HuntVersion v${huntVersion.version}`);

    // 5. Create all steps
    const stepIds: number[] = [];
    console.log('\nCreating steps:');
    for (let i = 0; i < BARCELONA_STEPS.length; i++) {
      const stepData = BARCELONA_STEPS[i];
      const step = await StepModel.create({
        huntId: hunt.huntId,
        huntVersion: 1,
        ...stepData,
      });
      stepIds.push(step.stepId);

      // Get title from nested challenge structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const challengeContent = (stepData.challenge as any)[stepData.type];
      const title = challengeContent?.title || 'Untitled';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepAny = stepData as any;
      const settings = [
        stepAny.hint ? 'hint' : null,
        stepAny.requiredLocation ? 'location' : null,
        stepAny.timeLimit ? `${stepAny.timeLimit}s` : null,
        stepAny.maxAttempts ? `${stepAny.maxAttempts} attempts` : null,
      ]
        .filter(Boolean)
        .join(', ');

      console.log(
        `  ${i + 1}. ${title} [${stepData.type}]${settings ? ` (${settings})` : ''} → stepId: ${step.stepId}`,
      );
    }

    // 6. Update stepOrder
    await HuntVersionModel.updateOne(
      { huntId: hunt.huntId, version: 1 },
      { stepOrder: stepIds },
    );
    console.log(`\nUpdated stepOrder with ${stepIds.length} steps`);

    // 7. Success summary
    console.log('\n' + '='.repeat(50));
    console.log('Barcelona Hunt seeded successfully!');
    console.log('='.repeat(50));
    console.log(`  Hunt ID:    ${hunt.huntId}`);
    console.log(`  Hunt Name:  ${BARCELONA_HUNT.name}`);
    console.log(`  Steps:      ${stepIds.length}`);
    console.log(`  Owner:      ${user.email}`);
    console.log(`  Status:     Draft (isPublished: false)`);
    console.log('='.repeat(50));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Barcelona hunt:', error);
    process.exit(1);
  }
}

seedBarcelonaHunt();
