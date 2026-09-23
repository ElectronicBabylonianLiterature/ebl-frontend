export default async function mapSeries<Item, Result>(
  items: readonly Item[],
  mapper: (item: Item) => Result | Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = []
  for (const item of items) {
    results.push(await mapper(item))
  }
  return results
}
