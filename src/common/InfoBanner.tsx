import React from 'react'
import { Link } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import './InfoBanner.sass'

interface InfoBannerProps {
  title: string
  description: string
  learnMorePath: string
}

export default function InfoBanner({
  title,
  description,
  learnMorePath,
}: InfoBannerProps): JSX.Element {
  return (
    <Alert variant="info" className="info-banner">
      <div className="info-banner__content">
        <h5 className="info-banner__title">{title}</h5>
        <p className="info-banner__description">{description}</p>
        <Link to={learnMorePath} className="info-banner__link">
          Learn more →
        </Link>
      </div>
    </Alert>
  )
}
