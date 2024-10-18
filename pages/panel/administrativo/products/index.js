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

const Products = React.memo(() => {
  let emptyItem = {
    id: '',
    name: '',
    category: '',  
    codbarra:'',
    descripcion:'',
    marca:'',
    existencia: '',
    status: '1',
    precio: '',
    iva: '',
    porcen_iva: '',
    url: ''
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
  const [categories, setCategories] = useState([])

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [statuses] = useState(['ACTIVO', 'INACTIVO']);
  const { permissions } = useSelector(state => state.usuario)
  const controller = new AbortController()
  const { signal } = controller

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'category.description': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    codbarra: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    descripcion: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    marca: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    existencia: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    precio: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    iva: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    porcen_iva: { value: '', matchMode: FilterMatchMode.STARTS_WITH },
    url: { value: '', matchMode: FilterMatchMode.STARTS_WITH }
  });

  useEffect(() => {
    getAllData()

    return () => controller.abort();

  }, []);

  const getAllData = () => {
    setLoading1(true);
    Promise.all([
      List('all-categories', signal),
      List('all-products', signal),
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
        setCategories(data[0].data)
        const newData = data[1].data.map(item => ({
          ...item,
          status: item.status == 1 ? 'Activo' : 'Inactivo'
        }))

        setItems(newData)
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          return toast.current?.show({ severity: 'warn', summary: '¡Error!', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 })
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
      ['category_id']: item.category,
    }

    delete item_to_insert.category

    Submit(item_to_insert, 'create-product')
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
          ...data.data,
          ['status']: data.data?.status == 1 ? 'Activo' : 'Inactivo'
        }
        setItems([...items, newData])
      })
      .catch((error) => {
        toast.current?.show({ severity: 'warn', summary: '¡Error!', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 })
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
    item.status = item?.status == 'Activo' ? 1 : 0;
    console.log(item)
    const item_to_update = {
        ...item,
        category_id: item.category?.id || item.category  // Verifica que el ID esté presente
        
    };
   

    const index = findIndexById(item.id);
    Edit(item_to_update, 'update-product', item.id)
      .then(async response => {
        if (response.status === 200) {
          toast.current?.show(messages.mensajeExitosoEdit);
          return response.json();
        } else {
          const { msg } = await response.json();
          throw new Error(msg);
        }
      })
      .then(() => {
        item.status = item?.status === 1 ? 'Activo' : 'Inactivo';
        items[index] = item;
      })
      .catch(error => {
        toast.current?.show({ severity: 'warn', summary: '¡Error!', detail: error.message || 'Error en el servidor. Contacte a soporte', life: 3000 });
      })
      .finally(() => {
        setItem(emptyItem);
        setLoading1(false);
      });
};

  const eliminarItem = () => {
    setLoading1(true);
    const index = findIndexById(item.id);
    Delete(item.id, 'delete-product')
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
      .catch((error) => toast.current?.show({ severity: 'warn', summary: '¡Error!', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 }))
      .finally(() => {
        setItem(emptyItem)
        setLoading1(false)
      })
  };

  const saveItem = () => {
    setSubmitted(true)
    if (!item.name || !item.category) {
      return toast.current?.show({ severity: 'warn', summary: '¡Alerta!', detail: 'Faltan llenar uno o más campos', life: 3000 });
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
    let val = (e.target && e.target.value) || '';
    let _item = { ...item };
    _item[`${name}`] = val;

    // Calcular el IVA si y solo si el campo que se cambió es 'precio'
    if (name === 'precio') {
        const precio = parseFloat(val) || 0; // Debe ser un número
        const porcentajeIva = parseFloat(item.porcen_iva) / 100 || 0; // Convertir el valor del IVA a un decimal (ej. 5% -> 0.05)
        const iva = (precio * porcentajeIva).toFixed(2); // Calcula el IVA con el 5%
        _item.iva = iva; // Establece el IVA calculado
    }

          // Si el campo es la categoría, también actualiza el category_id y el código de barra
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id === val); // Encuentra la categoría seleccionada
      if (selectedCategory) {
          _item.category_id = selectedCategory.id; // Actualiza el id de la categoría
          _item.codbarra = selectedCategory.id; // Asigna el id de la categoría al código de barra
      }
  }

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
    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Ítems eliminados', life: 3000 });
  };

  const hideDeleteItemsDialog = () => {
    setDeleteItemsDialog(false);
  };

  const statusBodyTemplate = (rowData) => {
    const showStatus = rowData.status
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

  const statusRowFilterTemplate = (options) => <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterApplyCallback(e.value)} itemTemplate={statusItemTemplate} placeholder="Estado" className="p-column-filter" showClear style={{ minWidth: '10em' }} />


  const categoryBodyTemplate = (rowData) => rowData?.category?.description

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Editar" tooltipOptions={{ position: 'bottom' }} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDeleteItem(rowData)} tooltip="Eliminar" tooltipOptions={{ position: 'bottom' }} />
      </>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Productos</h5>

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
  const deleteItemDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" type="submit" onClick={hideDeleteItemDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteItem} />
    </>
  );
  const deleteItemsDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteItemsDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedItems} />
    </>
  )

  let broadcrumbData = { label: 'Productos', icon: 'pi pi-fw pi-eye', url: routes.products };
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
              currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} ítems"
              filters={filters}
              filterDisplay="row"
              globalFilterFields={['name', 'category.description', 'codproducto', 'codbarra', 'descripcion', 'marca', 'existencia', 'status', 'precio', 'iva', 'porcen_iva', 'url']}
              emptyMessage="No se encontraron productos."
              header={header}
              size='small'
              removableSort
            >             
              <Column field="name" header="Nombre" sortable filter filterField='name' filterPlaceholder="Nombre"></Column>
              <Column field="category.description" header="Categoría" sortable filter filterField='category.description' filterPlaceholder="Categoría" body={categoryBodyTemplate}></Column>
              <Column field="codbarra" header="CP" sortable filter filterField='codbarra' filterPlaceholder="Cod. producto"></Column>
              <Column field="descripcion" header="Descripción" sortable filter filterField='descripcion' filterPlaceholder="Descripción"></Column>
              <Column field="marca" header="Marca" sortable filter filterField='marca' filterPlaceholder="Marca"></Column>
              <Column field="existencia" header="Stock" sortable filter filterField='existencia' filterPlaceholder="Stock"></Column>
              <Column field="status" header="Estado" showFilterMenu={false} body={statusBodyTemplate} filter filterElement={statusRowFilterTemplate}></Column>
              <Column field="precio" header="Precio" sortable filter filterField='precio' filterPlaceholder="Precio"></Column>
              <Column field="iva" header="IVA" sortable filter filterField='iva' filterPlaceholder="IVA"></Column>
              <Column field="porcen_iva" header="%IVA" sortable filter filterField='porcen_iva' filterPlaceholder="%"></Column>
              <Column field="url" header="URL de la Imagen" sortable filter filterField='url' filterPlaceholder="url"></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog draggable={false} resizable={false} maximizable visible={itemDialog} style={{ width: '600px' }} header={nuevo ? 'Nuevo Producto' : 'Editar Producto'} modal className="p-fluid" footer={itemDialogFooter} onHide={hideDialog}>
              <div className="formgrid grid">

                <div className={classNames({ 'p-input-filled': item.name }, 'field col')}>
                  <label htmlFor="name">Nombre(s)</label>
                  <InputText
                    id="name"
                    value={item.name}
                    onChange={(e) => onInputChange(e, 'name')}
                    required
                    autoFocus
                    className={classNames({ 'p-invalid': submitted && !item.name })} placeholder="Red Bull" />
                  {submitted && !item.name && <small className="p-invalid p-error">El NOMBRE es requerido.</small>}
                </div>

                <div className={classNames({ 'p-input-filled': item.category }, 'field col')}>
                  <label>Categoría</label>
                  <Dropdown
                    value={item.category}
                    onChange={(e) => {
                      onInputChange(e, 'category'); // Actualizamos la categoría
                    }}
                    options={categories.sort((a, b) => a.description.localeCompare(b.description))} // Ordena alfabéticamente
                    optionLabel="description"
                    optionValue="id"
                    placeholder="Selecciona la categoría"
                    className={classNames({ 'p-invalid': submitted && !item.category })}
                  />
                  {submitted && !item.category && <small className="p-invalid p-error">La CATEGORÍA es requerida.</small>}
                </div>
              </div>

              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.codbarra }, 'field col')}>
                  <label htmlFor="codbarra">Código de Producto</label>
                  <InputText
                    id="codbarra"
                    value={item.codbarra}
                    onChange={(e) => onInputChange(e, 'codbarra')}
                    required                    
                    className={classNames({ 'p-invalid': submitted && !item.codbarra })} placeholder="Código de Producto" />
                  {submitted && !item.codbarra && <small className="p-invalid p-error">El CÓDIGO DEL PRODUCTO es requerido.</small>}
                </div>
              </div>

              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.descripcion }, 'field col')}>
                  <label>Descripción</label>
                  <InputText
                    id="descripcion"
                    value={item.descripcion}
                    onChange={(e) => onInputChange(e, 'descripcion')}
                    placeholder="Descripción"
                    className={classNames({ 'p-invalid': submitted && !item.descripcion })} />
                  {submitted && !item.descripcion && <small className="p-invalid p-error">La DESCRIPCIÓN es requerida.</small>}
                </div>
                <div className={classNames({ 'p-input-filled': item.marca }, 'field col')}>
                  <label>Marca</label>
                  <InputText
                    id="marca"
                    value={item.marca}
                    onChange={(e) => onInputChange(e, 'marca')}
                    placeholder="Marca"
                    className={classNames({ 'p-invalid': submitted && !item.marca })} />
                  {submitted && !item.marca && <small className="p-invalid p-error">La MARCA es requerida.</small>}
                </div>
              </div>

              <div className="formgrid grid">
              <div className={classNames({ 'p-input-filled': item.existencia }, 'field col')}>
                  <label>Stock</label>
                  <InputText
                    id="existencia"
                    value={item.existencia}
                    onChange={(e) => onInputChange(e, 'existencia')}
                    placeholder={999}
                    className={classNames({ 'p-invalid': submitted && !item.existencia })} />
                  {submitted && !item.existencia && <small className="p-invalid p-error">El STOCK es requerido.</small>}
                </div>

                <div className={classNames({ 'p-input-filled': item.precio }, 'field col')}>
                  <label>Precio</label>
                  <InputText
                    id="precio"
                    value={item.precio}
                    onChange={(e) => onInputChange(e, 'precio')}
                    placeholder="Precio"
                    className={classNames({ 'p-invalid': submitted && !item.precio })} />
                  {submitted && !item.precio && <small className="p-invalid p-error">El PRECIO es requerido.</small>}
                </div>
              </div>

              <div className="formgrid grid">
              <div className={classNames({ 'p-input-filled': item.iva }, 'field col')}>
                  <label>I.V.A.</label>
                  <InputText
                    id="iva"
                    value={item.iva}
                    readOnly 
                    onChange={(e) => onInputChange(e, 'iva')}
                    className={classNames({ 'p-invalid': submitted && !item.iva })} />
                  {submitted && !item.iva && <small className="p-invalid p-error">El IVA es requerido.</small>}
                </div>

                <div className={classNames({ 'p-input-filled': item.porcen_iva }, 'field col')}>
                  <label>% I.V.A.</label>
                  <Dropdown
                    id="iva"
                    value={item.porcen_iva}
                    onChange={(e) => onInputChange(e, 'porcen_iva')}
                    options={[
                      { label: '5%', value: '5' },
                      { label: '10%', value: '10' },
                    ]}
                    placeholder="Selecciona IVA"
                    className={classNames({ 'p-invalid': submitted && !item.porcen_iva })}
                  />
                  {submitted && !item.porcen_iva && <small className="p-invalid p-error">El IVA es requerido.</small>}
                </div>
                </div>

              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.url }, 'field col')}>
                  <label>Imagen</label>
                  <InputText
                    id="url"
                    value={item.url}
                    onChange={(e) => onInputChange(e, 'url')}
                    placeholder="Inserta url de imagen"
                    className={classNames({ 'p-invalid': submitted && !item.url })} />
                  {submitted && !item.url && <small className="p-invalid p-error">La URL es requerida.</small>}
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
              </div>
            </Dialog>


            <Dialog visible={deleteItemDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteItemDialogFooter} onHide={hideDeleteItemDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && (
                  <span>
                    ¿Estás seguro que quieres eliminar el Producto N° <b>{item.id}</b>: <b>{item.name}</b>?
                  </span>
                )}
              </div>
            </Dialog>

            <Dialog visible={deleteItemsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteItemsDialogFooter} onHide={hideDeleteItemsDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && <span>¿Estás seguro que quieres eliminar el o los ítems seleccionados?</span>}
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
});

export default Products;
