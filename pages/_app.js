import React from 'react';
import { LayoutProvider } from '../layout/context/layoutcontext';
import Layout from '../layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/styles.css'
import '../styles/demo/badges.scss'

import { configureStore, applyMiddleware } from '@reduxjs/toolkit'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux';
import allReducers from '../reducers/allReducers';
import { createWrapper } from 'next-redux-wrapper';

const rootReducer = allReducers
const myStore = configureStore({ reducer: rootReducer }, {}, applyMiddleware(reduxThunk))
const makeStore = () => myStore;
export const wrapper = createWrapper(makeStore);

const MyApp = ({ Component, pageProps }) => {
    const { store, props } = wrapper.useWrappedStore(pageProps);
    if (Component.getLayout) {
        return (
            <Provider store={store}>
                <LayoutProvider>
                    {Component.getLayout(<Component {...pageProps} />)}
                </LayoutProvider>
            </Provider>
        )
    } else {
        return (
            <Provider store={store}>
                <LayoutProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </LayoutProvider>
            </Provider>
        );
    }
}

export default MyApp
