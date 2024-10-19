export const directionAngles = {
  'up': 0,
  'down': 180,
  'left': 225,
  'right': 45,
  'upleft': 0,
  'upright': 45,
  'downleft': 225,
  'downright': 135
};

// TODO implement
export const colorWheel = {
  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x1E90FF,
  yellow: 0xffff00,
  white: 0xffffff,
  black: 0x000000,
  purple: 0x800080,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  orange: 0xffa500,
  gray: 0x808080
};

export const depthMap = {
  iSeeYou: 100,
  foreground: 50,
  base: 0,
  background: -50,
  getBackThere: -100
}

export const headstoneRips = [
  "Here lies a gardener buried with his trusty trowel",
  "The crypt master (looks like the grave may have been tampered already)",
  "Known for rearranging history’s mysteries,\n\n this grave robber swapped the contents of every grave he disturbed.\n\n Expect surprises.",
  "Here lies a man who always wanted to be someone else.\n\n Mission accomplished.",
  "Resting peacefully after a lifetime of complaining about everything.",
  "In memory of someone who never\n\n got to see their favorite TV show’s ending.",
  "Finally found a quiet place away from in-laws and unsolicited advice.",
  "Might be in a better place, but never got to finish the to-do list.",
  "The only person who could never finish a single book.",
  "Gone but not forgotten, except by that\n\n one person who never remembers birthdays.",
  "Here lies a champion of naps and procrastination.",
  "Reserved a spot for eternal peace after a lifetime of chaos.",
  "Completed life’s video game with all achievements unlocked.",
  "Passed away after a long fight with ‘just one more episode’ syndrome.",
  "One less person to argue with over the last slice of pizza.",
  "Loving the silence after a lifetime of ‘What’s for dinner?’",
  "Not even the worms will miss this one.",
  "The only person who could have a \n\nconversation with a lamp and not be judged.",
  ".....",
  "Go Away"
]

export const Items = {
  rock: { img: 'rock', xScale: .05, yScale: .05, type: 'wep', dmg: 2 },
  shovel: { img: 'shovel', xScale: .006857, yScale: .006857, type: 'wep', dmg: 5 },
  torch: { img: 'torch', xScale: .1, yScale: .1, type: 'util', dmg: 0 },
}