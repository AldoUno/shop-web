import getConfig from 'next/config';
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { Menu } from 'primereact/menu';
import { Toast } from 'primereact/toast';
import { Logout, Submit } from '../utils/service/fetchData';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { Avatar } from 'primereact/avatar';
import routes from '../utils/routes';
import Progreso from '../utils/ProgressBar'
import { NAME_WEB } from '../utils/environment';
import { deleteCookie } from 'cookies-next';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useDispatch } from 'react-redux';
import { messages } from '../utils/messages';
import Image from 'next/image';

const AppTopbar = forwardRef((props, ref) => {
  const user = useSelector(state => state.usuario)
  const dispatch = useDispatch()
  const { layoutState, onMenuToggle } = useContext(LayoutContext);
  const topbarmenuRef = useRef(null);
  const menubuttonRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);
  const contextPath = getConfig().publicRuntimeConfig.contextPath;
  const menu = useRef(null);
  const router = useRouter();
  const toast = useRef(null);
  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current
  }));

  const cerrarSesion = () => {
    dispatch({ type: 'show' })
    Logout()
      .then(() => {
        deleteCookie('token')
        router.push(routes.login)
      })
      .finally(() => dispatch({ type: 'hide' }))

  };

  const confirm = (position) => {
    confirmDialog({
      message: 'Seguro que quieres cerrar sesión ?',
      header: 'Cerrar Sesión',
      icon: 'pi pi-info-circle',
      position,
      acceptLabel: 'Sí',
      accept: () => cerrarSesion(),
    });
  };

  const goToPerfil = () => {
    router.push(routes.perfil)
  }

  const items = [
    {
      command: e => goToPerfil(),
      template: (item, options) => {
        return (
          <div className='w-full flex align-items-center p-2'>
            <div style={{ minWidth: '30px', maxWidth: '30px', marginRight: '5px' }}>
              <Avatar image={`${contextPath}/layout/images/franz-logo.png`} className="mr-2" shape="circle" style={{ width: '100%' }} />
            </div>
            <div className="flex flex-column align">
              <span className="font-bold">{user.name || "Usuario"}</span>
              <span className="text-sm">{user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1) || "Rol"}</span>
            </div>
          </div>
        );
      },
    },
    { separator: true },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-fw pi-power-off',
      command: () => confirm('top-right')
    }
  ];

  return (
    <>

      <ConfirmDialog />
      <div className="layout-topbar">
        <Progreso />
        <Link href={routes.inicio} className="layout-topbar-logo">
          <img src={`${contextPath}/layout/images/franz-logo.png`} alt="logo" style={{ width: '4.5rem', height: '4.5rem' }} />
          <span>{NAME_WEB}</span>
        </Link>

        <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
          <i className="pi pi-bars" />
        </button>

        {/* ==================================BOTON DE PERFIL PARA MOBILE================================= */}
        <Button data-cy="bar-menu-profile-mobile" icon="pi pi-user" className="p-button-rounded layout-topbar-menu-button" aria-label="Filter" onClick={(e) => menu.current.toggle(e)} />

        <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', 'align-items-center', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
          <Toast ref={toast}></Toast>
          <Menu model={items} popup ref={menu} />
          <Button data-cy="bar-menu-profile" icon="pi pi-user" className="p-button-rounded" aria-label="Filter" onClick={(e) => menu.current.toggle(e)} />
        </div>
      </div>
    </>
  );
});

export default AppTopbar;
