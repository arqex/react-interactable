import Animated from 'animated/lib/targets/react-dom'
import PanResponder from 'react-panresponder-web'
import injectDependencies from './InteractableView'
import AnimatedView from './AnimatedView'

// Fake the Animated.View component
Animated.View = AnimatedView

let Interactable = injectDependencies( Animated, PanResponder ) 
export default {View: Interactable}