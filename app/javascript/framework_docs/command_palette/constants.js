// Command Palette constants and configuration
export const ANIMATION = {
  DURATION: 200,
  OPEN_DURATION: 300,
  TRANSITION_CLASSES: {
    backdrop: {
      enter: ['opacity-0'],
      leave: ['opacity-0']
    },
    panel: {
      enter: ['opacity-0', 'scale-95'],
      leave: ['opacity-0', 'scale-95']
    }
  }
}

export const SCORING_WEIGHTS = {
  // Exact matches (highest priority)
  exactTitle: 10000,
  exactKey: 9000,
  
  // Prefix matches  
  titleStartsWith: 6000,
  keyStartsWith: 5000,
  titleWordStart: 3500,
  
  // Contains matches
  titleContains: 2500,
  keyContains: 1800,
  descContains: 400,
  
  // Fuzzy matching
  fuzzyTitle: 800,
  fuzzyTitleMultiplier: 5,
  fuzzyDesc: 100,
  fuzzyDescMultiplier: 2,
  fuzzyMatchReward: 2,
  fuzzyGapPenalty: 0.1,
  fuzzyLengthPenalty: 0.01,
  
  // Other
  lengthBonus: 200
}

export const CSS_CLASSES = {
  hidden: 'hidden',
  overflowHidden: 'overflow-hidden',
  selected: 'aria-selected'
}

export const SELECTORS = {
  item: '[data-command-palette-target="item"]',
  sectionHeader: '[data-command-palette-target="sectionHeader"]',
  notHidden: ':not(.hidden)'
}

export const KEYBOARD = {
  shortcuts: {
    toggle: { key: 'k', modifiers: ['metaKey', 'ctrlKey'] },
    escape: { key: 'Escape' }
  },
  navigation: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    enter: 'Enter'
  }
}
