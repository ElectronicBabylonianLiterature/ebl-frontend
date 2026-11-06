export interface FeatureEvaluationContext {
  readonly featureState?: Readonly<Record<string, unknown>>
  readonly properties?: Readonly<Record<string, unknown>>
}

type Expression = readonly [string, ...unknown[]]

function isExpression(value: unknown): value is Expression {
  return Array.isArray(value) && typeof value[0] === 'string'
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number.NaN
}
export function evaluateExpression(
  expression: unknown,
  context: FeatureEvaluationContext = {},
): unknown {
  if (!isExpression(expression)) return expression

  const [operator, ...args] = expression
  const evaluate = (value: unknown): unknown =>
    evaluateExpression(value, context)

  const operation = OPERATIONS.get(operator)
  if (!operation)
    throw new Error(`Unsupported map expression operator: ${operator}`)
  return operation(args, evaluate, context)
}

type Evaluate = (value: unknown) => unknown
type Operation = (
  args: readonly unknown[],
  evaluate: Evaluate,
  context: FeatureEvaluationContext,
) => unknown

const OPERATIONS: ReadonlyMap<string, Operation> = new Map<string, Operation>([
  ['literal', (args) => args[0]],
  [
    'feature-state',
    (args, evaluate, context) =>
      context.featureState?.[String(evaluate(args[0]))],
  ],
  [
    'get',
    (args, evaluate, context) =>
      context.properties?.[String(evaluate(args[0]))],
  ],
  [
    'has',
    (args, evaluate, context) =>
      Object.hasOwn(context.properties ?? {}, String(evaluate(args[0]))),
  ],
  [
    'coalesce',
    (args, evaluate) =>
      args
        .map(evaluate)
        .find((value) => value !== undefined && value !== null) ?? null,
  ],
  [
    'boolean',
    (args, evaluate) => {
      const value = evaluate(args[0])
      return typeof value === 'boolean' ? value : evaluate(args[1])
    },
  ],
  ['!', (args, evaluate) => !evaluate(args[0])],
  ['==', (args, evaluate) => evaluate(args[0]) === evaluate(args[1])],
  [
    '>',
    (args, evaluate) =>
      asNumber(evaluate(args[0])) > asNumber(evaluate(args[1])),
  ],
  [
    '<',
    (args, evaluate) =>
      asNumber(evaluate(args[0])) < asNumber(evaluate(args[1])),
  ],
  [
    '+',
    (args, evaluate) =>
      args.reduce<number>((total, arg) => total + asNumber(evaluate(arg)), 0),
  ],
  [
    '*',
    (args, evaluate) =>
      args.reduce<number>((total, arg) => total * asNumber(evaluate(arg)), 1),
  ],
  ['case', evaluateCase],
  ['step', evaluateStep],
  ['interpolate', evaluateInterpolate],
])

function evaluateCase(args: readonly unknown[], evaluate: Evaluate): unknown {
  for (let index = 0; index + 1 < args.length; index += 2) {
    if (evaluate(args[index]) === true) return evaluate(args[index + 1])
  }
  return evaluate(args[args.length - 1])
}

function evaluateStep(args: readonly unknown[], evaluate: Evaluate): unknown {
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
  evaluate: Evaluate,
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
