import { flattenTree, parseGenreTrees, Tree } from './genres'

test.each([[{ value: 'ARCHIVAL' }, [['ARCHIVAL']]]])(
  'parse tree and return Array',
  async (genres: Tree, expected: string[][]) => {
    expect(flattenTree(genres)).toStrictEqual(expected)
  }
)

test.each([
  [
    [{ value: 'ARCHIVAL_1' }, { value: 'ARCHIVAL_2' }],
    [['ARCHIVAL_1'], ['ARCHIVAL_2']],
  ],
])(
  'parse array of trees and return merged array',
  async (genres: Tree[], expected: string[][]) => {
    expect(parseGenreTrees(genres)).toStrictEqual(expected)
  }
)
