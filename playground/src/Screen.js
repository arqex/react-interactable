import {Dimensions} from 'react-native'

let dim = Dimensions.get('window')

export default {
	width: Math.min( 480, dim.width ),
	height: dim.height
}