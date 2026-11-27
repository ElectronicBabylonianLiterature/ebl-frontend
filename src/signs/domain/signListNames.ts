const displayNames: Readonly<Record<string, string>> = {
  MZL: 'MesZL',
  OBZL: 'aBZL',
  SLLHA: 'ŠL/MÉA',
}

export function getDisplayName(signListName: string): string {
  return displayNames[signListName] || signListName
}
