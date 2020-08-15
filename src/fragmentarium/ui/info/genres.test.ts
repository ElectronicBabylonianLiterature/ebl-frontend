import { flattenTree, Tree } from './genres'

test.each([[{ value: 'ARCHIVAL' }, [['ARCHIVAL']]]])(
  'parse Tree and return Array',
  async (genres: Tree, expected: string[][]) => {
    expect(flattenTree(genres)).toStrictEqual(expected)
  }
)
