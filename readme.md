# React interactable

This is a port of [react-native-interactable](https://github.com/wix/react-native-interactable) to JS. It allows your UI to react in a physically natural way to user's drag interactions. See it working in the [react-interactable playground](https://react-interactable.netlify.com/) and start playing with it using this [code sandbox](https://codesandbox.io/s/n4kq4ylk6l).

This library is for you if you want to have nice interaction animations in your:
* Multiplatform app using [react-native-web](https://github.com/necolas/react-native-web).
* [Expo app](https://expo.io/) that you don't want to eject.
* React.js webapp, not a native one.

If you are building a well performant android/ios app with react-native, [react-native-interactable](https://github.com/wix/react-native-interactable) is a much better option than this library.

## Install
Just install via npm or yarn

If our project is using react-native-web:
```
npm install --save react-interactable
```

If we are using just plain React:
```
npm install --save react-interactable animated react-panresponder-web
```

## Usage
With an interactable view you can make any component react to dragging events. 

**Using it with react-native-web**
```js
// Import the libraries
import React from 'react'
import Interactable from 'react-interactable'

// ... later, in your render code
return (
	<Interactable.View>
		<Text>I am draggable!</Text>
	</Interactable.View>
)
```

If we want to use `react-native-interactable` for iOS and Android versions and `react-interactable` for the dom seamlessly, we can add an alias to our webpack.config.js and just use `import Interactable from "react-native-interactable"` as we are used to do:
```js
// Inside webpack.config.js
module.exports = {
  //...
  resolve: {
    alias: {
      'react-native-interactable': 'react-interactable'
    }
  }
};
```

**Using it with plain react (react-dom)**
```js
// Import the libraries, pay attention to require the no native version
import React from 'react'
import Interactable from 'react-interactable/noNative'

// ... later, in your render code
return (
	<Interactable.View>I am draggable!</Interactable.View>
)
```

## Options
You can see the options in the [react-native-interactable docs](https://github.com/wix/react-native-interactable#usage).

## Credits
* [Wix](https://wix.com) team for the original [react-native-interactable](https://github.com/wix/react-native-interactable)
* Of course, [Facebook](https://facebook.com) team for its game changing [React](https://reactjs.org/).
* [@souporserious](https://github.com/souporserious) for lending the `react-interactable` npm package :)

---

* [MIT licensed](LICENSE)
* [Changelog here](changelog.md)
