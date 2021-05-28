import { Button, Overlay, Popover } from 'react-bootstrap'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import stringify from 'rehype-stringify'
import raw from 'rehype-raw'

export default function MesZL({
  mesZl,
  mesZlNumber,
}: {
  mesZl: string
  mesZlNumber: string | undefined
}): JSX.Element | null {
  const [mesZlHead, setMesZlHead] = useState<string | null>(null)
  const [mesZlBody, setMesZlBody] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const target = useRef(null)

  const mesZlLines = mesZl.split('\n')
  const mesZlRest = mesZlLines.slice()
  mesZlRest.shift()
  const mesZlFormatted = mesZlRest
    .join('\n\n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')

  const formattedNumber = mesZlNumber ? ` ${mesZlNumber}` : ''
  console.log(mesZlLines[0])
  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(stringify)
      .process(mesZlFormatted, function (err, file) {
        if (err) throw err
        setMesZlBody(subSup(String(file)))
      })

    unified()
      .use(remarkParse)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(stringify)
      .process(mesZlLines[0], function (err, file) {
        if (err) throw err
        setMesZlHead(
          subSup(
            String(file).replaceAll(
              /\s/g,
              '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
            )
          )
        )
      })
  }, [mesZlFormatted, mesZlLines])

  const subSup = (mesZL) =>
    mesZL
      .replaceAll(/\^([^\^]*)\^/g, '<sup>$1</sup>')
      .replaceAll(/~([^~]*)~/g, '<sub>$1</sub>')

  if (mesZlHead && mesZlBody) {
    return (
      <>
        <Button
          variant="outline-dark"
          size="sm"
          ref={target}
          onClick={() => setShow(!show)}
        >
          <span className="ReferenceList__citation">
            MesZL{formattedNumber}
          </span>
        </Button>
        <Overlay
          flip={true}
          target={target.current}
          show={show}
          placement={'auto'}
        >
          {(props) => (
            <Popover
              id={_.uniqueId('Citation-')}
              className="ReferenceList__popover MesZL--popover"
              {...props}
            >
              <Popover.Content>
                <div
                  className="text-center"
                  dangerouslySetInnerHTML={{ __html: mesZlHead as string }}
                />
                <hr />
                <div
                  dangerouslySetInnerHTML={{ __html: mesZlBody as string }}
                />
                <div className="text-center border border-dark mt-2">
                  <strong>From</strong>
                  <br />
                  R. Borger,{' '}
                  <em>
                    Mesopotamisches Zeichenlexikon, Zweite revidierte und
                    aktualisiert Auflage
                  </em>
                  . Alter Orient und Altes Testament 305. Münster: Ugarit
                  Verlag, second Edition, 2010; Kapitel &#8546;
                  <br />
                  <strong>By permission by Ugarit-Verlag.</strong>
                  <br />
                  <ExternalLink
                    className="text-dark "
                    href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
                  >
                    <i className="pointer__hover my-2 fas fa-shopping-cart fa-2x" />
                  </ExternalLink>
                </div>
              </Popover.Content>
            </Popover>
          )}
        </Overlay>
      </>
    )
  } else {
    return null
  }
}
