import _ from 'lodash'

export interface Tree {
  value: string
  nodes?: ReadonlyArray<Tree>
}
export function flattenTree(genres: Tree) {
  const flattenedTree: string[][] = []
  let stack: string[] = []
  const visited: Set<string> = new Set()
  recursiveDepthSearch(genres)

  function recursiveDepthSearch(tree: Tree) {
    stack.push(tree.value)
    if (!visited.has(genres.value)) {
      recursiveDepthSearchHelper(tree)
    }
  }

  function recursiveDepthSearchHelper(tree: Tree) {
    if (!tree.hasOwnProperty('nodes') && !visited.has(tree.value)) {
      visited.add(tree.value)
      extractPartsOfStack(stack, flattenedTree)
      const branch = stack.slice()
      flattenedTree.push(branch)
      stack = []
      recursiveDepthSearch(genres)
    } else {
      const filteredNodes = tree.nodes!.filter(
        (tree) => !visited.has(tree.value)
      )
      if (filteredNodes.length) {
        stack.push(filteredNodes[0].value)
        recursiveDepthSearchHelper(filteredNodes[0])
      } else {
        visited.add(tree.value)
        stack = []
        recursiveDepthSearch(genres)
      }
    }
  }
  function extractPartsOfStack(stack: string[], flattenedTree: string[][]) {
    stack.forEach((stackElement, i) => {
      const slicedTree = stack.slice(0, i)
      if (
        i !== 0 &&
        flattenedTree.every((element) => !_.isEqual(element, slicedTree))
      ) {
        flattenedTree.push(slicedTree)
      }
    })
  }
  return flattenedTree
}
export function parseGenreTrees(genres: Tree[]) {
  let parsedGenresTrees: string[][] = []
  for (const tree of genres) {
    const flattenedTree = flattenTree(tree)
    parsedGenresTrees = parsedGenresTrees.concat(flattenedTree)
  }
  return parsedGenresTrees
}

export const genres: Array<Tree> = [
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
