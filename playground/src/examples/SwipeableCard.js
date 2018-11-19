import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import Interactable from 'react-native-interactable';
import Screen from '../Screen'

export default class SwipeableCard extends Component {
  render() {
    let move = Screen.width / 4 * 3
    return (
      <View style={styles.container}>

        <Interactable.View
          key="first"
          horizontalOnly={true}
          snapPoints={[
            {x: move},
            {x: 0, damping: 0.5},
            {x: -move}
          ]}>
          <View style={styles.card} />
        </Interactable.View>

        <Interactable.View
          key="second"
          horizontalOnly={true}
          snapPoints={[
            {x: move},
            {x: 0},
            {x: -move}
          ]}>
          <View style={styles.card} />
        </Interactable.View>

        <Interactable.View
          key="third"
          horizontalOnly={true}
          snapPoints={[
            {x: move},
            {x: 0, damping: 0.8},
            {x: -move}
          ]}>
          <View style={styles.card} />
        </Interactable.View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  card : {
    width: 300,
    height: 180,
    backgroundColor: '#32B76C',
    borderRadius: 8,
    marginVertical: 6
  }
});
