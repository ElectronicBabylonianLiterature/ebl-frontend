function containsUnsafeCharacter(url: string): boolean {
  return Array.from(url).some((character) => {
    const code = character.charCodeAt(0)
    return character === '\\' || code <= 32 || code === 127
  })
}

export default function isAllowedMarkupUrl(url: string): boolean {
  if (!url || containsUnsafeCharacter(url) || url.startsWith('//')) return false
  try {
    const parsed = new URL(url, window.location.href)
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(url)
    return hasScheme
      ? ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
      : parsed.origin === window.location.origin
  } catch {
    return false
  }
}
