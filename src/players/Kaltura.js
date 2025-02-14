import React, { Component } from 'react'

import { canPlay } from '../patterns'
import { callPlayer, getSDK } from '../utils'

const SDK_URL = './js/kaltura.js'
const SDK_GLOBAL = 'playerjs'

export default class Kaltura extends Component {
  static displayName = 'Kaltura'
  static canPlay = canPlay.kaltura
  callPlayer = callPlayer
  duration = null
  currentTime = null
  secondsLoaded = null

  componentDidMount () {
    this.props.onMount && this.props.onMount(this)
  }

  load (url) {
    getSDK(SDK_URL, SDK_GLOBAL).then(playerjs => {
      if (!this.iframe) return
      this.player = new playerjs.Player(this.iframe)
      this.player.on('ready', () => {
        // An arbitrary timeout is required otherwise
        // the event listeners won’t work
        setTimeout(() => {
          this.player.isReady = true
          this.player.setLoop(this.props.loop)
          if (this.props.muted) {
            this.player.mute()
          }
          this.addListeners(this.player, this.props)
          this.props.onReady()
        }, 500)
      })
    }, this.props.onError)
  }

  addListeners (player, props) {
    player.on('play', props.onPlay)
    player.on('pause', props.onPause)
    player.on('ended', props.onEnded)
    player.on('error', props.onError)
    player.on('timeupdate', ({ duration, seconds }) => {
      this.duration = duration
      this.currentTime = seconds
    })
  }

  play () {
    this.callPlayer('play')
  }

  pause () {
    this.callPlayer('pause')
  }

  stop () {
    // Nothing to do
  }

  seekTo (seconds, keepPlaying = true) {
    this.callPlayer('setCurrentTime', seconds)
    if (!keepPlaying) {
      this.pause()
    }
  }

  setVolume (fraction) {
    this.callPlayer('setVolume', fraction)
  }

  setLoop (loop) {
    this.callPlayer('setLoop', loop)
  }

  mute = () => {
    this.callPlayer('mute')
  }

  unmute = () => {
    this.callPlayer('unmute')
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return this.secondsLoaded
  }

  ref = iframe => {
    this.iframe = iframe
  }

  render () {
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <iframe
        ref={this.ref}
        src={this.props.url}
        frameBorder='0'
        scrolling='no'
        style={style}
        allow='encrypted-media; autoplay; fullscreen;'
        referrerPolicy='no-referrer-when-downgrade'
      />
    )
  }
}
