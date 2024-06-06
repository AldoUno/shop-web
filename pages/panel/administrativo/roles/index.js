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
import { getSeverity } from '../../../../utils/status';
import { VALIDATE_BUTTON } from '../../../../utils/textFreeze';

const Roles = React.memo(() => {
  let emptyItem = {
    id: null,
    description: '',
  };
  const [items, setItems] = useState([]);
  const [itemDialog, setItemDialog] = useState(false);
  const [deleteItemDialog, setDeleteitemDialog] = useState(false);
  const [deleteItemsDialog, setDeleteItemsDialog] = useState(false);
  const [item, setItem] = useState(emptyItem);
  const [submitted, setSubmitted] = useState(null)
  const [nuevo, setNuevo] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const controller = new AbortController()
  const { signal } = controller
  const path = 'all-roles'

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    description: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const { permissions } = useSelector(state => state.usuario)

  useEffect(() => {
    getAllData()
    return () => controller.abort()
  }, []);

  const getAllData = () => {
    setLoading1(true);

    List(path, signal)
      .then(async response => {
        if (response.ok) {
          return response.json()
        } else {
          const { msg } = await response.json()
          throw new Error(msg)
        }
      })
      .then(data => setItems(data.data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 })
        }
      })
      .finally(() => {
        setLoading1(false)
      })

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

  const hideDeleteitemDialog = () => {
    setDeleteitemDialog(false);
  };

  const solicitarDatos = () => {
    getAllData()
  }

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
    Submit(item, 'create-role')
      .then(async response => {
        if (response.ok) {
          toast.current?.show(messages.mensajeExitosoSubmit)
          return response.json()
        } else {
          const { message } = await response.json()
          throw new Error(message)
        }
      })
      .then((data) => items.push(data.data))
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
    Edit(item, 'update-role', item.id)
      .then(async response => {
        if (response.ok) {
          toast.current?.show(messages.mensajeExitosoEdit)
          return response.json()
        } else {
          const { message } = await response.json()
          throw new Error(message)
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
    Delete(item.id, 'delete-role')
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

  const saveItem = () => {
    setSubmitted(true)
    if (!item.description) {
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
    setDeleteitemDialog(true);
  };

  const deleteItem = () => {
    eliminarItem();
    setDeleteitemDialog(false);
    setItem(emptyItem);
  };

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

  const codeBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Código</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData) => rowData.description

  const actionBodyTemplate = (rowData) => {
    return (
      <> 
      {
        permissions?.roles?.update === "1"
        ? <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Editar" tooltipOptions={{ position: 'bottom' }} />
        : null
      }

      {
        permissions?.roles?.delete === "1"
        ? <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteItem(rowData)} tooltip="Eliminar" tooltipOptions={{ position: 'bottom' }} />
        : null
      }
      </>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Roles</h5>

      <div className="flex flex-wrap mt-2 md:mt-0">
        {
          permissions?.roles?.write === "1"
          ? <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
          : null
        }
        <Button label="Actualizar" icon="pi pi-sync" className="mr-2" onClick={solicitarDatos} />
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
      <Button label="No" icon="pi pi-times" className="p-button-text" type="submit" onClick={hideDeleteitemDialog} />
      <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteItem} />
    </>
  );
  const deleteItemsDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteItemsDialog} />
      <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedItems} />
    </>
  )

  const isSelectable = (data) => data.status === VALIDATE_BUTTON.statusEliminado ? false : true

  const rowClassName = (data) => (isSelectable(data) ? '' : 'p-disabled');

  let broadcrumbData = { label: 'Roles', icon: 'pi pi-fw pi-eye', url: routes.Rol };
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
              selection={selectedItems}
              onSelectionChange={(e) => setSelectedItems(e.value)}
              paginator
              loading={loading1}
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive alternar"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} items"
              filters={filters}
              filterDisplay="row"
              globalFilterFields={['id', 'description']}
              emptyMessage="No se encontraron roles."
              header={header}
              size='small'
              removableSort
              rowClassName={rowClassName}
            >
              <Column className='column__id' field="id" header="Código" sortable filter filterField='id' filterPlaceholder="Cód" body={codeBodyTemplate}></Column>
              <Column field="description" header="Descripción" sortable filter filterField='description' filterPlaceholder="Descripción" body={nameBodyTemplate}></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog maximizable visible={itemDialog} style={{ width: '450px' }} header={nuevo ? 'Nuevo Rol' : 'Editar Rol'} modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
              <div className={classNames({ 'p-input-filled': item.description }, 'field')}>
                <label htmlFor="item">Rol</label>
                <InputText
                  id="item"
                  value={item.description}
                  onChange={(e) => onInputChange(e, 'description')}
                  required
                  autoFocus
                  className={classNames({ 'p-invalid': submitted && !item.item })} placeholder="Administrador" />
                {submitted && !item.description && <small className="p-invalid p-error">El ROL es requerido.</small>}
              </div>
            </Dialog>

            <Dialog visible={deleteItemDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteItemDialogFooter} onHide={hideDeleteitemDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && (
                  <span>
                    Estás seguro que quieres eliminar a <b>{item.description}</b>?
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

export default Roles;
