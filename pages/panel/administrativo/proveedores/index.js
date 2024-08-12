import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { List, Submit, Edit, Delete } from '../../../../utils/service/fetchData';
import Guia from '../../../../utils/broadcrumb';
import routes from '../../../../utils/routes';
import { messages } from '../../../../utils/messages';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { getSeverity } from '../../../../utils/status';
import { Password } from 'primereact/password';
import { InputMask } from 'primereact/inputmask';
import { isValidEmail } from '../../../../utils/isValidEmail'
import { useSelector } from 'react-redux';

const Proveedores= React.memo(() => {
    let emptyItem = {
        id: '',
        razonsocial: '',
        ruc: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        status: '',
    };

    let emptyEdit = {}

    const [items, setItems] = useState([]);
    const [deleteItemDialog, setDeleteitemDialog] = useState(false);
    const [itemDialog, setItemDialog] = useState(false);
    const [item, setItem] = useState(emptyItem);
    const [submitted, setSubmitted] = useState(null)
    const [nuevo, setNuevo] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);
    const controller = new AbortController()
    const [roles, setRoles] = useState([])
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const { signal } = controller
    const { permissions } = useSelector(state => state.usuario)

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        razonsocial: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ruc: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        razon: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        status: { value: '', matchMode: FilterMatchMode.STARTS_WITH },        
    });
    const [statuses] = useState(['ACTIVO', 'INACTIVO']);
    const path = 'all-proveedores'

    useEffect(() => {

        getAllData()

        return () => controller.abort()

    }, []);

    const getAllData = () => {
        setLoading1(true);

        Promise.all([
            List('all-proveedores', signal)
        ])
            .then(responses => Promise.all(responses.map(async response => {
                if (response.ok) {
                    return response.json()
                } else {
                    const { msg } = await response.json()
                    throw new Error(msg)
                }
            })))
            .then(data => {
                const newData = data[0].data.map(item => ({
                    ...item,
                    status: item.status === 1 ? 'Activo' : 'Inactivo'
                }))
                console.log("Datos obtenidos:", newData);// Agrega este console.log para ver los datos obtenidos
                setItems(newData)
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    return toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 })
                }
            })
            .finally(() => setLoading1(false))
    }

    const openNew = () => {
        setNuevo(true);
        setItem(emptyItem);
        setItemDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false)
        setItemDialog(false);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const agregarItem = () => {
        setLoading1(true);

        const item_to_create = {
            ...item,
        }

        Submit(item_to_create, 'create-proveedor')
            .then(async response => {
                if (response.ok) {
                    toast.current?.show(messages.mensajeExitosoSubmit)
                    return response.json()
                } else {
                    const { description } = await response.json()
                    throw new Error(description)
                }
            })
            .then((data) => {
                const newData = {
                    ...item,
                    ...data.data,
                    ['status']: data.data?.status === 1 ? 'Activo' : 'Inactivo'
                }
                delete newData.password
                setItems([...items, newData])
            })
            .catch((error) => {
                toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 })
            })
            .finally(() => {
                setItem(emptyItem)
                setLoading1(false)
            })
    };

    const editarItem = () => {
        setLoading1(true);
        const index = findIndexById(item.id);
        item.status = item?.status === 'Activo' ? 1 : 0

        Edit(item, 'update-proveedor', item.id)
            .then(async response => {
                if (response.ok) {
                    toast.current?.show(messages.mensajeExitosoEdit)
                    return response.json()
                } else {
                    const { description } = await response.json()
                    throw new Error(description)
                }
            })
            .then(() => {
                item.status = item?.status === 1 ? 'Activo' : 'Inactivo'
                items[index] = item
            })
            .catch((error) => toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 }))
            .finally(() => {
                setItem(emptyItem)
                setLoading1(false)
            })
    };

    const isValidItem = () => {
        let requiredFields = [];
        requiredFields = ['razonsocial', 'ruc', 'email', 'phone', 'address', 'city'];        


        for (const field of requiredFields) {
            if (!item[field]) {
                return false;
            }
        }

        return true;
    }

    const saveItem = () => {
        setSubmitted(true)

        if (!isValidItem()) {
            return toast.current?.show({ severity: 'warn', summary: 'Alerta!', detail: 'Faltan llenar uno o más campos', life: 3000 });
        }

        if (item.id) {
            if (item.email) {
                if (!isValidEmail(item.email)) return toast.current.show(messages.mensageErrorInvalidEmail)
            }

            editarItem()
        } else {
            if (!isValidEmail(item.email)) return toast.current.show(messages.mensageErrorInvalidEmail)

            agregarItem();
        }

        setSubmitted(false)
        setItemDialog(false);
    };

    const eliminarItem = () => {
        setLoading1(true);
        const index = findIndexById(item.id);
        Delete(item.id, 'delete-proveedor')
            .then(async response => {
                if (response.ok) {
                    toast.current?.show(messages.mensajeExitosoDelete)
                    return response.json()
                } else {
                    const { message } = await response.json()
                    throw new Error(message)
                }
            })
            .then(() => items.splice(index, 1))
            .catch((error) => toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 }))
            .finally(() => {
                setItem(emptyItem)
                setLoading1(false)
            })
    };

    const editItem = (item) => {
        setItem(item);
        setNuevo(false);
        setItemDialog(true);
    };

    const confirmDeleteItem = (item) => {
        setItem(item);
        setDeleteitemDialog(true);
    };

    const hideDeleteitemDialog = () => {
        setDeleteitemDialog(false);
    };

    const deleteItem = () => {
        eliminarItem();
        setDeleteitemDialog(false);
        setItem(emptyItem);
    };

    const deleteItemDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" type="submit" onClick={hideDeleteitemDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteItem()} />
        </>
    );

    const onInputChange = (e, name) => {
        let val = (e.target && e.target.value) || '';

        let _item = { ...item };
        _item[`${name}`] = val;

        setItem(_item);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Editar" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteItem(rowData)} tooltip="Eliminar" tooltipOptions={{ position: 'bottom' }} />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Proveedores</h5>

            <div className="flex flex-wrap mt-2 md:mt-0">
                <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />

                <Button label="Actualizar" icon="pi pi-sync" className="mr-2" onClick={getAllData} />
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Búsqueda global" />
                </span>
            </div>
        </div>
    );

    const itemDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveItem} />
        </>
    );

    const statusBodyTemplate = (rowData) => {
        const showStatus = rowData.status
        return (
            <>
                <span className="p-column-title">Estado</span>
                <span className={`usuario-badge status-${showStatus?.toLowerCase()}`}>{showStatus}</span>
            </>
        );
    };

    const statusItemTemplate = (option) => {
        return (
            <Tag value={option} severity={getSeverity(option)} />
        )
    }

    const statusRowFilterTemplate = (options) => {
        return (
            <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={statusItemTemplate} placeholder="Estado" className="p-column-filter" showClear style={{ minWidth: '10em' }} />
        )
    }

    let broadcrumbData = { label: 'Proveedores', icon: 'pi pi-fw pi-eye', url: routes.usuarios };
    return (
        <>
            <Guia ruta={broadcrumbData} />
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <DataTable
                            ref={dt}
                            value={items}
                            dataKey="id"
                            paginator
                            loading={loading1}
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive alternar"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} items"
                            filters={filters}
                            filterDisplay="row"
                            globalFilterFields={['razonsocial', 'ruc', 'address', 'city', 'phone', 'email', 'status']}
                            emptyMessage="No se encontraron proveedores."
                            header={header}
                            size='small'
                            removableSort
                        >
                            <Column field="razonsocial" header="Razón Social" sortable filter filterField='razonsocial' filterPlaceholder="Razón Social"></Column>
                            <Column field="ruc" header="RUC" sortable filter filterField='ruc' filterPlaceholder="RUC"></Column>
                            <Column field="address" header="Dirección" sortable filter filterField='address' filterPlaceholder="Dirección"></Column>
                            <Column field="city" header="Ciudad" sortable filter filterField='city' filterPlaceholder="Ciudad"></Column>
                            <Column field="phone" header="Teléfono" sortable filter filterField='phone' filterPlaceholder="Teléfono"></Column>
                            <Column field="email" header="Correo" sortable filter filterField='email' filterPlaceholder="Correo"></Column>
                            <Column field="status" header="Estado" showFilterMenu={false} body={statusBodyTemplate} filter filterElement={statusRowFilterTemplate}></Column>
                            <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>

                        <Dialog draggable={false} resizable={false} maximizable visible={itemDialog} style={{ width: '600px' }} header={nuevo ? 'Nuevo Proveedor' : 'Editar Proveedor'} modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
                            <div className="formgrid grid">

                                <div className={classNames({ 'p-input-filled': item.razonsocial }, 'field col')}>
                                    <label htmlFor="razonsocial">Razón Social</label>
                                    <InputText
                                        id="razonsocial"
                                        value={item.razonsocial}
                                        onChange={(e) => onInputChange(e, 'razonsocial')}
                                        required
                                        autoFocus
                                        className={classNames({ 'p-invalid': submitted && !item.razonsocial })} placeholder="Razón Social" />
                                    {submitted && !item.razonsocial && <small className="p-invalid p-error">La RAZÓN SOCIAL es requerida.</small>}
                                </div>
                                <div className={classNames({ 'p-input-filled': item.ruc }, 'field col')}>
                                    <label htmlFor="ruc">RUC</label>
                                    <InputText
                                        id="ruc"
                                        value={item.ruc}
                                        onChange={(e) => onInputChange(e, 'ruc')}
                                        required
                                        className={classNames({ 'p-invalid': submitted && !item.ruc })} placeholder="RUC" />
                                    {submitted && !item.ruc && <small className="p-invalid p-error">El RUC es requerido.</small>}
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className={classNames({ 'p-input-filled': item.address }, 'field col')}>
                                    <label>Dirección</label>
                                    <InputText
                                        id="address"
                                        value={item.address}
                                        onChange={(e) => onInputChange(e, 'address')}
                                        required
                                        className={classNames({ 'p-invalid': submitted && !item.address })} placeholder="Dirección" />
                                    {submitted && !item.address && <small className="p-invalid p-error">La DIRECCIÓN es requerida.</small>}
                                </div>

                                <div className={classNames({ 'p-input-filled': item.city }, 'field col')}>
                                    <label htmlFor="city">Ciudad</label>
                                    <InputText
                                        id="city"
                                        value={item.city}
                                        onChange={(e) => onInputChange(e, 'city')}
                                        required
                                        placeholder="Ciudad"
                                        className={classNames({ 'p-invalid': submitted && !item.city })} />
                                    {submitted && !item.city && <small className="p-invalid p-error">La CIUDAD es requerida.</small>}
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className={classNames({ 'p-input-filled': item.phone }, 'field col')}>
                                    <label htmlFor="phone">Teléfono</label>
                                    <InputMask
                                        id="phone"
                                        value={item.phone}
                                        onChange={(e) => onInputChange(e, 'phone')}
                                        required
                                        mask="(9999) 999-999"
                                        placeholder="(09XX) XXX-XXX"
                                        className={classNames({ 'p-invalid': submitted && !item.phone })} />
                                    {submitted && !item.phone && <small className="p-invalid p-error">El TELÉFONO es requerido.</small>}
                                </div>

                                <div className={classNames({ 'p-input-filled': item.email }, 'field col')}>
                                    <label>Correo</label>
                                    <InputText
                                        id="email"
                                        value={item.email}
                                        onChange={(e) => onInputChange(e, 'email')}
                                        required
                                        className={classNames({ 'p-invalid': submitted && !item.email })} placeholder="Correo" />
                                    {submitted && !item.email && <small className="p-invalid p-error">El CORREO es requerido.</small>}
                                </div>
                            </div>

                            {
                                item.id && (
                                    <div className={classNames({ 'p-input-filled': item.status }, 'field col-12 md:col-6')}>
                                        <label htmlFor="estado">Estado</label>
                                        <Dropdown
                                            value={item.status}
                                            onChange={e => onInputChange(e, 'status')}
                                            options={[
                                                { status: 'Activo', value: 'Activo' },
                                                { status: 'Inactivo', value: 'Inactivo' }
                                            ]}
                                            optionLabel="status"
                                            placeholder="Selecciona el status"
                                        />
                                    </div>
                                )
                            }
                        </Dialog>

                        <Dialog visible={deleteItemDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteItemDialogFooter} onHide={hideDeleteitemDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {item && (
                                    <span>
                                        Estás seguro que quieres eliminar a <b>{item.razonsocial}</b>?
                                    </span>
                                )}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
});

export default Proveedores;
