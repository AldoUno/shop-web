import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { List, Submit, Edit, Delete } from '../../../../utils/service/fetchData';
import Guia from '../../../../utils/broadcrumb';
import routes from '../../../../utils/routes';
import { messages } from '../../../../utils/messages';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { useSelector } from 'react-redux';
import { MultiStateCheckbox } from 'primereact/multistatecheckbox';
import { getSeverity } from '../../../../utils/status';
import { options, VALIDATE_BUTTON } from '../../../../utils/textFreeze';

const Permissions = React.memo(() => {
  let emptyItem = {
    id: null,
    description: '',
    view: '',
    rol: '',
    read: '0',
    write: '0',
    update: '0',
    delete: '0',
    status: '1',
  };

  const [items, setItems] = useState([]);
  const [itemDialog, setItemDialog] = useState(false);
  const [deleteItemDialog, setDeleteItemDialog] = useState(false);
  const [deleteItemsDialog, setDeleteItemsDialog] = useState(false);
  const [item, setItem] = useState(emptyItem);
  const [submitted, setSubmitted] = useState(null)
  const [nuevo, setNuevo] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [roles, setRoles] = useState([])
  const [views, setViews] = useState([])
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [statuses] = useState(['ACTIVO', 'INACTIVO']);
  const { permissions } = useSelector(state => state.usuario)
  const controller = new AbortController()
  const { signal } = controller

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'rol.description': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'view.description': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
  });

  useEffect(() => {
    getAllData()

    return () => controller.abort();

  }, []);

  const getAllData = () => {
    setLoading1(true);
    Promise.all([
      List('all-roles', signal),
      List('all-views', signal),
      List('all-permissions', signal),
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
        setRoles(data[0].data)
        setViews(data[1].data)
        setItems(data[2].data)
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

  const hideDeleteItemDialog = () => {
    setDeleteItemDialog(false);
  };

  const agregarItem = () => {
    setLoading1(true);

    const item_to_insert = {
      ...item,
      ['rol_id']: item.rol.id,
      ['view_id']: item.view.id,
    }

    delete item_to_insert.rol
    delete item_to_insert.view

    Submit(item_to_insert, 'create-permission')
      .then(async response => {
        if (response.ok) {
          toast.current?.show(messages.mensajeExitosoSubmit)
          return response.json()
        } else {
          const { msg } = await response.json()
          throw new Error(msg)
        }
      })
      .then((data) => {
        const newData = {
          ...item,
          ...data.data
        }
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
  const editarItem = () => {
    setLoading1(true);

    const index = findIndexById(item.id);
    Edit(item, 'update-permission', item.id)
      .then(async response => {
        if (response.status === 200) {
          toast.current?.show(messages.mensajeExitosoEdit)
          return response.json()
        } else {
          const { msg } = await response.json()
          throw new Error(msg)
        }
      })
      .then(() => items[index] = item)
      .catch((error) => toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 }))
      .finally(() => {
        setItem(emptyItem)
        setLoading1(false)
      })
  };

  const eliminarItem = () => {
    setLoading1(true);
    const index = findIndexById(item.id);
    Delete(item.id, 'delete-permission')
      .then(async response => {
        if (response.ok) {
          toast.current?.show(messages.mensajeExitosoDelete)
          return response.json()
        } else {
          const { msg } = await response.json()
          throw new Error(msg)
        }
      })
      .then(() => items.splice(index, 1))
      .catch((error) => toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 }))
      .finally(() => {
        setItem(emptyItem)
        setLoading1(false)
      })
  };

  const saveItem = () => {
    setSubmitted(true)
    if (!item.view || !item.rol) {
      return toast.current?.show({ severity: 'warn', summary: 'Alerta!', detail: 'Faltan llenar uno o más campos', life: 3000 });
    }
    if (item.id) {
      editarItem();
    } else {
      agregarItem();
    }

    setSubmitted(false)
    setItemDialog(false);
  };

  const editItem = (item) => {
    setItem({ ...item });
    setNuevo(false)
    setItemDialog(true);
  };

  const confirmDeleteItem = (item) => {
    setItem(item);
    setDeleteItemDialog(true);
  };

  const deleteItem = () => {
    eliminarItem();
    setDeleteItemDialog(false);
    setItem(emptyItem);
  };

  const onInputChange = (e, name) => {
    let val = (e.target && e.target.value) || '1';
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

  const deleteSelectedItems = () => {
    let _items = items.filter((val) => !selectedItems.includes(val));
    setItems(_items);
    setDeleteItemsDialog(false);
    setSelectedItems(null);
    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Items eliminados', life: 3000 });
  };

  const hideDeleteItemsDialog = () => {
    setDeleteItemsDialog(false);
  };

  const statusBodyTemplate = (rowData) => {
    const showStatus = rowData.status === "1" ? 'Activo' : 'Inactivo'
    return (
      <>
        <span className="p-column-title">Estado</span>
        <span className={`usuario-badge status-${showStatus.toLowerCase()}`}>{showStatus}</span>
      </>
    );
  };

  const statusItemTemplate = (option) => {
    return (
      <Tag value={option} severity={getSeverity(option)} />
    )
  }

  const statusRowFilterTemplate = (options) =>  <Dropdown value={options.value === "1" && 'ACTIVO' || options.value === '0' && 'INACTIVO' || ''} options={statuses} onChange={(e) => options.filterApplyCallback(e.value === 'ACTIVO' && '1' || e.value === 'INACTIVO' && '0' || '')} itemTemplate={statusItemTemplate} placeholder="Estado" className="p-column-filter" showClear style={{ minWidth: '10em' }} />


  const rolBodyTemplate = (rowData) => rowData?.rol?.description

  const formularioBodyTemplate = (rowData) => rowData?.view?.description

  const actionBodyTemplate = (rowData) => {
    return (
      <> 
      {
        permissions?.permissions?.update === "1"
        ? <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Editar" tooltipOptions={{ position: 'bottom' }} />
        : null
      }

      {
        permissions?.permissions?.delete === "1"
        ? <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteItem(rowData)} tooltip="Eliminar" tooltipOptions={{ position: 'bottom' }} />
        : null
      }
      </>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Permisos</h5>

      <div className="flex flex-wrap mt-2 md:mt-0">
        {
          permissions?.permissions?.write === "1"
          ? <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
          : null
        }
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
  const deleteItemDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" type="submit" onClick={hideDeleteItemDialog} />
      <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteItem} />
    </>
  );
  const deleteItemsDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteItemsDialog} />
      <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedItems} />
    </>
  )

  let broadcrumbData = { label: 'Permisos', icon: 'pi pi-fw pi-eye', url: routes.permisions };
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
              globalFilterFields={['id']}
              emptyMessage="No se encontraron permisos."
              header={header}
              size='small'
              removableSort
            >
              <Column className='column__id' field="id" header="Código" sortable filter filterField='id' filterPlaceholder="Cód"></Column>
              <Column field="rol.description" header="Rol" sortable filter filterField='rol.description' filterPlaceholder="Rol" body={rolBodyTemplate}></Column>
              <Column field="view.description" header="Vista" sortable filter filterField='view.description' filterPlaceholder="Vista" body={formularioBodyTemplate}></Column>
              <Column field="status" header="Estado" showFilterMenu={false} body={statusBodyTemplate} filter filterElement={statusRowFilterTemplate}></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>
            <Dialog visible={itemDialog} style={{ width: '450px' }} maximizable header={nuevo ? 'Nuevo Permiso' : 'Editar Permiso'} modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.rol }, 'field col')}>
                  <label>Rol</label>
                  <Dropdown
                    value={item.rol}
                    onChange={(e) => onInputChange(e, 'rol')}
                    required
                    options={roles}
                    optionLabel="description"
                    className={classNames({ 'p-invalid': submitted && !item.rol })}
                    placeholder="Selecciona el rol"
                  />
                  {submitted && !item.rol && <small className="p-invalid p-error">El ROL es requerido.</small>}
                </div>
                <div className={classNames({ 'p-input-filled': item.view }, 'field col')}>
                  <label>Vista</label>
                  <Dropdown
                    value={item.view}
                    onChange={(e) => onInputChange(e, 'view')}
                    required
                    options={views}
                    optionLabel="description"
                    className={classNames({ 'p-invalid': submitted && !item.view })}
                    placeholder="Selecciona el formulario"
                  />
                  {submitted && !item.view && <small className="p-invalid p-error">La VISTA es requerida.</small>}
                </div>
              </div>

              <div className='field'>
                <label htmlFor="permisos">Permisos</label>
                <div className="flex align-items-center">
                  <div className='col-6'>
                    <MultiStateCheckbox value={item.read} onChange={(e) => onInputChange(e, 'read')} options={options} optionValue="value" />
                    <label htmlFor='read' className="ml-2 mr-4">Consultar</label>
                  </div>
                  {item.read == VALIDATE_BUTTON.enabledPermision ? <span style={{ color: '#22C55E' }} >Habilitado</span> : <span style={{ color: '#F59E0B' }}>Deshabilitado</span>}
                </div>
                <div className="flex align-items-center">
                  <div className='col-6'>
                    <MultiStateCheckbox value={item.write} onChange={(e) => onInputChange(e, 'write')} options={options} optionValue="value" />
                    <label htmlFor='write' className="ml-2 mr-4">Insertar</label>
                  </div>
                  {item.write == VALIDATE_BUTTON.enabledPermision ? <span style={{ color: '#22C55E' }} >Habilitado</span> : <span style={{ color: '#F59E0B' }}>Deshabilitado</span>}
                </div>
                <div className="flex align-items-center">
                  <div className='col-6'>
                    <MultiStateCheckbox value={item.update} onChange={(e) => onInputChange(e, 'update')} options={options} optionValue="value" />
                    <label htmlFor='update' className="ml-2 mr-4">Actualizar</label>
                  </div>
                  {item.update == VALIDATE_BUTTON.enabledPermision ? <span style={{ color: '#22C55E' }} >Habilitado</span> : <span style={{ color: '#F59E0B' }}>Deshabilitado</span>}
                </div>
                <div className="flex align-items-center">
                  <div className='col-6'>
                    <MultiStateCheckbox value={item.delete} onChange={(e) => onInputChange(e, 'delete')} options={options} optionValue="value" />
                    <label htmlFor='delete' className="ml-2 mr-4">Eliminar</label>
                  </div>
                  {item.delete == VALIDATE_BUTTON.enabledPermision ? <span style={{ color: '#22C55E' }} >Habilitado</span> : <span style={{ color: '#F59E0B' }}>Deshabilitado</span>}

                </div>
              </div>
            </Dialog>

            <Dialog visible={deleteItemDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteItemDialogFooter} onHide={hideDeleteItemDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && (
                  <span>
                    Estás seguro que quieres eliminar el Permiso Nº <b>{item.id}</b>?
                  </span>
                )}
              </div>
            </Dialog>

            <Dialog visible={deleteItemsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteItemsDialogFooter} onHide={hideDeleteItemsDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && <span>Estás seguro que quieres eliminar los items seleccionados?</span>}
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
});

export default Permissions;