const initialState = {
    processingFinished: false,
    processingInitiated: false,
    status: {},
    currentFileKey: null,
}


const applicationStateReducer = (appState = initialState, action) => {

    let newAppState = appState;

    switch(action.type) {
        case "PROCESSING_FINISHED": {
            return {
                ...newAppState,
                processingFinished: true,
                processingInitiated: false,
            };
        }
        case "CLEAR_PROCESSING_STATE": {
            return {
                ...newAppState,
                processingFinished: false,
                status: {},
                currentFileKey: null,
            }
        }
        case "PROCESSING_INITIATED": {
            return {
                ...newAppState,
                processingInitiated: true,
            }
        }
        case "FETCH_STATUS_SUCCESS": {
            return {
                ...newAppState,
                status: action.payload,
            }
        }
        case "ADD_PROCESSING_STATUS": {
            return {
                ...newAppState,
                status: action.payload,
                currentFileKey: action.payload.id,
            }
        }
        case "UPDATE_PROCESSING_STATUS": {
            return {
                ...newAppState,
                status: action.payload,
            }
        }
        default:
            return newAppState;
    }

};

export default applicationStateReducer;