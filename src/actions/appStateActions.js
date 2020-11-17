
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