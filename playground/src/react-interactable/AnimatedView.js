import React, {Component} from 'react'
import Touchable from './vendor/Touchable'
import Animated from 'animated/lib/targets/react-dom'

export default class AnimatedView extends Component {
	constructor( props ){
		super( props )
		this.state = this.touchableGetInitialState()
	}

	/**
   * `Touchable.Mixin` self callbacks. The mixin will invoke these if they are
   * defined on your component.
   */
  touchableHandlePress(e) {
    this.props.onPress && this.props.onPress(e);
  }

  touchableHandleActivePressIn(e) {
    this.props.onPressIn && this.props.onPressIn(e);
  }

  touchableHandleActivePressOut(e) {
    this.props.onPressOut && this.props.onPressOut(e);
  }

  touchableHandleLongPress(e) {
    this.props.onLongPress && this.props.onLongPress(e);
  }

  touchableGetPressRectOffset() {
    return this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
  }

  touchableGetHitSlop() {
    return this.props.hitSlop;
  }

  touchableGetHighlightDelayMS() {
    return this.props.delayPressIn || 0;
  }

  touchableGetLongPressDelayMS() {
    return this.props.delayLongPress === 0 ? 0 : this.props.delayLongPress || 500;
  }

  touchableGetPressOutDelayMS() {
    return this.props.delayPressOut || 0;
	}

	render() {
    const {
      /* eslint-disable */
      delayLongPress,
      delayPressIn,
      delayPressOut,
      onLongPress,
      onPress,
      onPressIn,
      onPressOut,
      pressRetentionOffset,
      /* eslint-enable */
      ...other
		} = this.props;

		return (
			<Animated.div {...other}
				accessible= { this.props.accessible !== false }
				onKeyDown={this.touchableHandleKeyEvent}
				onKeyUp={this.touchableHandleKeyEvent}
				onResponderGrant={this.touchableHandleResponderGrant}
				onResponderMove={this.touchableHandleResponderMove}
				onResponderRelease={this.touchableHandleResponderRelease}
				onResponderTerminate={this.touchableHandleResponderTerminate}
				onResponderTerminationRequest={this.touchableHandleResponderTerminationRequest}
				onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}>
				{ this.props.children }
			</Animated.div>
		)
		
    return React.cloneElement(this.props.children, {
      ...other,
      accessible: this.props.accessible !== false,
      children,
      onKeyDown: this.touchableHandleKeyEvent,
      onKeyUp: this.touchableHandleKeyEvent,
      onResponderGrant: this.touchableHandleResponderGrant,
      onResponderMove: this.touchableHandleResponderMove,
      onResponderRelease: this.touchableHandleResponderRelease,
      onResponderTerminate: this.touchableHandleResponderTerminate,
      onResponderTerminationRequest: this.touchableHandleResponderTerminationRequest,
      onStartShouldSetResponder: this.touchableHandleStartShouldSetResponder,
      style
    });
  }
}