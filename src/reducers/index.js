import { combineReducers } from "redux";
import applicationStateReducer from "./applicationStateReducer";

export default combineReducers({
    appState: applicationStateReducer,
});