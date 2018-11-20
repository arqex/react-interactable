module.exports = {
	input: ['playground/src/react-interactable/native.js', 'playground/src/react-interactable/noNative.js'],
	moduleName: 'Interactable',
	formats: ['umd', 'umd-min'],
	global: {
		react: 'React',
		animated: 'Animated',
		'prop-types': 'PropTypes',
		'react-native': 'ReactNative'
	},
	external: ['react-native'],
	banner: true,
	filename: 'interactable.[name][suffix].js'
}