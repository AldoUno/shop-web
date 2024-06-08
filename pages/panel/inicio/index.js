import { Card } from 'primereact/card';
import Lottie from "lottie-react";
import report from "../../../public/lotties/report/data.json";
import analisis from "../../../public/lotties/analisis/data.json";
import gestion from "../../../public/lotties/gestion/data.json";
import seguridad from "../../../public/lotties/seguridad/seguridad.json";
import client from "../../../public/lotties/client/client.json";
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
      title: 'Usuarios',
      subtitle: 'Adminstración de usuarios, accesos, etc.',
      footer: <span><Button label="Ingresa Aquí" icon="pi pi-arrow-right p-button-rounded" className="col-sm-12" onClick={() => router.push(routes.usuarios)} /></span>,
      lottie: <Lottie animationData={client} loop={true} className="col-6 m-auto" />,
      access: true
    },

    {
      id: 2,
      title: 'Roles',
      subtitle: 'Adminstración de roles, edición, creación etc.',
      footer: <span><Button label="Ingresa Aquí" icon="pi pi-arrow-right p-button-rounded" className="col-sm-12" onClick={() => router.push(routes.roles)} /></span>,
      lottie: <Lottie animationData={gestion} loop={true} className="col-6 m-auto mb-2" />,
      access: true
    },
    {
      id: 3,
      title: 'Vistas',
      subtitle: 'Adminstración de vistas, edición, creación etc.',
      footer: <span><Button label="Ingresa Aquí" icon="pi pi-arrow-right p-button-rounded" className="col-sm-12" onClick={() => router.push(routes.views)} /></span>,
      lottie: <Lottie animationData={analisis} loop={true} className="col-6 m-auto mb-2" />,
      access: true
    },
    {
      id: 4,
      title: 'Permisos',
      subtitle: 'Adminstración de permisos, edición, creación etc.',
      footer: <span><Button label="Ingresa Aquí" icon="pi pi-arrow-right p-button-rounded" className="col-sm-12" onClick={() => router.push(routes.permissions)} /></span>,
      lottie: <Lottie animationData={seguridad} loop={true} className="col-6 m-auto mb-2" />,
      access: true
    }
  ]

  return (
    <>
      <Guia ruta="/" />
      <div className="flex flex-wrap" >
        {
          dashboard_items.map(item => {
            if (item.access) {
              return (
                <div className="col-12 md:col-6 lg:col-4 text-center" key={item.id}>
                  <Card header={item.lottie} title={item.title} subTitle={item.subtitle} footer={item.footer} className="mb-1" style={{ borderRadius: '12px' }} />
                </div>
              )
            }
          })
        }
      </div>
    </>
  )
})

export default Dashboard