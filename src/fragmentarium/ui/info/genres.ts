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
          {
            value: 'Receipts',
            nodes: [{ value: 'Income' }],
          },
          {
            value: 'Expenditure',
            nodes: [{ value: 'Messenger Text' }],
          },
        ],
      },
    ],
  },
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
          {
            value: 'Receipts',
            nodes: [{ value: 'Income' }],
          },
          {
            value: 'Expenditure',
            nodes: [{ value: 'Messenger Text' }],
          },
        ],
      },
      {
        value: 'Legal',
        nodes: [
          {
            value: 'Debt Note, Loan',
          },
          { value: 'Decree' },
          {
            value: 'Judicial',
            nodes: [{ value: 'Court Case' }],
          },
          {
            value: 'Sale',
          },
          {
            value: 'Transfer of Properties, Other',
            nodes: [
              { value: 'Inheritance' },
              { value: 'Adoption' },
              { value: 'Dowry' },
              { value: 'Exchange' },
            ],
          },
        ],
      },
    ],
  },
]
