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
            label: 'Gestión',
            items: [ { label: 'Órdenes', icon: 'pi pi-shopping-cart', to: routes.orders, visible: checkVisible('orders', permissions) } ],
        },  
        {
            label: 'Seguridad',
            items: [
                { label: 'Usuarios', icon: 'pi pi-user-edit', to: routes.usuarios, badge: 'NEW', visible: true},
                { label: 'Roles', icon: 'pi pi-sitemap', to: routes.roles, badge: 'NEW', visible: true},
                { label: 'Vistas', icon: 'pi pi-bars', to: routes.views, badge: 'NEW', visible: true},
                { label: 'Permisos', icon: 'pi pi-lock', to: routes.permissions, badge: 'NEW', visible: true},
                { label: 'Productos', icon: 'pi pi-qrcode', to: routes.products, badge: 'NEW', visible: true},                
                { label: 'Categorías', icon: 'pi pi-tag', to: routes.category, badge: 'NEW', visible: true},
                { label: 'Proveedores', icon: 'pi pi-id-card', to: routes.proveedores, badge: 'NEW', visible: true},
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
