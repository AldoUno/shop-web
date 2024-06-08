import getConfig from 'next/config';
import Head from 'next/head';
import React, { useContext, useEffect, useRef } from 'react';
import PrimeReact from 'primereact/api';

const LayoutOut = ({ children }) => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    PrimeReact.ripple = true;
    const titulo = children + ' | Shop' 
    return (
        <React.Fragment>
            <Head>
                <title>{titulo}</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="initial-scale=1, width=device-width" />
                <link rel="icon" href={`${contextPath}/favicon.png`} type="image/x-icon"></link>
            </Head>
        </React.Fragment>
    );
};

export default LayoutOut;
