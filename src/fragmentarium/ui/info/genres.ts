interface Tree {
  value: string
  nodes?: ReadonlyArray<Tree>
}
export const genres: ReadonlyArray<Tree> = [
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
          { value: 'Memos' },
          {
            value: 'Inventories',
            nodes: [{ value: 'Balanced Accounts' }, { value: 'Basket Labels' }],
          },
        ],
      },
    ],
  },
]
