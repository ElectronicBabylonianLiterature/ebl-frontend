export interface FeatureEvaluationContext {
  readonly featureState?: Readonly<Record<string, unknown>>
  readonly properties?: Readonly<Record<string, unknown>>
}

type Expression = readonly unknown[]

function isExpression(value: unknown): value is Expression {
  return Array.isArray(value) && typeof value[0] === 'string'
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number.NaN
}

/**
 * Evaluates the subset of the MapLibre expression language used by the map
 * paint expressions, so tests can assert rendered values per feature state
 * instead of asserting that an expression merely exists.
 */
export function evaluateExpression(
  expression: unknown,
  context: FeatureEvaluationContext = {},
): unknown {
  if (!isExpression(expression)) return expression

  const [operator, ...args] = expression
  const evaluate = (value: unknown): unknown =>
    evaluateExpression(value, context)

  switch (operator) {
    case 'literal':
      return args[0]
    case 'feature-state':
      return context.featureState?.[String(evaluate(args[0]))]
    case 'get':
      return context.properties?.[String(evaluate(args[0]))]
    case 'has':
      return Object.hasOwn(context.properties ?? {}, String(evaluate(args[0])))
    case 'coalesce':
      return (
        args
          .map(evaluate)
          .find((value) => value !== undefined && value !== null) ?? null
      )
    case 'boolean': {
      const value = evaluate(args[0])
      return typeof value === 'boolean' ? value : evaluate(args[1])
    }
    case '!':
      return !evaluate(args[0])
    case '==':
      return evaluate(args[0]) === evaluate(args[1])
    case '>':
      return asNumber(evaluate(args[0])) > asNumber(evaluate(args[1]))
    case '<':
      return asNumber(evaluate(args[0])) < asNumber(evaluate(args[1]))
    case '+':
      return args.reduce<number>(
        (total, arg) => total + asNumber(evaluate(arg)),
        0,
      )
    case '*':
      return args.reduce<number>(
        (total, arg) => total * asNumber(evaluate(arg)),
        1,
      )
    case 'case':
      return evaluateCase(args, evaluate)
    case 'step':
      return evaluateStep(args, evaluate)
    case 'interpolate':
      return evaluateInterpolate(args, evaluate)
    default:
      throw new Error(`Unsupported map expression operator: ${operator}`)
  }
}

function evaluateCase(
  args: readonly unknown[],
  evaluate: (value: unknown) => unknown,
): unknown {
  for (let index = 0; index + 1 < args.length; index += 2) {
    if (evaluate(args[index]) === true) return evaluate(args[index + 1])
  }
  return evaluate(args[args.length - 1])
}

function evaluateStep(
  args: readonly unknown[],
  evaluate: (value: unknown) => unknown,
): unknown {
  const input = asNumber(evaluate(args[0]))
  let output = evaluate(args[1])

  for (let index = 2; index + 1 < args.length; index += 2) {
    if (input >= asNumber(evaluate(args[index]))) {
      output = evaluate(args[index + 1])
    }
  }

  return output
}

function evaluateInterpolate(
  args: readonly unknown[],
  evaluate: (value: unknown) => unknown,
): unknown {
  const input = asNumber(evaluate(args[1]))
  const stops: { stop: number; output: number }[] = []

  for (let index = 2; index + 1 < args.length; index += 2) {
    stops.push({
      stop: asNumber(evaluate(args[index])),
      output: asNumber(evaluate(args[index + 1])),
    })
  }

  const [first] = stops
  const last = stops[stops.length - 1]
  if (input <= first.stop) return first.output
  if (input >= last.stop) return last.output

  const upperIndex = stops.findIndex((entry) => entry.stop >= input)
  const lower = stops[upperIndex - 1]
  const upper = stops[upperIndex]
  const ratio = (input - lower.stop) / (upper.stop - lower.stop)

  return lower.output + ratio * (upper.output - lower.output)
}

export function evaluatePaint(
  paint: Readonly<Record<string, unknown>> | undefined,
  property: string,
  context: FeatureEvaluationContext = {},
): unknown {
  return evaluateExpression(paint?.[property], context)
}
