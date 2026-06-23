export const NOUN_POS_TAGS = {
  'Agricultural (locus) Name': 'AN',
  'Celestial Name': 'CN',
  'Divine Name': 'DN',
  'Ethnos Name': 'EN',
  'Field Name': 'FN',
  'Geographical Name': 'GN',
  'Line Name (ancestral clan)': 'LN',
  'Month Name': 'MN',
  'Object Name': 'ON',
  'Personal Name': 'PN',
  'Quarter Name (city area)': 'QN',
  'Royal Name': 'RN',
  'Settlement Name': 'SN',
  'Temple Name': 'TN',
  'Watercourse Name': 'WN',
  'Year Name': 'YN',
} as const

export const PROPER_NOUN_POS_VALUES: readonly string[] =
  Object.values(NOUN_POS_TAGS)
