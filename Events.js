function createEventType( type ){
	return class RNIWEvent {
		getEventName(){
			return type;
		}
	}
}

export {

}