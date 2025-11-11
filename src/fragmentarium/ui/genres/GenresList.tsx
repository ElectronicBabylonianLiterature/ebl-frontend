import React, { useEffect, useState } from 'react'
import {
  Alert,
  Spinner,
  Accordion,
  Card,
  Badge,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Link } from 'react-router-dom'
import './GenresList.sass'

interface GenresListProps {
  fragmentService: FragmentService
}

interface GenreNode {
  name: string
  level: number
  children: GenreNode[]
  path: string[]
  count?: number
}

interface GenreStatistics {
  [key: string]: number
}

function buildGenreTree(
  genres: string[][],
  statistics: GenreStatistics
): GenreNode[] {
  const root: GenreNode[] = []
  const nodeMap = new Map<string, GenreNode>()

  genres.forEach((genrePath) => {
    let pathKey = ''
    const fullPath: string[] = []

    genrePath.forEach((name, index) => {
      const parentKey = pathKey
      pathKey = pathKey ? `${pathKey}/${name}` : name
      fullPath.push(name)

      if (!nodeMap.has(pathKey)) {
        const statsKey = JSON.stringify(fullPath)
        const node: GenreNode = {
          name,
          level: index,
          children: [],
          path: [...fullPath],
          count: statistics[statsKey] || 0,
        }
        nodeMap.set(pathKey, node)

        if (parentKey) {
          const parent = nodeMap.get(parentKey)!
          parent.children.push(node)
        } else {
          root.push(node)
        }
      }
    })
  })

  return root
}

function buildHierarchyPath(
  nodes: GenreNode[],
  targetNode: GenreNode,
  currentPath: string[] = []
): string[] | null {
  for (const node of nodes) {
    const newPath = [...currentPath, node.name]
    if (node === targetNode) {
      return newPath
    }
    if (node.children.length > 0) {
      const found = buildHierarchyPath(node.children, targetNode, newPath)
      if (found) return found
    }
  }
  return null
}

function renderSubGenres(
  nodes: GenreNode[],
  level: number,
  parentIndex: string,
  topLevelNodes: GenreNode[]
): JSX.Element {
  return (
    <>
      {nodes.map((node, index) => {
        const hasChildren = node.children.length > 0
        const indent = (level - 1) * 1.5
        const itemKey = `${parentIndex}-${index}`
        const hierarchyPath = buildHierarchyPath(topLevelNodes, node)
        const searchUrl = `/library/search/?genre=${encodeURIComponent(
          node.path.join(':')
        )}`

        const popover = (
          <Popover id={`popover-${itemKey}`}>
            <Popover.Title>Genre Hierarchy</Popover.Title>
            <Popover.Content>
              <strong>{hierarchyPath?.join(' > ')}</strong>
            </Popover.Content>
          </Popover>
        )

        return (
          <div key={itemKey}>
            <OverlayTrigger
              trigger={['hover', 'focus']}
              placement="top"
              overlay={popover}
            >
              <div
                className={`genre-subitem genre-level-${level}`}
                style={{ paddingLeft: `${indent}rem` }}
              >
                <Link to={searchUrl} className="genre-link">
                  <span className="genre-name">{node.name}</span>
                </Link>
                {node.count !== undefined && node.count > 0 && (
                  <Badge variant="info" className="genre-count ml-2">
                    {node.count}
                  </Badge>
                )}
              </div>
            </OverlayTrigger>
            {hasChildren &&
              renderSubGenres(node.children, level + 1, itemKey, topLevelNodes)}
          </div>
        )
      })}
    </>
  )
}

export default function GenresList({
  fragmentService,
}: GenresListProps): JSX.Element {
  const [genres, setGenres] = useState<string[][] | null>(null)
  const [statistics, setStatistics] = useState<GenreStatistics>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fragmentService.fetchGenres(),
      fragmentService.fetchGenreStatistics(),
    ])
      .then(([genresData, statsData]) => {
        setGenres(genresData)
        setStatistics(statsData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load genres')
        setLoading(false)
      })
  }, [fragmentService])

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading genres...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error loading genres</Alert.Heading>
        <p>{error}</p>
      </Alert>
    )
  }

  if (!genres || genres.length === 0) {
    return (
      <Alert variant="info">
        <p>No genres available.</p>
      </Alert>
    )
  }

  const genreTree = buildGenreTree(genres, statistics)

  return (
    <div className="genres-list">
      <div className="genres-intro">
        <h4>Genre Classification System</h4>
        <p>
          This hierarchical structure represents the genre taxonomy used in the
          Electronic Babylonian Library for categorizing texts and fragments.
          Click on any genre to search for items in that category.
        </p>
      </div>

      <Accordion defaultActiveKey="0">
        {genreTree.map((node, index) => {
          const searchUrl = `/library/search/?genre=${encodeURIComponent(
            node.path.join(':')
          )}`
          return (
            <Card key={index} className="genre-accordion-card">
              <Accordion.Toggle
                as={Card.Header}
                eventKey={String(index)}
                className="genre-accordion-header"
              >
                <div className="genre-header-content">
                  <Link to={searchUrl} className="genre-category-link">
                    <span className="genre-category-name">{node.name}</span>
                  </Link>
                  <div className="genre-badges">
                    {node.children.length > 0 && (
                      <Badge variant="secondary" className="mr-2">
                        {node.children.length} subcategories
                      </Badge>
                    )}
                    {node.count !== undefined && node.count > 0 && (
                      <Badge variant="info">{node.count} items</Badge>
                    )}
                  </div>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={String(index)}>
                <Card.Body className="genre-accordion-body">
                  {node.children.length > 0 ? (
                    renderSubGenres(node.children, 1, String(index), genreTree)
                  ) : (
                    <div className="text-muted">No subcategories</div>
                  )}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          )
        })}
      </Accordion>
    </div>
  )
}
