import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LoginInit } from '../../../utils/service/fetchData';
import LayoutOut from '../../../layout/layoutOut';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import routes from '../../../utils/routes';
import { setCookie } from 'cookies-next';
const LoginPage = () => {
    const dispatch = useDispatch();
    const toast = useRef(null);
    const input = useRef()
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const mensaje = router.query.mensaje || '';
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': 'filled' }, 'svg__background');
    const [state, setState] = useState({  
        email: '',
        password: '',
    });

    useEffect(() => {
    { mensaje && toast.current.show({ severity: 'warn', summary: 'Autenticación', detail: mensaje, life: 5000 }); }
    }, [mensaje])

    const handleChange = ({ target }) => {
    setState({
        ...state,
        [target.name]: target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('')
    
        state.email = e.target[0].value
        state.password = e.target[1].value
    
        if (!state.email || !state.password?.trim()) return setError('Correo y/o contraseña incorrectos')
    
        setLoading(true);
    
        LoginInit(state)
          .then(async response => {
            if (response.status === 200) {
              return response.json()
            } else {
              const { message } = await response.json()
              throw new Error(message)
            }
          })
          .then(data => {
            const permissionsObject = data.user.permissions.reduce((acc, curr) => {
              const [key] = Object.keys(curr);
              acc[key] = curr[key];
              return acc;
            }, {});
    
            if (!permissionsObject.hasOwnProperty('web')) {
              setError("No tienes permisos necesarios!")
              return
            }
    
            dispatch({ type: 'add', payload: { name: data.user.name + ' ' + data.user.surname, rol: data?.user?.rol?.description, permissions: permissionsObject } })
            setCookie('token', data.authorisation.token)
            router.push(routes.inicio);
          })
          .catch((error) => {
            setError(error.message || "Error de conexión. Contacte a soporte!")
            e.target[0].focus()
          })
          .finally(() => setLoading(false))
      };
    
      return (
        <>
          <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center ocupar__width">
              <div className='ocupar_width__hijo' style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                  <div className="text-center">
                    <img src={`${contextPath}/layout/images/logo.png`} className='mb-2' alt="Logo CRM" style={{ marginTop: '-2rem', width: '100%', maxWidth: '150px' }} />
                    <div className="text-900 text-3xl font-medium mb-3">Bienvenido!</div>
                    <span className="text-600 font-medium">Inicia sesión para continuar</span>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                      Email
                    </label>
                    <div className="p-inputgroup mb-5">
                      <span className="p-inputgroup-addon">
                        <i className="pi pi-user"></i>
                    </span>
                    <InputText
                        ref={input}
                        inputid="email"
                        name="email"
                        defaultValue={state.email}
                        className={classNames("w-full md:w-30rem", { 'p-invalid': error === 'El correo no es válida' })}
                        placeholder="Email"
                        style={{ padding: '1rem' }}
                        onChange={handleChange}
                        required
                    />
                    </div>
    

                    <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                  Contraseña
                </label>
                <div className="p-inputgroup mb-3">
                  <span className="p-inputgroup-addon">
                    <i className="pi pi-lock"></i>
                  </span>
                  <Password
                    inputid="password1"
                    name="password"
                    defaultValue={state.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    inputClassName="w-full p-3 md:w-30rem"
                    required
                    feedback={false}
                    toggleMask
                    autoComplete="current-password"
                  ></Password>
                </div>
                <div className="flex align-items-center justify-content-between mb-3 gap-5 mt-4">
                  <div className="d-grid" style={{ color: 'red' }}>
                    {error}
                  </div>

                  <a onClick={() => router.push(routes.recuperarPassword)} className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                    Olvidaste tu contraseña?
                  </a>
                </div>
                <Button label="Iniciar Sesión" loading={loading} type="submit" className="w-full p-3 text-xl"></Button>
              </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <>
            <LayoutOut>Login</LayoutOut>
            {page}
        </>
    );
};

export default LoginPage;



