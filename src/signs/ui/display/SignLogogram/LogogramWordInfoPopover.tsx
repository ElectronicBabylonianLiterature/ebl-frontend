import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import ExternalLink from 'common/ExternalLink'
import React from 'react'

export default function LogogramInfo(schrammLogogram: string): JSX.Element {
  return (
    <Popover
      id={_.uniqueId('LogogramInfo-')}
      title="Logogram Info"
      className={'signDisplay__LogogramInfo'}
    >
      <Popover.Body>
        <MarkdownAndHtmlToHtml
          className="text-center my-1"
          markdownAndHtml={schrammLogogram}
        />
        <div className="text-center mt-3">
          <small>
            From W. Schramm,{' '}
            <em>Akkadische Logogramme. Zweite, revidierte Auflage.&nbsp;</em>
            Göttinger Beiträge zum Alten Orient 5. Göttingen: Universitätsverlag
            Göttingen,
            <sup>2</sup>2010. (CC BY-ND 3.0).
            <br /> <br />
            <ExternalLink
              className="text-dark "
              href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
            >
              <i className="fas fa-external-link-square-alt fa-2x" />
            </ExternalLink>
          </small>
        </div>
      </Popover.Body>
    </Popover>
  )
}
