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
          .replace(/"/g, "'")
          .replace(/,/g, ', ')
        const node: GenreNode = {
          name,
          level: index,
          children: [],
          path: [...fullPath],
          count: statistics[statsKey] || 0,
        }
        nodeMap.set(pathKey, node)

        if (parentKey) {
          const parent = nodeMap.get(parentKey)
          if (parent) {
            parent.children.push(node)
          }
        } else {
          root.push(node)
        }
      }
    })
  })

  return root
}

function renderSubGenres(
  nodes: GenreNode[],
  level: number,
  parentIndex: string
): JSX.Element {
  return (
    <>
      {nodes.map((node, index) => {
        const indent = (level - 1) * 1.5
        const itemKey = `${parentIndex}-${index}`
        const searchUrl = `/library/search/?genre=${encodeURIComponent(
          node.path.join(':')
        )}`

        const popover = (
          <Popover id={`popover-${itemKey}`}>
            <Popover.Content>{node.path.join(' > ')}</Popover.Content>
          </Popover>
        )

        return (
          <div key={itemKey}>
            <div
              className={`genre-subitem genre-level-${level}`}
              style={{ paddingLeft: `${indent}rem` }}
            >
              <div className="genre-name-wrapper">
                <OverlayTrigger
                  trigger={['hover', 'focus']}
                  placement="right"
                  overlay={popover}
                >
                  <span className="genre-name">{node.name}</span>
                </OverlayTrigger>
                {node.count !== undefined && node.count > 0 && (
                  <Badge variant="info" className="genre-count ml-2">
                    {node.count}
                  </Badge>
                )}
                <a
                  href={searchUrl}
                  className="genre-link-icon ml-2"
                  aria-label={`Search for ${node.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt" />
                </a>
              </div>
            </div>
            {node.children.length > 0 &&
              renderSubGenres(node.children, level + 1, itemKey)}
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
    return <Alert variant="danger">{error}</Alert>
  }

  if (!genres || genres.length === 0) {
    return <Alert variant="info">No genres available.</Alert>
  }

  const genreTree = buildGenreTree(genres, statistics)

  return (
    <div className="genres-list">
      <div className="genres-intro">
        <h4>Genre Classification System</h4>
        <p>
          Hierarchical genre taxonomy for categorizing texts and fragments.
          Click the link icon to search.
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
                  <div className="genre-category-title">
                    <span className="genre-category-name">{node.name}</span>
                    <a
                      href={searchUrl}
                      className="genre-link-icon ml-2"
                      aria-label={`Search for ${node.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-external-link-alt" />
                    </a>
                  </div>
                  {node.count !== undefined && node.count > 0 && (
                    <Badge variant="info">{node.count} items</Badge>
                  )}
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={String(index)}>
                <Card.Body className="genre-accordion-body">
                  {node.children.length > 0 ? (
                    renderSubGenres(node.children, 1, String(index))
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
