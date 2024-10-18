import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LoginInit, SendEmailToResetPassword } from '../../../utils/service/fetchData';
import LayoutOut from '../../../layout/layoutOut';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import routes from '../../../utils/routes';
import { isValidEmail } from '../../../utils/isValidEmail';
import { setCookie } from 'cookies-next';
import Lottie from "lottie-react";
import validate from "../../../public/lotties/validate/validate.json";
const RecuperarPassPage = () => {
    const dispatch = useDispatch();
    const toast = useRef(null);
    const input = useRef()
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': 'filled' });
    const [state, setState] = useState({
        email: '',
    });

    useEffect(() => {
        input.current.focus()
    }, [])

    const handleChange = ({ target }) => {
        setState({
            ...state,
            [target.name]: target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!state.email || !isValidEmail(state.email) ) return setError('El email no es válido. ¡Verifícalo!')

        setLoading(true);

        SendEmailToResetPassword(state)
            .then(async response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    const { message } = await response.json()
                    throw new Error(message)
                }
            })
            .then(data => {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Verifica tu bandeja de entrada y sigue los pasos para resetear tu contraseña.', life: 5000 });
                setState({
                  email: ''
                })
            })
            .catch((error) => {
                toast.current.show({ severity: 'warn', summary: 'Error', detail: 'Ocurrió un error al intentar enviar el correo. Contacta a soporte.', life: 5000 });
                e.target[0].focus()
            })
            .finally(() => setLoading(false))
    };

    return (
        <>
            <Toast ref={toast} />
            <div className={containerClassName}>
                <div className="flex flex-column align-items-center justify-content-center" style={{margin: '0 1rem'}}>
                    <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                        <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                            <div className="text-center mb-5" style={{ marginTop: '-5rem'}}>
                                <Lottie animationData={validate} loop={true} className="col-6 m-auto mb-2" style={{ width: '15rem' }} />
                                <div className="text-900 text-3xl font-medium mb-3">Recuperar tu cuenta</div>
                                <span className="text-600 font-medium">Ingresa tu correo electrónico, te enviaremos un enlace para recuperar tu cuenta.</span>
                            </div>

                            <div>
                                <form onSubmit={handleSubmit}>
                                    <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                        Correo
                                    </label>
                                    <div className="p-inputgroup mb-5">
                                        <span className="p-inputgroup-addon">
                                            <i className="pi pi-user"></i>
                                        </span>
                                        <InputText
                                            ref={input}
                                            inputid="email1"
                                            type="email"
                                            name="email"
                                            defaultValue={state.email}
                                            className={classNames("w-full md:w-30rem", { 'p-invalid': error === 'El correo no es válido' })}
                                            placeholder="JuanPerez@crm.com.py"
                                            style={{ padding: '1rem' }}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                        <div className="flex align-items-center">
                                        <div className="d-grid" style={{ color: 'red' }}>
                                            {error}
                                        </div>
                                        </div>
                                        <a onClick={() => router.push(routes.login)} className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                            Iniciar sesión con contraseña
                                        </a>
                                    </div>
                                    <Button label="Enviar correo" loading={loading} type="submit" className="w-full p-3 text-xl"></Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        </>
    );
};

RecuperarPassPage.getLayout = function getLayout(page) {
    return (
        <>
            <LayoutOut>Recuperar Cuenta</LayoutOut>
            {page}
        </>
    );
};

export default RecuperarPassPage;



