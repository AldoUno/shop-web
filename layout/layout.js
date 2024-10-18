import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEventListener, useMountEffect, useUnmountEffect } from 'primereact/hooks';
import { classNames, DomHandler } from 'primereact/utils';
import React, { useContext, useEffect, useRef, useState } from 'react';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import { LayoutContext } from './context/layoutcontext';
import PrimeReact from 'primereact/api';
import AppConfig from './AppConfig';
import { Toast } from 'primereact/toast';
import { BlockUI } from 'primereact/blockui';
import { useDispatch, useSelector } from 'react-redux';
import routes from '../utils/routes';
import { Refresh } from '../utils/service/fetchData';
import { messages } from '../utils/messages';
import { deleteCookie, setCookie } from 'cookies-next';

const Layout = (props) => {
  const { layoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
  const topbarRef = useRef(null);
  const sidebarRef = useRef(null);
  const contextPath = getConfig().publicRuntimeConfig.contextPath;
  const router = useRouter();
  const toast = useRef(null);
  const [blockUi, setBlockUi] = useState(false)
  const state = useSelector(state => state)
  const dispatch = useDispatch()


  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    dispatch({ type: 'show' });

    Promise.all([
      Refresh(signal),
    ])
      .then(([refreshResponse]) => {
        if (refreshResponse.status !== 200) {
          throw new Error('No se pudieron obtener los datos del usuario. Inténtalo de nuevo.');
        }

        return Promise.all([
          refreshResponse.json(),
        ]);
      })
      .then(([data]) => {
        const permissionsObject = data.user.permissions.reduce((acc, curr) => {
          const [key] = Object.keys(curr);
          acc[key] = curr[key];
          return acc;
        }, {});

        if(!permissionsObject.hasOwnProperty('web')) {
          deleteCookie('token')
          router.push(routes.login)
          return
        }

        dispatch({ type: 'add', payload: { name: data.user.name + ' ' + data.user.surname, rol: data?.user?.rol?.description, permissions: permissionsObject } })
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          toast.current.show(messages.mensajeErrorServer);
        }
      })
      .finally(() => dispatch({ type: 'hide' }));

    return () => controller.abort();
  }, []);


  useEffect(() => {
    if (state.progreso !== '0px') return setBlockUi(true)

    setBlockUi(false)
  }, [state.progreso])


  const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
    type: 'click',
    listener: (event) => {
      const isOutsideClicked = !(sidebarRef.current.isSameNode(event.target) || sidebarRef.current.contains(event.target) || topbarRef.current.menubutton.isSameNode(event.target) || topbarRef.current.menubutton.contains(event.target));

      if (isOutsideClicked) {
        hideMenu();
      }
    }
  });

  const [bindProfileMenuOutsideClickListener, unbindProfileMenuOutsideClickListener] = useEventListener({
    type: 'click',
    listener: (event) => {
      const isOutsideClicked = !(
        topbarRef.current.topbarmenu.isSameNode(event.target) ||
        topbarRef.current.topbarmenu.contains(event.target) ||
        topbarRef.current.topbarmenubutton.isSameNode(event.target) ||
        topbarRef.current.topbarmenubutton.contains(event.target)
      );

      if (isOutsideClicked) {
        hideProfileMenu();
      }
    }
  });

  const hideMenu = () => {
    setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
    unbindMenuOutsideClickListener();
    unblockBodyScroll();
  };

  const hideProfileMenu = () => {
    setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: false }));
    unbindProfileMenuOutsideClickListener();
  };

  const blockBodyScroll = () => {
    DomHandler.addClass('blocked-scroll');
  };

  const unblockBodyScroll = () => {
    DomHandler.removeClass('blocked-scroll');
  };
  PrimeReact.ripple = true;

  useMountEffect(() => {
    PrimeReact.ripple = false;
  })

  useEffect(() => {
    if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
      bindMenuOutsideClickListener();
    }

    layoutState.staticMenuMobileActive && blockBodyScroll();
  }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

  useEffect(() => {
    if (layoutState.profileSidebarVisible) {
      bindProfileMenuOutsideClickListener();
    }
  }, [layoutState.profileSidebarVisible]);

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      hideMenu();
      hideProfileMenu();
    });
  }, []);

  useUnmountEffect(() => {
    unbindMenuOutsideClickListener();
    unbindProfileMenuOutsideClickListener();
  });

  const containerClass = classNames('layout-wrapper', {
    'layout-theme-light': layoutConfig.colorScheme === 'light',
    'layout-theme-dark': layoutConfig.colorScheme === 'dark',
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
    'p-input-filled': layoutConfig.inputStyle === 'filled',
    'p-ripple-disabled': !layoutConfig.ripple
  });
  return (
    <React.Fragment>
      <Head>
        <title>CRM</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="Sistema de gestión de pedidos de canastas de regalo" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href={`${contextPath}/favicon.png`} type="image/x-icon"></link>

        <link rel="manifest" href={`${contextPath}/manifest.json`} />
        <meta name="theme-color" content="#90cdf4" />
        <link rel="apple-touch-icon" href={`${contextPath}/layout/images/logo.png`} />
        <meta name="apple-mobile-web-app-status-bar" content="#90cdf4" />
      </Head>
      <BlockUI blocked={blockUi}>
        <div className={containerClass}>
          <AppTopbar ref={topbarRef} />
          <div ref={sidebarRef} className="layout-sidebar">
            <AppSidebar />
          </div>
          <div className="layout-main-container">
            <div className="layout-main">{props.children}</div>
            <AppFooter />
          </div>
          <AppConfig />
          <div className="layout-mask"></div>
        </div>
      </BlockUI>
      <Toast ref={toast} />

    </React.Fragment>
  );
};

export default Layout;