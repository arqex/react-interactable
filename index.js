import { Animated, PanResponder } from 'react-native'
import injectDependencies from './playground/src/lib/InteractableView'

export default {
	View: injectDependencies(Animated, PanResponder)
}