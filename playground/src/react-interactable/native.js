import { Animated, PanResponder } from 'react-native'
import injectDependencies from './InteractableView'

let Interactable = injectDependencies( Animated, PanResponder ) 
Interactable.View = Interactable
export default Interactable