module.exports = {
	input: ['playground/src/react-interactable/native.js', 'playground/src/react-interactable/noNative.js'],
	moduleName: 'Interactable',
	formats: ['umd', 'umd-min'],
	global: {
		react: 'React',
		animated: 'Animated',
		'prop-types': 'PropTypes',
		'react-native': 'ReactNative',
		'react-dom': 'ReactDom',
		'react-dom/unstable-native-dependencies': 'UnstableDependencies',
		'react-panresponder-web': 'PanResponder',
		'animated/lib/targets/react-dom': 'Animated'
	},
	external: ['react-native'],
	banner: { name: '*//* eslint-disable */\n/*!\n * react-interactable' },
	filename: 'interactable.[name][suffix].js'
}