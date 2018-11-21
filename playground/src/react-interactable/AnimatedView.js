import React, {Component} from 'react'
import Animated from 'animated/lib/targets/react-dom'

export default function AnimatedView(props){
  // Don't pass responder listeners down AnimatedView
  // is going to be the responder, not Animated.div
  const {
    /* eslint-disable */
    onResponderGrant,
    onResponderMove,
    onResponderRelease,
    onResponderTerminate,
    onResponderTerminationRequest,
    onStartShouldSetResponder,
    /* eslint-enable */
    ...other
  } = props;

  return (
    <Animated.div {...other}>
      { props.children }
    </Animated.div>
  )
}