import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import Interactable from 'react-native-interactable';

let snapPoints = [
  {x: -140, y: -250},
  {x: 140, y: -250},
  {x: -140, y: -120},
  {x: 140, y: -120},
  {x: -140, y: 0},
  {x: 140, y: 0},
  {x: -140, y: 120},
  {x: 140, y: 120},
  {x: -140, y: 250},
  {x: 140, y: 250, tension: 50, damping: 0.9}
]

export default class ChatHeads extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Interactable.View
          snapPoints={ snapPoints }
          initialPosition={{x: -140, y: -250}}>
          <View style={{width: 70, height: 70, backgroundColor: '#EE2C38', borderRadius: 35}} />
        </Interactable.View>
        <View style={styles.phContainer}>
          { this.renderPlaceholders() }
        </View>
      </View>
    );
  }

  renderPlaceholders(){
    return snapPoints.map( (point, i) => (
      <View style={ [styles.placeholder, {transform: [{ translateX: point.x }, {translateY: point.y}]}] }></View>
    ))
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  phContainer: {
    position: 'relative',
    transform: [{translateX: -5}, {translateY: -40}]
  },
  placeholder: {
    position: 'absolute',
    top: 0, left: 0,
    height: 10, width: 10,
    borderRadius: 5,
    borderWidth:2,
    borderColor: '#ccc',
    borderStyle: 'solid'
  }
});
