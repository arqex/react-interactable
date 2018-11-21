// based on https://github.com/facebook/react/pull/4303/files

import normalizeNativeEvent from './normalizeNativeEvent';
import ReactDOMUnstableNativeDependencies from 'react-dom/unstable-native-dependencies';

const { ResponderEventPlugin, ResponderTouchHistoryStore } = ReactDOMUnstableNativeDependencies;

// On older versions of React (< 16.4) we have to inject the dependencies in
// order for the plugin to work properly in the browser. This version still
// uses `top*` strings to identify the internal event names.
// https://github.com/facebook/react/pull/12629
let types = ResponderEventPlugin.eventTypes
if (!types.responderMove.dependencies) {

	const endDependencies = ['topTouchCancel', 'topTouchEnd', 'topMouseUp'];
	const moveDependencies = ['topTouchMove', 'topMouseMove'];
	const startDependencies = ['topTouchStart', 'topMouseDown'];

  /**
   * Setup ResponderEventPlugin dependencies
   */
	types.responderMove.dependencies = moveDependencies;
	types.responderEnd.dependencies = endDependencies;
	types.responderStart.dependencies = startDependencies;
	types.responderRelease.dependencies = endDependencies;
	types.responderTerminationRequest.dependencies = [];
	types.responderGrant.dependencies = [];
	types.responderReject.dependencies = [];
	types.responderTerminate.dependencies = [];
	types.moveShouldSetResponder.dependencies = moveDependencies;
	types.selectionChangeShouldSetResponder.dependencies = ['topSelectionChange'];
	types.scrollShouldSetResponder.dependencies = ['topScroll'];
	types.startShouldSetResponder.dependencies = startDependencies;
}

let lastActiveTouchTimestamp = null;

const originalExtractEvents = ResponderEventPlugin.extractEvents;
ResponderEventPlugin.extractEvents = (topLevelType, targetInst, nativeEvent, nativeEventTarget) => {
	const hasActiveTouches = ResponderTouchHistoryStore.touchHistory.numberActiveTouches > 0;
	const eventType = nativeEvent.type;

	let shouldSkipMouseAfterTouch = false;
	if (eventType.indexOf('touch') > -1) {
		lastActiveTouchTimestamp = Date.now();
	} else if (lastActiveTouchTimestamp && eventType.indexOf('mouse') > -1) {
		const now = Date.now();
		shouldSkipMouseAfterTouch = now - lastActiveTouchTimestamp < 250;
	}

	if (
		// Filter out mousemove and mouseup events when a touch hasn't started yet
		((eventType === 'mousemove' || eventType === 'mouseup') && !hasActiveTouches) ||
		// Filter out events from wheel/middle and right click.
		(nativeEvent.button === 1 || nativeEvent.button === 2) ||
		// Filter out mouse events that browsers dispatch immediately after touch events end
		// Prevents the REP from calling handlers twice for touch interactions.
		// See #802 and #932.
		shouldSkipMouseAfterTouch
	) {
		return;
	}

	const normalizedEvent = normalizeNativeEvent(nativeEvent);

	return originalExtractEvents.call(
		ResponderEventPlugin,
		topLevelType,
		targetInst,
		normalizedEvent,
		nativeEventTarget
	);
};

export default ResponderEventPlugin;