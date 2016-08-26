import React from 'react'

export default React.createClass({
  getInitialState() {
    return {
      value: ''
    }
  },
  handleChange(event) {
    this.setState({
      value: event.target.value
    })
  },
  handleKey(event) {
    if (event.keyCode !== 13) {
      return
    }

    const value = this.state.value

    if (!/^.+@.+\..+$/.test(value)) {
      console.log('Not a valid email')
      return
    }

    console.log(value)
  },
  render() {
    const inputProps = {
      type: 'email',
      value: this.state.value,
      onChange: this.handleChange,
      onKeyDown: this.handleKey,
      placeholder: 'dddd'
    }

    return <input {...inputProps}/>
  }
})
