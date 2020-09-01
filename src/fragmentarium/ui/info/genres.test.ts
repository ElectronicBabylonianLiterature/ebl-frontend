import { flattenTree, parseGenreTrees, Tree } from './genres'

test.each([
  [{ value: 'ARCHIVAL' }, [['ARCHIVAL']]],
  [
    {
      value: 'ARCHIVAL',
      nodes: [
        {
          value: 'Administrative',
          nodes: [
            {
              value: 'Lists',
              nodes: [{ value: 'One Entry' }, { value: 'Multientry' }],
            },
          ],
        },
        {
          value: 'Legal',
          nodes: [
            {
              value: 'Court',
            },
          ],
        },
      ],
    },
    [
      ['ARCHIVAL'],
      ['ARCHIVAL', 'Administrative'],
      ['ARCHIVAL', 'Administrative', 'Lists'],
      ['ARCHIVAL', 'Administrative', 'Lists', 'One Entry'],
      ['ARCHIVAL', 'Administrative', 'Lists', 'Multientry'],
      ['ARCHIVAL', 'Legal'],
      ['ARCHIVAL', 'Legal', 'Court'],
    ],
  ],
])(
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
  [
    [
      {
        value: 'ARCHIVAL',
        nodes: [
          {
            value: 'Administrative',
            nodes: [
              {
                value: 'Lists',
                nodes: [{ value: 'One Entry' }, { value: 'Multientry' }],
              },
            ],
          },
        ],
      },
      {
        value: 'ARCHIVAL_',
        nodes: [
          {
            value: 'Administrative_',
            nodes: [
              {
                value: 'Lists_',
                nodes: [{ value: 'One Entry_' }, { value: 'Multientry_' }],
              },
            ],
          },
        ],
      },
    ],
    [
      ['ARCHIVAL'],
      ['ARCHIVAL', 'Administrative'],
      ['ARCHIVAL', 'Administrative', 'Lists'],
      ['ARCHIVAL', 'Administrative', 'Lists', 'One Entry'],
      ['ARCHIVAL', 'Administrative', 'Lists', 'Multientry'],
      ['ARCHIVAL_'],
      ['ARCHIVAL_', 'Administrative_'],
      ['ARCHIVAL_', 'Administrative_', 'Lists_'],
      ['ARCHIVAL_', 'Administrative_', 'Lists_', 'One Entry_'],
      ['ARCHIVAL_', 'Administrative_', 'Lists_', 'Multientry_'],
    ],
  ],
])(
  'parse array of trees and return merged array',
  async (genres: Tree[], expected: string[][]) => {
    expect(parseGenreTrees(genres)).toStrictEqual(expected)
  }
)
