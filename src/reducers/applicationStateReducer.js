const initialState = {
    processingFinished: false,
    processingInitiated: false,
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
            }
        }
        case "PROCESSING_INITIATED": {
            return {
                ...newAppState,
                processingInitiated: true,
            }
        }
        default:
            return newAppState;
    }

};

export default applicationStateReducer;