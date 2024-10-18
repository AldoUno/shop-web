import { Card } from 'primereact/card';
import Lottie from "lottie-react";
import report from "../../../public/lotties/report/data.json";
import analisis from "../../../public/lotties/analisis/data.json";
import gestion from "../../../public/lotties/gestion/data.json";
import seguridad from "../../../public/lotties/seguridad/seguridad.json";
import client from "../../../public/lotties/client/client.json";
import order from "../../../public/lotties/order/data.json";
import category from "../../../public/lotties/category/data.json";
import prodcut from "../../../public/lotties/product/data.json";
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import Guia from '../../../utils/broadcrumb';
import routes from '../../../utils/routes';
import { useSelector } from 'react-redux';
import React from 'react';

const Dashboard = React.memo(() => {
  const router = useRouter();
  const { permissions } = useSelector(state => state.usuario)

  const checkVisible = (item, permissions) => permissions?.hasOwnProperty(item)

  const dashboard_items = [
    {
      id: 1,
      title: 'USUARIOS',
      subtitle: 'Administración de usuarios, accesos, etc.',
      image: '/usuarioss.jpg',  // Ruta de la imagen en la carpeta public
      footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.usuarios)}
              />
          </span>
      ),
      access: true
    },
    {
      id: 2,
      title: 'ROLES',
      subtitle: 'Administración de roles, edición, creación etc.',
      image: '/roless.jpg',
      footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.roles)}
              />
          </span>
      ),
      access: true
    },
    {
      id: 3,
      title: 'VISTAS',
      subtitle: 'Administración de vistas, edición, creación etc.',
      image: '/vistass.jpg',
      footer: (
        <span>
            <Button
                label="Ingresa Aquí"
                icon="pi pi-arrow-right p-button-rounded"
                className="col-sm-12"
                onClick={() => router.push(routes.views)}
            />
        </span>
    ),
    access: true
  },
    {
      id: 4,
      title: 'PERMISOS',
      subtitle: 'Administración de permisos, edición, creación etc.',
      image: '/permisoss.jpg',
      footer: (
        <span>
            <Button
                label="Ingresa Aquí"
                icon="pi pi-arrow-right p-button-rounded"
                className="col-sm-12"
                onClick={() => router.push(routes.permissions)}
            />
        </span>
    ),
    access: true
  },
    {
        id: 5,
        title: 'PRODUCTOS',
        subtitle: 'Administración de productos, edición, creación etc.',
        image: '/productoss.jpg',
        footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.products)}
              />
          </span>
      ),
      access: true
    },
      {
        id: 6,
        title: 'ÓRDENES',
        subtitle: 'Administración de órdenes, edición, creación etc.',
        image: '/orderss.jpg',
        footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.orders)}
              />
          </span>
      ),
      access: true
    },
      {
        id: 7,
        title: 'CATEGORÍAS',
        subtitle: 'Administración de categorías, edición, creación etc.',
        image: '/categorys.jpg',
        footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.category)}
              />
          </span>
      ),
      access: true
    },
      {
        id: 8,
        title: 'PROVEEDORES',
        subtitle: 'Administración de proveedores, edición, creación etc.',
        image: '/proveedoress.jpg',
        footer: (
          <span>
              <Button
                  label="Ingresa Aquí"
                  icon="pi pi-arrow-right p-button-rounded"
                  className="col-sm-12"
                  onClick={() => router.push(routes.proveedores)}
              />
          </span>
      ),
      access: true
    },
  ];

  return (
    <div className="flex flex-wrap">
        {dashboard_items.map(item => {
          if (item.access) {
            return (
            <div key={item.id} className="col-12 md:col-2 lg:col-4 text-center" //aquí se ajusta el tamaño de la card
            style={{ borderRadius: '10px' }}>
              <Card className="mb-auto" style={{ borderRadius: '10px' }} /*auto hace que se ajuste automáticamente el box contenedor*/ > 
                <img src={item.image} alt={item.title} className="dashboard-image md:col-8 m-auto" /*lo mismo acá*/ />
                <h3 className="m-auto"><b>{item.title}</b></h3>
                <p>{item.subtitle}</p>
                {item.footer}
                </Card>
            </div>
            )}
})}
    </div>
);
})

export default Dashboard
