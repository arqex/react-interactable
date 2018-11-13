import { Animated, PanResponder } from 'react-native'
import injectDependencies from './InteractableView'

export { 
	View: injectDependencies( Animated, PanResponder) 
}