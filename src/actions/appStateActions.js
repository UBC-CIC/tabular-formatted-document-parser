import { API, graphqlOperation } from 'aws-amplify';
import {createStatus, updateStatus} from "../graphql/mutations";
import { getStatus } from '../graphql/queries';



//================================================---ADD NEW PROCESSING STATUS---====================================================

// Add new processing status
export const addProcessingStatus = (payload) => {
    return (dispatch) => {
        dispatch({type: "ADD_PROCESSING_STATUS", payload: payload});
        API.graphql(graphqlOperation(createStatus, {input: payload})).then().catch((err) => {
            console.log("Error creating new processing status: ", err);
        })
    }
}

//==================================================---UPDATE PROCESSING STATUS---=====================================================

// Update processing status
export const updateProcessingStatus = (payload) => {
    return (dispatch) => {
        dispatch({type: "UPDATE_PROCESSING_STATUS", payload: payload});
        API.graphql(graphqlOperation(updateStatus, {input: payload})).then().catch((err) => {
            console.log("Error creating new processing status: ", err);
        })
    }
}

//==================================================---FETCH PROCESSING STATUS---=======================================================

// Fetch processing status
export const fetchStatus = (payload) => {
    return (dispatch) => {
        API.graphql(graphqlOperation(getStatus, {id: payload.id})).then((response) => {
            const status = response.data.getStatus;
            dispatch(fetchStatusSuccess(status));
        }).catch((err) => {
            console.log("Error fetching status: ", err);
        })
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