import React from 'react';
import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { thunk } from "redux-thunk";
import { Provider } from "react-redux";
import reducers from "./reducers";
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import 'semantic-ui-css/semantic.min.css';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsExports);

const store = createStore(
    reducers, applyMiddleware(thunk)
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Provider store={store}>
            <App />
    </Provider>
);
