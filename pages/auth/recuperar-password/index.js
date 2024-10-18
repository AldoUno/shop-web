import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { classNames } from 'primereact/utils';
import { ResetPassword } from '../../../utils/service/fetchData';
import LayoutOut from '../../../layout/layoutOut';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import routes from '../../../utils/routes';
import Lottie from "lottie-react";
import validateLottie from "../../../public/lotties/validate/validate.json";
import { validarContrasena } from '../../../utils/validarComplejidadPass';
import { Divider } from 'primereact/divider';

const CambiarPassPage = () => {
    const toast = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': 'filled' }, 'svg__background');
    const {token, email} = router.query

    const [state, setState] = useState({
        email: '',
        token: '',
        password: '',
        password_confirmation: ''
    });

    

    useEffect(() => {

        setState({
            ...state,
            ['email']: email,
            ['token']: token,
        })

    }, [token, email])

    const handleChange = ({ target }) => {
        setState({
            ...state,
            [target.name]: target.value
        });
    };

    const footer = (
        <>
            <Divider />
            <p className="mt-2">Indicaciones</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>Al menos una letra mayúscula</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un caracter especial</li>
                <li>Mínimo de 8 (ocho) caracteres</li>
            </ul>
        </>
    );

    const redirectToLogin = () => {
        setTimeout(() => {
            router.push(routes.login);
        }, 3000);
    }
    const handleSubmit = async (e) => {
        setError('')
        e.preventDefault();

        if(!validarContrasena(state.password)) return setError('La contraseña no es segura, sigue las indicaciones.')
        
        if (state.password !== state.password_confirmation) return setError('Las contraseñas no coinciden')

        setLoading(true);

        const newData = { email: state.email, token: state.token, password: state.password, password_confirmation: state.password_confirmation }

        ResetPassword(newData)
            .then(async response => {
                if (response.ok) {
                    return response.json()
                } else {
                    const { msg } = await response.json()
                    throw new Error(msg)
                }
            })
            .then(async data => {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Serás redirigido al Login para iniciar sesión con tu nueva contraseña', life: 3000 });
                
                redirectToLogin()
            })
            .catch((error) => {
                toast.current.show({ severity: 'warn', summary: '¡Alerta!', detail: error?.message || 'Ocurrió un error al intentar modificar la contraseña. Contacta a soporte.', life: 5000 });
                e.target[0].focus()
            })
            .finally(() => setLoading(false))
    };

    return (
        <>
            <Toast ref={toast} />
            <div className={containerClassName}>
                <div className="flex flex-column align-items-center justify-content-center" style={{margin: '0 1rem'}}>
                    <img src={`${contextPath}/layout/images/logo.png`} alt="Logo Shop" className="mb-5 w-6rem flex-shrink-0" />
                    <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                        <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                            <br />
                            <div className="text-center mb-5 login__lottie__reducir">
                                <Lottie animationData={validateLottie} loop={true} className="col-6 m-auto" style={{ width: '15rem' }} />
                                <div className="text-900 text-3xl font-medium mt-1 mb-3" style={{ marginTop: '-3rem' }}>Cambio de contraseña!</div>
                                <span className="text-600 font-medium">Ingresa los siguientes datos</span>
                            </div>

                            <div>
                                <form onSubmit={handleSubmit}>
                                    <div className="p-fluid formgrid grid">
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                                Nueva Contraseña
                                            </label>
                                            <div className="p-inputgroup">
                                                <span className="p-inputgroup-addon">
                                                    <i className="pi pi-lock"></i>
                                                </span>
                                                <Password
                                                    promptLabel="Ingresa una contraseña"
                                                    weakLabel="La contraseña es débil"
                                                    mediumLabel="La contraseña es poco segura"
                                                    strongLabel="La contraseña es segura"
                                                    inputid="password1"
                                                    name="password"
                                                    defaultValue={state.password}
                                                    onChange={handleChange}
                                                    placeholder="Contraseña"
                                                    toggleMask
                                                    inputClassName="w-full p-3"
                                                    required
                                                    footer={footer}
                                                ></Password>
                                            </div>
                                        </div>
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                                Repetir Contraseña
                                            </label>
                                            <div className="p-inputgroup">
                                                <span className="p-inputgroup-addon">
                                                    <i className="pi pi-lock"></i>
                                                </span>
                                                <Password
                                                    inputid="password_confirmation"
                                                    name="password_confirmation"
                                                    defaultValue={state.password_confirmation}
                                                    onChange={handleChange}
                                                    placeholder="Repetir Contraseña"
                                                    toggleMask
                                                    inputClassName="w-full p-3"
                                                    required
                                                    feedback={false}
                                                ></Password>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex align-items-center justify-content-between mb-3 gap-5">
                                        <div className="d-grid" style={{ color: 'red' }}>
                                            {error}
                                        </div>
                                    </div>
                                    <Button label="Cambiar Contraseña" loading={loading} type="submit" className="w-full p-3 text-xl"></Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

CambiarPassPage.getLayout = function getLayout(page) {
    return (
        <>
            <LayoutOut>Confirmar</LayoutOut>
            {page}
        </>
    );
};

export default CambiarPassPage;



