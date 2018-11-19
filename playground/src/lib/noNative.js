import { Animated, PanResponder } from 'react-native-web'
import injectDependencies from './InteractableView'

export default {
	View: injectDependencies(Animated, PanResponder)
}