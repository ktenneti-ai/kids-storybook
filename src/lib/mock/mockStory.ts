import { findTheme } from "../constants";
import type { AgeRangeId, StoryPageContent, StoryTextResponse } from "../types";
import { hashString, mulberry32 } from "./random";

interface ThemePack {
  openingLocation: string;
  companionIntro: string;
  wonders: string[];
  challenge: string;
  turningPoint: string;
  resolutionScene: string;
  lesson: string;
}

function fill(text: string, name: string): string {
  return text.replace(/\{name\}/g, name);
}

const THEME_PACKS: Record<string, ThemePack> = {
  "space-adventure": {
    openingLocation: "a swirl of stardust twinkled just outside the window, spelling out an invitation to fly",
    companionIntro:
      "A cheerful little comet named Pip zoomed by, leaving a trail of giggling sparkles, and asked {name} to come along.",
    wonders: [
      "{name} floated past a marshmallow-soft moon and waved hello to its sleepy face.",
      "Together, {name} and Pip skipped along a rainbow-colored comet trail.",
      "{name} counted seven giggling stars playing hide-and-seek behind a purple planet.",
      "They planted a tiny flag on a fluffy, cloud-soft asteroid and had a picnic.",
      "{name} listened closely as the planets hummed a soft, twinkly tune.",
      "A gentle shower of sparkles drifted down like space confetti, and {name} laughed.",
    ],
    challenge: "the littlest star in the sky blinked, flickered, and grew dim, and all the other stars gasped.",
    turningPoint:
      "gathered a giggle from every new friend along the way and hummed a warm, twinkly lullaby until the little star glowed again",
    resolutionScene: "The little star sparkled brighter than ever, and the whole sky lit up to cheer for {name}.",
    lesson: "even the smallest spark of kindness can light up the whole sky",
  },
  "under-the-sea": {
    openingLocation: "a hidden tide pool shimmered like glass and seemed to wink",
    companionIntro: "A friendly sea turtle named Bubbles paddled up with a gap-toothed smile and invited {name} for a swim.",
    wonders: [
      "{name} drifted past a coral castle dressed in every color of the rainbow.",
      "Together, {name} and Bubbles chased a school of giggling fish through a bubble tunnel.",
      "{name} found a glowing pearl tucked inside a shy clam's shell.",
      "They waved to a family of seahorses twirling in a gentle current.",
      "{name} tickled a patch of swaying seaweed until it wiggled and danced.",
      "A cloud of shimmering bubbles floated up, and {name} popped them one by one, giggling.",
    ],
    challenge: "the reef's glowing pearl lantern flickered out, and the coral castle grew dark and quiet.",
    turningPoint:
      "cupped the pearl gently, hummed a soothing song, and asked every new friend to share one warm memory to relight it",
    resolutionScene: "The pearl lantern glowed warmer than ever, and the whole reef sparkled to thank {name}.",
    lesson: "sharing a little warmth with friends can light up even the darkest corner",
  },
  "enchanted-forest": {
    openingLocation: "a trail of glowing fireflies blinked a path from the garden gate into the trees",
    companionIntro: "A small, wise fox named Juniper peeked out from behind a mossy log and offered to be {name}'s guide.",
    wonders: [
      "{name} tiptoed past a circle of giant mushrooms that glowed like little lanterns.",
      "Together, {name} and Juniper followed a stream that sparkled with tiny floating lights.",
      "{name} shared a berry snack with a family of chattering squirrels.",
      "They climbed a friendly old oak tree to watch the fireflies swirl like stardust.",
      "{name} learned a bird's whistling song and sang it right back.",
      "A gentle breeze rustled the leaves, scattering petals like soft confetti.",
    ],
    challenge: "the oldest tree in the forest, the one that kept all the animals safe, had lost its very last golden leaf.",
    turningPoint:
      "asked every forest friend to bring one small gift of kindness, wove them into a new golden leaf, and gently placed it on the old tree's tallest branch",
    resolutionScene: "The old tree glowed with a hundred golden leaves, and the whole forest sang for {name}.",
    lesson: "even a forest of friends grows strong one small kindness at a time",
  },
  "dinosaur-discovery": {
    openingLocation: "a soft rumble echoed from just beyond the garden fence, like giant footsteps saying hello",
    companionIntro:
      "A gentle, long-necked dinosaur named Clover lowered her head with a friendly snort and invited {name} to climb aboard.",
    wonders: [
      "{name} rode along a fern-lined trail while baby dinosaurs peeked out to wave.",
      "Together, {name} and Clover splashed through a warm, bubbling stream.",
      "{name} counted the spots on a shy, spiky dinosaur hiding behind a boulder.",
      "They watched a flock of gliding dinosaurs swoop and loop through the misty sky.",
      "{name} helped a wobbly baby dinosaur take its very first steps.",
      "A rainbow arched over the valley, and every dinosaur let out a happy roar.",
    ],
    challenge:
      "the valley's biggest watering hole had dried down to just a puddle, and the youngest dinosaurs grew thirsty and sad.",
    turningPoint:
      "followed a trickle of water uphill, found a hidden spring, and helped every dinosaur friend dig a new path for it to flow",
    resolutionScene: "The watering hole filled up cool and sparkling, and every dinosaur in the valley cheered for {name}.",
    lesson: "working together can solve even the biggest problem in the valley",
  },
  "fairy-tale-kingdom": {
    openingLocation: "a tiny paper invitation, sealed with a star-shaped sticker, fluttered in through the window",
    companionIntro:
      "A small, friendly dragon named Marmalade hiccuped a puff of glittery smoke and offered {name} a ride to the castle.",
    wonders: [
      "{name} soared past towers frosted like birthday cakes, waving to the flags on top.",
      "Together, {name} and Marmalade landed in a garden where the flowers hummed a tune.",
      "{name} was welcomed by a circle of kind fairies who sprinkled shimmering dust.",
      "They tiptoed through a hall of mirrors that only showed happy memories.",
      "{name} helped a shy unicorn find its favorite ribbon in the royal stable.",
      "A parade of lanterns lit up the courtyard just as the sun began to set.",
    ],
    challenge: "the kingdom's Great Bell, the one that rang every morning to greet the sun, had gone silent.",
    turningPoint:
      "gathered a cheerful song from each new friend, climbed the tower, and rang the bell with a heart full of courage",
    resolutionScene: "The Great Bell rang out clear and golden, and the whole kingdom cheered {name}'s name.",
    lesson: "a little courage, shared with friends, can wake up an entire kingdom",
  },
  "superhero-adventure": {
    openingLocation: "a shimmer of golden light traced a cape-shaped outline right on the bedroom wall",
    companionIntro: "A cheerful robot sidekick named Sparks beeped hello and handed {name} a soft, glowing cape.",
    wonders: [
      "{name} soared over rooftops, waving to neighbors hanging up laundry in the sun.",
      "Together, {name} and Sparks helped a kitten climb safely down from a tall tree.",
      "{name} used super-hearing to find a lost puppy hiding behind the bakery.",
      "They helped an elderly neighbor carry groceries all the way up the hill.",
      "{name} practiced the superhero promise: always help, always be kind.",
      "A crowd of neighbors clapped and cheered as {name} zoomed by overhead.",
    ],
    challenge: "the town's community garden had wilted, and the little seedlings looked sad and thirsty.",
    turningPoint:
      "rallied every neighbor with a cheerful smile, formed a bucket-brigade of watering cans, and refilled the garden together",
    resolutionScene: "The garden sprang back to life in a burst of color, and the whole neighborhood cheered for {name}.",
    lesson: "the greatest superpower of all is a kind heart that brings people together",
  },
  "jungle-safari": {
    openingLocation: "a trail of paw prints and parrot feathers led straight from the back porch into the trees",
    companionIntro: "A chatty parrot named Mango swooped down, perched on {name}'s shoulder, and squawked, 'Adventure, this way!'",
    wonders: [
      "{name} swung gently on a vine bridge above a sparkling green river.",
      "Together, {name} and Mango followed a troop of monkeys tossing ripe mangoes.",
      "{name} tiptoed past a sleepy sloth who gave a slow, friendly wave.",
      "They splashed through a warm puddle while tiny frogs sang a bubbly chorus.",
      "{name} spotted a shy jaguar cub peeking out from behind a giant leaf.",
      "A rainbow of butterflies swirled around {name} like a gentle, fluttering hug.",
    ],
    challenge: "the jungle's oldest watering hole had gotten blocked by a fallen tree, and the animals couldn't reach it.",
    turningPoint:
      "rallied the monkeys, the sloth, and even the shy jaguar cub, and together they rolled the fallen tree out of the way",
    resolutionScene: "Cool water rushed back into the watering hole, and every animal in the jungle cheered for {name}.",
    lesson: "teamwork can move even the biggest obstacle in the jungle",
  },
  "winter-wonderland": {
    openingLocation: "the first snowflake of winter landed right on the windowsill and seemed to sparkle just for {name}",
    companionIntro:
      "A round, roly-poly snow creature named Frostine wobbled over with a warm, snowy grin and invited {name} to play.",
    wonders: [
      "{name} and Frostine slid down a hill of sparkling snow, giggling the whole way.",
      "Together they built a tiny snow-village with the warmest, cheeriest lanterns.",
      "{name} caught snowflakes on their mittens and admired each tiny, perfect shape.",
      "They shared warm cocoa with a family of friendly snow rabbits.",
      "{name} strung twinkling lights between the snow-village rooftops.",
      "A gentle snow began to fall, and the whole village glowed like a soft nightlight.",
    ],
    challenge: "the village's Great Lantern, the one that kept everyone warm all winter, had flickered out.",
    turningPoint:
      "invited every snow friend to share their warmest memory, and together they relit the lantern with the glow of their laughter",
    resolutionScene: "The Great Lantern blazed warm and bright, and the whole snowy village cheered for {name}.",
    lesson: "sharing warmth with friends can light up even the coldest winter night",
  },
};

function buildRoles(length: number): string[] {
  const risingCount = Math.max(0, length - 6);
  return ["opening", "companion", ...Array(risingCount).fill("rising"), "challenge", "climax", "resolution", "ending"];
}

export function generateMockStoryText(
  input: { childName: string; age: AgeRangeId; theme: string; length: number },
  variationSeed = 0
): StoryTextResponse {
  const theme = findTheme(input.theme);
  const pack = THEME_PACKS[theme.id] ?? THEME_PACKS["space-adventure"];
  const name = input.childName;
  const rng = mulberry32(hashString(`${name}|${theme.id}|${input.age}|${variationSeed}`));

  const openingVariant = Math.floor(rng() * 2);
  const wondersStart = Math.floor(rng() * pack.wonders.length);

  const roles = buildRoles(input.length);
  let wonderIndex = 0;

  const pages: StoryPageContent[] = roles.map((role, idx) => {
    let text: string;
    switch (role) {
      case "opening":
        text =
          openingVariant === 0
            ? `${name} could hardly wait — tonight, ${fill(pack.openingLocation, name)}.`
            : `The moment ${name} looked outside, ${fill(pack.openingLocation, name)}, and a big smile appeared.`;
        break;
      case "companion":
        text = fill(pack.companionIntro, name);
        break;
      case "rising":
        text = fill(pack.wonders[(wondersStart + wonderIndex) % pack.wonders.length], name);
        wonderIndex += 1;
        break;
      case "challenge":
        text = `Suddenly, ${fill(pack.challenge, name)}`;
        break;
      case "climax":
        text = `${name} took a deep breath and ${fill(pack.turningPoint, name)}.`;
        break;
      case "resolution":
        text = fill(pack.resolutionScene, name);
        break;
      case "ending":
      default:
        text = `From that day on, ${name} remembered that ${fill(pack.lesson, name)}. The End.`;
        break;
    }
    return {
      pageNumber: idx + 1,
      text,
      illustrationPrompt: text.replace(/^Suddenly, /, "").replace(/ The End\.$/, ""),
    };
  });

  return {
    title: `${name} and the ${theme.titleNoun}`,
    settingDescription: `${theme.promptFragment}, drawn with a warm, consistent color palette and cozy lighting throughout the book`,
    pages,
    mode: "mock",
  };
}
