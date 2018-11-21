
import { injectEventPluginsByName } from 'react-dom/unstable-native-dependencies'
import ResponderEventPlugin from './vendor/ResponderEventPlugin'

import Animated from 'animated/lib/targets/react-dom'
import PanResponder from './vendor/PanResponder'
import injectDependencies from './InteractableView'
import AnimatedView from './AnimatedView'

// Add responder events
injectEventPluginsByName(ResponderEventPlugin)

// Fake the Animated.View component
Animated.View = AnimatedView

let Interactable = injectDependencies( Animated, PanResponder ) 
export default {View: Interactable}