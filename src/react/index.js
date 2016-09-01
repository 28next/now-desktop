// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'
import {remote, shell} from 'electron'

// Components
import Title from './components/title'
import Login from './components/login'

// Vectors
import logoSVG from './vectors/logo.svg'
import arrowSVG from './vectors/arrow.svg'

const anchorWelcome = document.querySelector('#mount-welcome > div')
const anchorAbout = document.querySelector('#mount-about > div')

const SliderArrows = React.createClass({
  propTypes: {
    direction: React.PropTypes.string.isRequired,
    className: React.PropTypes.string
  },
  render() {
    return (
      <div {...this.props}>
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
    const input = window.loginInput
    const inputElement = window.loginInputElement
    const video = window.usageVideo

    if (!input || !video) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (inputElement && input) {
      if (index === slideCount - 1) {
        inputElement.focus()
      } else {
        // Reset value of login input
        input.setState(input.getInitialState())
      }
    }

    if (index === 1) {
      video.play()
    } else {
      setTimeout(() => {
        video.pause()
        video.currentTime = 0
      }, 500)
    }
  }
}

const Sections = React.createClass({
  getInitialState() {
    return {
      fading: false,
      loginShown: true
    }
  },
  tokenFromCLI() {
    const path = remote.require('path')
    const os = remote.require('os')
    const fs = remote.require('fs-promise')
    const Config = remote.require('electron-config')

    const root = this

    const filePath = path.join(os.homedir(), '.now.json')
    const loader = fs.readJSON(filePath)

    loader.then(content => {
      const config = new Config()

      config.set('now.user.token', content.token)
      config.set('now.user.email', content.email)

      root.setState({
        loginShown: false
      })
    }).catch(() => {})
  },
  handleRestart() {
    const app = remote.app

    // Restart the application
    app.relaunch()
    app.exit(0)
  },
  render() {
    const videoSettings = {
      width: 560,
      preload: true,
      loop: true,
      src: '../assets/usage.webm',
      ref: c => {
        window.usageVideo = c
      }
    }

    const loginTextRef = element => {
      window.loginText = element
    }

    let loginText = 'To start using the app, simply enter\nyour email address below.'

    if (this.state.loginShown) {
      this.tokenFromCLI()
    } else {
      loginText = `You've already signed in once in the now CLI.\nBecause of this, you've now been logged in automatically.`
    }

    return (
      <Slider {...sliderSettings}>
        <section id="intro">
          <SVGinline svg={logoSVG} width="90px"/>

          <h1>
            <b>now:</b> realtime deployments made easy
          </h1>
        </section>

        <section id="usage">
          <video {...videoSettings}/>
        </section>

        <section id="login">
          <p ref={loginTextRef}>{loginText}</p>
          {this.state.loginShown ? <Login/> : <a href="#" onClick={this.handleRestart}>Get Started</a>}
        </section>
      </Slider>
    )
  }
})

const mainStyles = {
  height: 'inherit'
}

if (anchorWelcome) {
  ReactDOM.render((
    <main style={mainStyles}>
      <Title/>
      <Sections/>
    </main>
  ), anchorWelcome)
}

const AboutContent = React.createClass({
  render() {
    const statusProperties = {
      onClick() {
        const issueURL = 'https://github.com/zeit/now-app/issues'
        shell.openExternal(issueURL)
      }
    }

    return (
      <section id="about">
        <img src="../dist/app.ico"/>
        <h1>Now</h1>

        <h2>{'Version 0.7.1'} (<span {...statusProperties}>latest</span>)</h2>
        <h2>{'Copyright ' + String.fromCharCode(169) + ' 2016 Zeit, Inc.'}</h2>
      </section>
    )
  }
})

if (anchorAbout) {
  ReactDOM.render(<AboutContent/>, anchorAbout)
}
