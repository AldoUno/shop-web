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

const Usuarios = React.memo(() => {
  let emptyItem = {
    id: '',
    name: '',
    surname: '',
    cedula: '',
    phone: '',
    email: '',
    rol: '',
    password: '',
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
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    surname: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    cedula: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    phone: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    "rol.description": { value: '', matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [statuses] = useState(['ACTIVO', 'INACTIVO']);
  const path = 'all-users'

  useEffect(() => {

    getAllData()

    return () => controller.abort()

  }, []);

  const getAllData = () => {
    setLoading1(true);

    Promise.all([
      List(path, signal),
      List('all-roles', signal)
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
        setItems(newData)
        setRoles(data[1].data)
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

    const item_to_create = {
      ...item,
      ['rol_id']: item.rol.id
    }

    delete item_to_create.rol

    Submit(item_to_create, 'create-user')
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
    if (item.rol) {
      item.rol_id = item.rol.id
    }

    Edit(item, 'update-user', item.id)
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
        item.status = item?.status === 1 ? 'Acitvo' : 'Inactivo'
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
    requiredFields = ['name', 'surname', 'email', 'phone', 'cedula', 'rol'];

    if (!item.id) {
      requiredFields.push('password')
    }

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
    Delete(item.id, 'delete-user')
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
      <h5 className="m-0">Usuarios</h5>

      <div className="flex flex-wrap mt-2 md:mt-0">
        <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />

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

  const generatePass = () => {
    const caracteres = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      '!@#$%^&*()_+~`|}{[]\:;?><,./-='
    ].join('');

    let contrasena = '';
    while (contrasena.length < 10) {
      const caracterAleatorio = caracteres[Math.floor(Math.random() * caracteres.length)];
      contrasena += caracterAleatorio;
    }
    if (!/[A-Z]/.test(contrasena)) contrasena = contrasena.replace(contrasena[0], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
    if (!/[a-z]/.test(contrasena)) contrasena = contrasena.replace(contrasena[1], 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]);
    if (!/[0-9]/.test(contrasena)) contrasena = contrasena.replace(contrasena[2], '0123456789'[Math.floor(Math.random() * 10)]);
    if (!/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(contrasena)) contrasena = contrasena.replace(contrasena[3], '!@#$%^&*()_+~`|}{[]\:;?><,./-='[Math.floor(Math.random() * 23)]);


    setItem({
      ...item,
      ['password']: contrasena
    })
  }

  let broadcrumbData = { label: 'Usuarios', icon: 'pi pi-fw pi-eye', url: routes.usuarios };
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
              globalFilterFields={['name', 'surname', 'cedula', 'email', 'phone', 'status', 'rol.description', 'an8', 'suc_planta', 'cod_venta']}
              emptyMessage="No se encontraron usuarios."
              header={header}
              size='small'
              removableSort
            >
              <Column field="name" header="Nombre" sortable filter filterField='name' filterPlaceholder="Nombre"></Column>
              <Column field="surname" header="Apellido" sortable filter filterField='surname' filterPlaceholder="Apellido"></Column>
              <Column field="cedula" header="CI" sortable filter filterField='cedula' filterPlaceholder="CI"></Column>
              <Column field="email" header="Correo" sortable filter filterField='email' filterPlaceholder="Correo"></Column>
              <Column field="phone" header="Telefono" sortable filter filterField='phone' filterPlaceholder="Telefono"></Column>
              <Column field="rol.description" header="Rol" sortable filter filterField='rol.description' filterPlaceholder="Rol"></Column>
              <Column field="status" header="Estado" showFilterMenu={false} body={statusBodyTemplate} filter filterElement={statusRowFilterTemplate}></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog draggable={false} resizable={false} maximizable visible={itemDialog} style={{ width: '600px' }} header={nuevo ? 'Nuevo Usuario' : 'Editar Usuario'} modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
              <div className="formgrid grid">

                <div className={classNames({ 'p-input-filled': item.name }, 'field col')}>
                  <label htmlFor="name">Nombre(s)</label>
                  <InputText
                    id="name"
                    value={item.name}
                    onChange={(e) => onInputChange(e, 'name')}
                    required
                    autoFocus
                    className={classNames({ 'p-invalid': submitted && !item.name })} placeholder="Juan Carlos" />
                  {submitted && !item.name && <small className="p-invalid p-error">El NOMBRE es requerido.</small>}
                </div>
                <div className={classNames({ 'p-input-filled': item.surname }, 'field col')}>
                  <label htmlFor="surname">Apellido(s)</label>
                  <InputText
                    id="surname"
                    value={item.surname}
                    onChange={(e) => onInputChange(e, 'surname')}
                    required
                    className={classNames({ 'p-invalid': submitted && !item.surname })} placeholder="Perez Lopez" />
                  {submitted && !item.surname && <small className="p-invalid p-error">La DIRECCIÓN es requerida.</small>}
                </div>
              </div>

              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.email }, 'field col')}>
                  <label>Correo</label>
                  <InputText
                    id="email"
                    value={item.email}
                    onChange={(e) => onInputChange(e, 'email')}
                    required
                    className={classNames({ 'p-invalid': submitted && !item.email })} placeholder="micorreo@ajvierci.com.py" />
                  {submitted && !item.email && <small className="p-invalid p-error">El CORREO es requerido.</small>}
                </div>

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
              </div>

              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.cedula }, 'field col')}>
                  <label>CI</label>
                  <InputText
                    id="cedula"
                    value={item.cedula}
                    onChange={(e) => onInputChange(e, 'cedula')}
                    placeholder={999.999}
                    className={classNames({ 'p-invalid': submitted && !item.cedula })} />
                  {submitted && !item.cedula && <small className="p-invalid p-error">El CI es requerido.</small>}
                </div>
                <div className={classNames({ 'p-input-filled': item.rol }, 'field col')}>
                  <label>Rol</label>
                  <Dropdown
                    value={item.rol}
                    onChange={e => onInputChange(e, 'rol')}
                    options={roles}
                    optionLabel="description"
                    placeholder="Selecciona el rol"
                    className={classNames({ 'p-invalid': submitted && !item.rol })}
                  />
                  {submitted && !item.rol && <small className="p-invalid p-error">El ROL es requerido.</small>}
                </div>
              </div>
              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.password }, 'field col-12 md:col-6')}>
                  <label htmlFor="password">{item.id ? 'Resetear Password' : 'Password'}</label>
                  <div className="p-inputgroup">
                    <Password
                      promptLabel="Ingresa una contraseña"
                      weakLabel="La contraseña es débil"
                      mediumLabel="La contraseña es poco segura"
                      strongLabel="La contraseña es segura"
                      value={item?.password || ''}
                      onChange={(e) => onInputChange(e, 'password')}
                      required
                      className={classNames({ 'p-invalid': submitted && !item.id && !item.password })}
                      autoComplete="new-password"
                      placeholder="Ingresa la contraseña"
                      toggleMask
                      tooltip='De contener minimo 10 caracteres'
                    />
                    <Button icon="pi pi-refresh" onClick={() => generatePass()} />
                  </div>
                  {submitted && !item.id && !item.password && <small className="p-invalid p-error">La CONTRASEÑA es requerida.</small>}
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
                          { status: 'Inactivo', value: 'Acitvo' }
                        ]}
                        optionLabel="status"
                        placeholder="Selecciona el status"
                      />
                    </div>
                  )
                }
              </div>
            </Dialog>

            <Dialog visible={deleteItemDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteItemDialogFooter} onHide={hideDeleteitemDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && (
                  <span>
                    Estás seguro que quieres eliminar a <b>{item.name + ' ' + item.surname}</b>?
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

export default Usuarios;
