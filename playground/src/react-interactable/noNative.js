import Animated from 'animated/lib/targets/react-dom'
import PanResponder from './vendor/PanResponder'
import injectDependencies from './InteractableView'

// Fake the View component
Animated.View = Animated.div

let Interactable = injectDependencies( Animated, PanResponder ) 
Interactable.View = Interactable
export default Interactable