import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import routes from '../utils/routes';
import { useDispatch, useSelector } from 'react-redux';

const AppMenu = () => {
    const { permissions } = useSelector(state => state.usuario)

    const checkVisible = (item, permissions) => permissions?.hasOwnProperty(item) || false
    
    const model = [
        {
            label: 'Dashboard',
            items: [ { label: 'Inicio', icon: 'pi pi-fw pi-home', to: routes.inicio } ],
        },
        {
            label: 'Seguridad',
            items: [
                { label: 'Usuarios', icon: 'pi pi-user-edit', to: routes.usuarios, badge: 'NEW', visible: checkVisible('users', permissions)},
                { label: 'Roles', icon: 'pi pi-sitemap', to: routes.roles, badge: 'NEW', visible: checkVisible('roles', permissions) },
                { label: 'Vistas', icon: 'pi pi-bars', to: routes.views, badge: 'NEW', visible: checkVisible('views', permissions) },
                { label: 'Permisos', icon: 'pi pi-lock', to: routes.permissions, badge: 'NEW', visible: checkVisible('permissions', permissions) },
            ]
        },
    ]

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.separator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
