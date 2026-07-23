export default async function mapSeries<Item, Result>(
  items: readonly Item[],
  mapper: (item: Item, index: number) => Result | Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = []
  for (let index = 0; index < items.length; index += 1) {
    results.push(await mapper(items[index], index))
  }
  return results
}
