//https://github.com/Secretmapper/react-image-annotation
/*
The MIT License (MIT)
Copyright (c) 2018-present, Arian Allenson Valdez.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
import React, { Component } from 'react'
import T from 'prop-types'
import styled from 'styled-components'
import compose from 'react-image-annotation/lib/utils/compose'
import isMouseHovering from 'react-image-annotation/lib/utils/isMouseHovering'
import withRelativeMousePos from 'react-image-annotation/lib/utils/withRelativeMousePos'

import defaultProps from 'react-image-annotation/lib/components/defaultProps'
import Overlay from 'react-image-annotation/lib/components/Overlay'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

export { defaultProps }

const Container = styled.div`
  clear: both;
  position: relative;
  width: 100%;
  &:hover ${Overlay} {
    opacity: 1;
  }
  touch-action: ${(props) => (props.allowTouch ? 'pinch-zoom' : 'auto')};
`

const Img = styled.img`
  display: block;
  width: 100%;
`

const Items = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

const Target = Items

export default compose(
  isMouseHovering(),
  withRelativeMousePos()
)(
  class Annotation extends Component {
    static propTypes = {
      innerRef: T.func,
      onMouseUp: T.func,
      onMouseDown: T.func,
      onMouseMove: T.func,
      onClick: T.func,
      children: T.object,

      annotations: T.arrayOf(
        T.shape({
          type: T.string,
        })
      ).isRequired,
      type: T.string,
      selectors: T.arrayOf(
        T.shape({
          TYPE: T.string,
          intersects: T.func.isRequired,
          area: T.func.isRequired,
          methods: T.object.isRequired,
        })
      ).isRequired,

      value: T.shape({
        selection: T.object,
        geometry: T.shape({
          type: T.string.isRequired,
        }),
        data: T.object,
      }),
      onChange: T.func,
      onSubmit: T.func,

      activeAnnotationComparator: T.func,
      activeAnnotations: T.arrayOf(T.any),

      disableAnnotation: T.bool,
      disableSelector: T.bool,
      renderSelector: T.func,
      disableEditor: T.bool,
      renderEditor: T.func,

      renderHighlight: T.func.isRequired,
      renderContent: T.func.isRequired,

      disableOverlay: T.bool,
      renderOverlay: T.func.isRequired,
      allowTouch: T.bool,
    }

    static defaultProps = defaultProps

    targetRef = React.createRef()
    constructor(props) {
      super(props)
      this.verticalRef = React.createRef()
      this.state = { paddingTop: 0 }
    }
    componentDidMount() {
      if (this.props.allowTouch) {
        this.addTargetTouchEventListeners()
      }
      if (this.verticalRef.current) {
        this.verticalRef.current.setAttribute('orient', 'vertical')
      }
    }

    addTargetTouchEventListeners = () => {
      // Safari does not recognize touch-action CSS property,
      // so we need to call preventDefault ourselves to stop touch from scrolling
      // Event handlers must be set via ref to enable e.preventDefault()
      // https://github.com/facebook/react/issues/9809

      this.targetRef.current.ontouchstart = this.onTouchStart
      this.targetRef.current.ontouchend = this.onTouchEnd
      this.targetRef.current.ontouchmove = this.onTargetTouchMove
      this.targetRef.current.ontouchcancel = this.onTargetTouchLeave
    }
    removeTargetTouchEventListeners = () => {
      this.targetRef.current.ontouchstart = undefined
      this.targetRef.current.ontouchend = undefined
      this.targetRef.current.ontouchmove = undefined
      this.targetRef.current.ontouchcancel = undefined
    }

    componentDidUpdate(prevProps) {
      if (this.props.allowTouch !== prevProps.allowTouch) {
        if (this.props.allowTouch) {
          this.addTargetTouchEventListeners()
        } else {
          this.removeTargetTouchEventListeners()
        }
      }
    }

    setInnerRef = (el) => {
      this.container = el
      this.props.relativeMousePos.innerRef(el)
      this.props.innerRef(el)
    }

    getSelectorByType = (type) => {
      return this.props.selectors.find((s) => s.TYPE === type)
    }

    getTopAnnotationAt = (x, y) => {
      const { annotations } = this.props
      const { container, getSelectorByType } = this

      if (!container) return

      const intersections = annotations
        .map((annotation) => {
          const { geometry } = annotation
          const selector = getSelectorByType(geometry.type)

          return selector.intersects({ x, y }, geometry, container)
            ? annotation
            : false
        })
        .filter((a) => !!a)
        .sort((a, b) => {
          const aSelector = getSelectorByType(a.geometry.type)
          const bSelector = getSelectorByType(b.geometry.type)

          return (
            aSelector.area(a.geometry, container) -
            bSelector.area(b.geometry, container)
          )
        })

      return intersections[0]
    }

    onTargetMouseMove = (e) => {
      this.props.relativeMousePos.onMouseMove(e)
      this.onMouseMove(e)
    }
    onTargetTouchMove = (e) => {
      this.props.relativeMousePos.onTouchMove(e)
      this.onTouchMove(e)
    }

    onTargetMouseLeave = (e) => {
      this.props.relativeMousePos.onMouseLeave(e)
    }
    onTargetTouchLeave = (e) => {
      this.props.relativeMousePos.onTouchLeave(e)
    }

    onMouseUp = (e) => this.callSelectorMethod('onMouseUp', e)
    onMouseDown = (e) => this.callSelectorMethod('onMouseDown', e)
    onMouseMove = (e) => {
      this.callSelectorMethod('onMouseMove', e)
    }
    onTouchStart = (e) => this.callSelectorMethod('onTouchStart', e)
    onTouchEnd = (e) => this.callSelectorMethod('onTouchEnd', e)
    onTouchMove = (e) => this.callSelectorMethod('onTouchMove', e)
    onClick = (e) => {
      this.callSelectorMethod('onClick', e)
    }

    onSubmit = () => {
      this.props.onSubmit(this.props.value)
    }

    callSelectorMethod = (methodName, e) => {
      if (this.props.disableAnnotation) {
        return
      }

      if (this.props[methodName]) {
        this.props[methodName](e)
      } else {
        const selector = this.getSelectorByType(this.props.type)
        if (selector && selector.methods[methodName]) {
          const value = selector.methods[methodName](this.props.value, e)

          if (typeof value === 'undefined') {
            if (process.env.NODE_ENV !== 'production') {
              console.error(`
              ${methodName} of selector type ${this.props.type} returned undefined.
              Make sure to explicitly return the previous state
            `)
            }
          } else {
            this.props.onChange(value)
          }
        }
      }
    }

    shouldAnnotationBeActive = (annotation, top) => {
      if (this.props.activeAnnotations) {
        const isActive = !!this.props.activeAnnotations.find((active) =>
          this.props.activeAnnotationComparator(annotation, active)
        )

        return isActive || top === annotation
      } else {
        return top === annotation
      }
    }

    render() {
      const { props } = this
      const {
        isMouseHovering,

        renderHighlight,
        renderContent,
        renderSelector,
        renderEditor,
        renderOverlay,
        allowTouch,
      } = props

      const topAnnotationAtMouse = this.getTopAnnotationAt(
        this.props.relativeMousePos.x,
        this.props.relativeMousePos.y
      )
      return (
        <Row>
          <Col xs={5}>
            {!props.disableEditor &&
              renderEditor({
                annotation: props.value,
                onChange: props.onChange,
                onSubmit: this.onSubmit,
              })}
          </Col>
          <Col xs={1} className={'mt-5 ml-0 mr-0 pl-1 pr-0'}>
            <input
              type="range"
              ref={this.verticalRef}
              className="h-75 ml-0 mr-0 pl-0 pr-0"
              defaultValue={100}
              onInput={(event) =>
                event.target &&
                this.setState({ paddingTop: (100 - event.target.value) * 10 })
              }
            />
          </Col>
          <Col
            xs={6}
            className="pl-0"
            style={{
              paddingTop: `${this.state.paddingTop}px`,
              marginLeft: '-100px',
            }}
          >
            <TransformWrapper panning={{ activationKeys: ['Shift'] }}>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <React.Fragment>
                  <Row className={'my-3'}>
                    <Col xs={'auto'}>
                      <ButtonGroup>
                        <Button variant="outline-dark" onClick={() => zoomIn()}>
                          Zoom In +
                        </Button>
                        <Button
                          variant="outline-dark"
                          onClick={() => zoomOut()}
                        >
                          Zoom Out -
                        </Button>
                        <Button
                          variant="outline-dark"
                          onClick={() => resetTransform()}
                        >
                          Reset
                        </Button>
                      </ButtonGroup>
                    </Col>
                    <Col className={'text-center my-auto'}>
                      Zoom with Mouse wheel. Pan while holding shift
                    </Col>
                  </Row>
                  <TransformComponent>
                    <Container
                      style={props.style}
                      innerRef={isMouseHovering.innerRef}
                      onMouseLeave={this.onTargetMouseLeave}
                      onTouchCancel={this.onTargetTouchLeave}
                      allowTouch={allowTouch}
                    >
                      <Img
                        className={props.className}
                        style={props.style}
                        alt={props.alt}
                        src={props.src}
                        draggable={false}
                        innerRef={this.setInnerRef}
                      />
                      <Items>
                        {props.annotations.map((annotation) =>
                          renderHighlight({
                            key: annotation.data.id,
                            annotation,
                            active: this.shouldAnnotationBeActive(
                              annotation,
                              topAnnotationAtMouse
                            ),
                          })
                        )}
                        {!props.disableSelector &&
                          props.value &&
                          props.value.geometry &&
                          renderSelector({
                            annotation: props.value,
                          })}
                      </Items>
                      <Target
                        data-testid={'annotation__target'}
                        innerRef={this.targetRef}
                        onClick={this.onClick}
                        onMouseUp={this.onMouseUp}
                        onMouseDown={this.onMouseDown}
                        onMouseMove={this.onTargetMouseMove}
                      />
                      {!props.disableOverlay &&
                        renderOverlay({
                          type: props.type,
                          annotation: props.value,
                        })}
                      {props.annotations.map(
                        (annotation) =>
                          this.shouldAnnotationBeActive(
                            annotation,
                            topAnnotationAtMouse
                          ) &&
                          renderContent({
                            key: annotation.data.id,
                            annotation: annotation,
                          })
                      )}
                      <div>{props.children}</div>
                    </Container>
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
          </Col>
        </Row>
      )
    }
  }
)
