// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'
import {remote} from 'electron'
import ms from 'ms'

// Components
import Title from './components/title'
import Login from './components/login'

// Styles
import sliderStyles from './styles/slider'
import introStyles from './styles/intro'
import loginStyles from './styles/login'

// Vectors
import logoSVG from './vectors/logo.svg'
import arrowSVG from './vectors/arrow.svg'

const anchor = document.getElementById('anchor')

const SliderArrows = React.createClass({
  propTypes: {
    direction: React.PropTypes.string.isRequired
  },
  render() {
    let styles = sliderStyles.arrow.all
    const direction = this.props.direction

    if (direction) {
      styles = Object.assign({}, styles, sliderStyles.arrow[direction])
    }

    return (
      <div {...this.props} style={styles}>
        <SVGinline svg={arrowSVG} width="20px"/>
      </div>
    )
  }
})

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  draggable: false,
  nextArrow: <SliderArrows direction="next"/>,
  prevArrow: <SliderArrows direction="prev"/>,
  afterChange(index) {
    const loginInput = window.loginInput

    if (!loginInput) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (index === slideCount - 1) {
      loginInput.focus()
    } else {
      loginInput.blur()
    }
  }
}

const Sections = React.createClass({
  getInitialState() {
    return {
      fading: false
    }
  },
  setRef(item) {
    this.intro = item
  },
  render() {
    const root = this
    const currentWindow = remote.getCurrentWindow()

    currentWindow.on('show', () => {
      root.intro.style.animation = 'fadeIn 2s'

      setTimeout(() => {
        root.intro.style.opacity = 1
      }, ms('2s'))
    })

    return (
      <Slider {...sliderSettings}>
        <section id="intro" style={sliderStyles.section} ref={this.setRef}>
          <SVGinline svg={logoSVG} width="90px"/>

          <h1 style={introStyles.heading}>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="login" style={sliderStyles.section}>
          <p style={loginStyles.text}>To start using the app, simply enter your email address below.</p>
          <Login/>
        </section>
      </Slider>
    )
  }
})

const mainStyles = {
  height: 'inherit'
}

ReactDOM.render((
  <main style={mainStyles}>
    <Title/>
    <Sections/>
  </main>
), anchor)
