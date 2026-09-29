import { post, patch, get } from 'aws-amplify/api';

// Name of the REST API as registered in Amplify.configure (see aws-exports.js).
const API_NAME = 'StatusApi';

//================================================---ADD NEW PROCESSING STATUS---====================================================

// Add new processing status
export const addProcessingStatus = (payload) => {
    return async (dispatch) => {
        dispatch({type: "ADD_PROCESSING_STATUS", payload: payload});
        try {
            await post({
                apiName: API_NAME,
                path: '/status',
                options: { body: payload },
            }).response;
        } catch (err) {
            console.log("Error creating new processing status: ", err);
        }
    }
}

//==================================================---UPDATE PROCESSING STATUS---=====================================================

// Update processing status
export const updateProcessingStatus = (payload) => {
    return async (dispatch) => {
        dispatch({type: "UPDATE_PROCESSING_STATUS", payload: payload});
        try {
            const { id, ...body } = payload;
            await patch({
                apiName: API_NAME,
                path: `/status/${encodeURIComponent(id)}`,
                options: { body },
            }).response;
        } catch (err) {
            console.log("Error updating processing status: ", err);
        }
    }
}

//==================================================---FETCH PROCESSING STATUS---=======================================================

// Fetch processing status
export const fetchStatus = (payload) => {
    return async (dispatch) => {
        try {
            const { body } = await get({
                apiName: API_NAME,
                path: `/status/${encodeURIComponent(payload.id)}`,
            }).response;
            const status = await body.json();
            dispatch(fetchStatusSuccess(status));
        } catch (err) {
            console.log("Error fetching status: ", err);
        }
    }
}

// Respond to success condition
export const fetchStatusSuccess = (payload) => {
    return (dispatch) => {
        dispatch({ type: "FETCH_STATUS_SUCCESS", payload});
    }
}

//===================================================---LOCAL STATE ACTIONS---==========================================================

// Sets processingFinished flag
export const processingFinished = () => {
    return {
        type: "PROCESSING_FINISHED",
    }
}

// Sets processingFinished flag
export const clearProcessingState = () => {
    return {
        type: "CLEAR_PROCESSING_STATE",
    }
}

// Sets processingInitiated flag
export const initiateProcessing = () => {
    return {
        type: "PROCESSING_INITIATED",
    }
}

//====================================================================================================================================
