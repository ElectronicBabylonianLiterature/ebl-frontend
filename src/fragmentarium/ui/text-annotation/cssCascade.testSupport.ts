import * as path from 'path'
import * as sass from 'sass'

export interface CompiledRule {
  readonly selector: string
  readonly declarations: ReadonlyMap<string, string>
  readonly media: string | null
  readonly order: number
}

export interface ElementQuery {
  readonly classes: readonly string[]
  readonly attributes?: readonly string[]
  readonly states?: readonly string[]
  readonly media?: readonly string[]
  readonly pseudoElement?: 'before' | 'after'
}

type RuleSeed = Omit<CompiledRule, 'order'>

interface MediaSegment {
  readonly condition: string | null
  readonly css: string
}

interface ParsedSelector {
  readonly classes: readonly string[]
  readonly attributes: readonly string[]
  readonly pseudoClasses: readonly string[]
  readonly pseudoElement: string | null
  readonly isMatchable: boolean
}

const repoRoot = path.resolve(__dirname, '../../../..')

const ignore = (): void => undefined
const silentLogger: sass.Logger = { warn: ignore, debug: ignore }

export function compileSass(
  entryRelativePath: string,
): readonly CompiledRule[] {
  const result = sass.compile(path.join(repoRoot, entryRelativePath), {
    loadPaths: [repoRoot, path.join(repoRoot, 'src')],
    style: 'expanded',
    logger: silentLogger,
  })
  return splitMediaSegments(result.css)
    .flatMap((segment) => parseRules(segment.css, segment.condition))
    .map((rule, order) => ({ ...rule, order }))
}

export function compileBundle(
  entryRelativePaths: readonly string[],
): readonly CompiledRule[] {
  return entryRelativePaths
    .flatMap((entryRelativePath) => compileSass(entryRelativePath))
    .map((rule, order) => ({ ...rule, order }))
}

function splitMediaSegments(css: string): readonly MediaSegment[] {
  const segments: MediaSegment[] = []
  const mediaPattern = /@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g
  let match: RegExpExecArray | null
  let plainStart = 0

  while ((match = mediaPattern.exec(css)) !== null) {
    segments.push({ condition: null, css: css.slice(plainStart, match.index) })
    segments.push({ condition: match[1].trim(), css: match[2] })
    plainStart = mediaPattern.lastIndex
  }
  segments.push({ condition: null, css: css.slice(plainStart) })

  return segments
}

function parseRules(css: string, media: string | null): readonly RuleSeed[] {
  const collected: RuleSeed[] = []
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(css)) !== null) {
    const declarations = parseDeclarations(match[2])
    match[1]
      .split(',')
      .map((selector) => selector.trim())
      .filter((selector) => selector.length > 0)
      .forEach((selector) => collected.push({ selector, declarations, media }))
  }

  return collected
}

function parseDeclarations(body: string): ReadonlyMap<string, string> {
  const declarations = new Map<string, string>()
  body
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.includes(':'))
    .forEach((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const value = declaration.slice(separatorIndex + 1).trim()
      declarations.set(property, value)
    })
  return declarations
}

function parseSelector(selector: string): ParsedSelector {
  const isComplex = /[\s>+~]|::?[\w-]+\(/.test(
    selector.replace(/::(before|after)/g, ''),
  )
  const pseudoElementMatch = selector.match(/::(before|after)/)
  const compound = selector.replace(/::(before|after)/g, '')

  return {
    classes: [...compound.matchAll(/\.([\w-]+)/g)].map((entry) => entry[1]),
    attributes: [...compound.matchAll(/\[([^\]]+)\]/g)].map(
      (entry) => entry[1],
    ),
    pseudoClasses: [...compound.matchAll(/(?<!:):([\w-]+)/g)].map(
      (entry) => entry[1],
    ),
    pseudoElement: pseudoElementMatch?.[1] ?? null,
    isMatchable: !isComplex,
  }
}

function includesAll(
  values: readonly string[],
  available: ReadonlySet<string>,
): boolean {
  return values.every((value) => available.has(value))
}

function matchesPseudoElement(
  parsed: ParsedSelector,
  element: ElementQuery,
): boolean {
  return (parsed.pseudoElement ?? null) === (element.pseudoElement ?? null)
}

function matches(parsed: ParsedSelector, element: ElementQuery): boolean {
  const checks: readonly boolean[] = [
    parsed.isMatchable,
    matchesPseudoElement(parsed, element),
    includesAll(parsed.classes, new Set(element.classes)),
    includesAll(parsed.attributes, new Set(element.attributes ?? [])),
    includesAll(parsed.pseudoClasses, new Set(element.states ?? [])),
  ]
  return checks.every((passed) => passed)
}

function specificity(parsed: ParsedSelector): [number, number] {
  const classColumn =
    parsed.classes.length +
    parsed.attributes.length +
    parsed.pseudoClasses.length
  const typeColumn = parsed.pseudoElement ? 1 : 0
  return [classColumn, typeColumn]
}

function isMoreSpecific(
  candidate: [number, number],
  incumbent: [number, number],
): boolean {
  return candidate[0] !== incumbent[0]
    ? candidate[0] > incumbent[0]
    : candidate[1] >= incumbent[1]
}

interface Winner {
  readonly value: string
  readonly specificity: [number, number]
  readonly order: number
}

function beats(candidate: Winner, incumbent: Winner | null): boolean {
  if (incumbent === null) {
    return true
  }
  if (isMoreSpecific(candidate.specificity, incumbent.specificity)) {
    return (
      candidate.specificity[0] !== incumbent.specificity[0] ||
      candidate.specificity[1] !== incumbent.specificity[1] ||
      candidate.order > incumbent.order
    )
  }
  return false
}

function isMediaActive(rule: CompiledRule, element: ElementQuery): boolean {
  return rule.media === null || (element.media ?? []).includes(rule.media)
}

export function resolveWinner(
  rules: readonly CompiledRule[],
  element: ElementQuery,
  property: string,
): string | undefined {
  return rules.reduce<Winner | null>((winner, rule) => {
    const value = rule.declarations.get(property)
    if (value === undefined || !isMediaActive(rule, element)) {
      return winner
    }
    const parsed = parseSelector(rule.selector)
    if (!matches(parsed, element)) {
      return winner
    }
    const candidate: Winner = {
      value,
      specificity: specificity(parsed),
      order: rule.order,
    }
    return beats(candidate, winner) ? candidate : winner
  }, null)?.value
}
