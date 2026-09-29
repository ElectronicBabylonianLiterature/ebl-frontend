import React from 'react'
import AvHLogo from 'AvH_Logo.svg'
import LRZLogoBlue from 'lrz_wortbild_d_blau-230.png'

export default function Hero(): JSX.Element {
  return (
    <div className="hero">
      <img
        className="hero__background-image"
        src="/hero_section_img.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="hero__content">
        <div className="hero__badge">EXPLORE ANCIENT MESOPOTAMIA</div>
        <h1 className="hero__title">
          Electronic <br />
          Babylonian Library
        </h1>
        <p className="hero__subtitle">
          Advancing the publication and reconstruction of cuneiform tablets
          worldwide
        </p>
        <div className="hero__partners" aria-label="Project supporters">
          <p className="hero__partners-label">Supported by</p>
          <div className="hero__logos">
            <a
              href="https://www.lrz.de/index.html"
              className="hero__logo-link"
              title="Leibniz-Rechenzentrum"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--lrz"
                src={LRZLogoBlue}
                alt="Leibniz-Rechenzentrum"
              />
            </a>
            <a
              href="https://www.humboldt-foundation.de/"
              className="hero__logo-link"
              title="Humboldt Foundation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--humboldt"
                src={AvHLogo}
                alt="Alexander von Humboldt Stiftung"
              />
            </a>
            <a
              href="https://erc.europa.eu/homepage"
              className="hero__logo-link"
              title="European Research Council"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="hero__logo hero__logo--erc"
                src="/LOGO_ERC-FLAG_EU TRANSPARENT.png"
                alt="European Research Council"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
