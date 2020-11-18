import { combineReducers } from "redux";
import applicationStateReducer from "./applicationStateReducer";
import notificationReducer from "./notificationReducer";


export default combineReducers({
    appState: applicationStateReducer,
    notifications: notificationReducer,
});