import { Animated, PanResponder } from 'react-native'
import injectDependencies from './InteractableView'

export default { 
	View: injectDependencies( Animated, PanResponder ) 
}