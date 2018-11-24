import React from 'react'
import Animated from 'animated/lib/targets/react-dom'

export default function AnimatedView(props) {
  let style = props.style ? {...props.style} : {};
  if( !style.display ){
    style.display = 'inline-block'
  }

  return (
    <Animated.div {...props} style={style}>
      {props.children}
    </Animated.div>
  )
}