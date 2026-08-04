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

export const PROVIDERS = {
  UNIFIED: 'unified',
  APPLICATION: 'application',
  FRAMEWORK_DOCS: 'framework-docs'
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
  selected: 'aria-selected',
  
  // Provider indicator states
  providerIndicator: {
    inactive: [
      'text-gray-400',
      'dark:text-gray-500',
      'ring-gray-300',
      'dark:ring-white/20',
      'bg-transparent'
    ],
    active: [
      'text-white',
      'ring-sage-500/50',
      'dark:ring-sage-500/40',
      'bg-sage-600',
      'dark:bg-sage-500'
    ]
  },
  
  // Pill styles
  pill: 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-500 border border-gray-200 dark:border-gray-650',
  
  // Scope header
  scopeHeader: 'mb-2 mt-3 text-xs font-semibold text-gray-900 dark:text-white'
}

export const DATA_ATTRIBUTES = {
  provider: 'provider',
  mountedProvider: 'mountedProvider',
  originProvider: 'originProvider',
  scopeId: 'scopeId',
  scopeLabel: 'scopeLabel',
  deviceId: 'deviceId',
  defaultVisible: 'defaultVisible',
  key: 'key',
  title: 'title',
  description: 'description',
  group: 'group',
  href: 'href'
}

export const SELECTORS = {
  item: '[data-command-palette-target="item"]',
  sectionHeader: '[data-command-palette-target="sectionHeader"]',
  providerTemplate: 'template[data-provider-id]',
  scopeTemplate: 'template[data-scope-id]',
  notHidden: ':not(.hidden)',
  withDataProvider: (providerId) => `[data-mounted-provider="${providerId}"]`,
  deviceLink: '[data-key="devices"] a[href]'
}

export const KEYBOARD = {
  shortcuts: {
    toggle: { key: 'k', modifiers: ['metaKey', 'ctrlKey'] },
    escape: { key: 'Escape' },
    providerSwitch: { key: /^[1-9]$/, modifiers: ['ctrlKey', 'altKey'] },
    providerCycle: { key: 'Tab' }
  },
  navigation: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    enter: 'Enter',
    tab: 'Tab',
    backspace: 'Backspace'
  }
}
