import React from 'react'
import Animated from 'animated/lib/targets/react-dom'

export default function AnimatedView(props) {
  let propStyles = props.style || {}
  let style = { position: 'relative', display: 'flex', ...propStyles}

  return (
    <Animated.div {...props} style={style}>
      {props.children}
    </Animated.div>
  )
}