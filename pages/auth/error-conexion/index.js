import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'primereact/button';
import LayoutOut from '../../../layout/layoutOut';
import routes from '../../../utils/routes';

const ConexionOff = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center" style={{ padding: '1rem' }}>
                <img src={`${contextPath}/layout/images/fundacion.png`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
                        <div className="flex justify-content-center align-items-center bg-pink-500 border-circle" style={{ height: '3.2rem', width: '3.2rem' }}>
                            <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
                        </div>
                        <h1 className="text-900 font-bold text-5xl mb-2">Error de conexión</h1>
                        <div className="text-600 mb-5">Verifica tu conexión a internet o contacta a soporte</div>
                        <Button icon="pi pi-arrow-left" label="Ir al Inicio" className="p-button-text" onClick={() => router.push(routes.inicio)} />
                        <span className="ml-4 flex flex-column">
                            <span className="text-600 lg:text-lg">Intentar nuevamente.</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

ConexionOff.getLayout = function getLayout(page) {
    return (
        <>
            <LayoutOut>Acceso Denegado</LayoutOut>
            {page}
        </>
    );
};
export default ConexionOff;
