import { Animated, PanResponder } from 'react-native-web'
import injectDependencies from './playground/src/lib/InteractableView'

export default {
	View: injectDependencies(Animated, PanResponder)
}