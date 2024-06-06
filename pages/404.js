import React from 'react';
import getConfig from 'next/config';
import Link from 'next/link';
import LayoutOut from '../layout/layoutOut';
import routes from '../utils/routes';

const Custom404 = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    return (
        <>
            <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
                <div className="flex flex-column align-items-center justify-content-center">
                    <img src={`${contextPath}/layout/images/franz-logo.png`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                    <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                        <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
                            <span className="text-blue-500 font-bold text-3xl">404</span>
                            <h1 className="text-900 font-bold text-5xl mb-2">Página no encontrada</h1>
                            <div className="text-600 mb-5">La página que a la que desea acceder no existe</div>
                            <Link href={routes.inicio} className="w-full flex align-items-center py-5 border-300 border-bottom-1">
                                <span className="flex justify-content-center align-items-center bg-cyan-400 border-round" style={{ height: '3.5rem', width: '3.5rem' }}>
                                    <i className="text-50 pi pi-fw pi-table text-2xl"></i>
                                </span>
                                <span className="ml-4 flex flex-column">
                                    <span className="text-900 lg:text-xl font-medium mb-1">Volver</span>
                                    <span className="text-600 lg:text-lg">Puedes volver a la página de inicio.</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

Custom404.getLayout = function getLayout(page) {
    return (
        <>
            <LayoutOut>Error 404</LayoutOut>
            {page}
        </>
    );
};
export default Custom404;
