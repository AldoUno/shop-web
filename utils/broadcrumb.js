import { BreadCrumb } from 'primereact/breadcrumb';
import routes from './routes'

const Guia = ({ ruta }) => {
    const items = [];
    const home = { icon: 'pi pi-home', url: routes.inicio }
    items.push(ruta)
    return (
        <BreadCrumb home={home} model={items} className="mb-2" style={{borderRadius: '12px'}}/>
    )
}

export default Guia