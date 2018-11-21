import { Animated, PanResponder } from 'react-native'
import injectDependencies from './InteractableView'

let Interactable = injectDependencies(Animated, PanResponder)
export default { View: Interactable }