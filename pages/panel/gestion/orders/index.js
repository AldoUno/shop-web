import Guia from '../../../../utils/broadcrumb';
import routes from '../../../../utils/routes';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { List, Edit, Submit } from '../../../../utils/service/fetchData';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { Divider } from "primereact/divider";
import { addLocale } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { getSeverityGestion } from '../../../../constants/GET_SEVERITY';


const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('es-ES') : 'Sin fecha';
};

const dateBodyTemplate = (rowData) => {
  return formatDate(rowData.created_at);
};

const STATUS_TYPES = {
  ACTIVO: 1,
  PREPARACION: 2,
  CONFIRMADO: 3,
};
const Orders = () => {
  const initialValues = {
    products: [],
    user_id: null,
    deliveryDate: null,
    date: null
  };

  const toast = useRef(null);
  const dt = useRef(null);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(initialValues);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [dates, setDates] = useState('');
  const calendar = useRef(null);

  // LAZY IMPLEMENTATION
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
    filters: {
      id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      "user.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      "status.description": { value: '', matchMode: FilterMatchMode.EQUALS },
      date: { value: [] }
    }
  });

  addLocale('es', {
    firstDayOfWeek: 1,
    showMonthAfterYear: true,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Limpiar'
  });

  const [statuses] = useState([
    { label: 'Activo' },
    { label: 'Preparacion' },
    { label: 'Confirmado' }
  ]);

  const controller = new AbortController();
  const { signal } = controller;

  useEffect(() => {
    let timerId;
    const loadLazyData = () => {
      let params = { lazyEvent: JSON.stringify(lazyState) };

      const queryParams = params
        ? Object.keys(params)
          .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&')
        : '';

      getFilterOrders(queryParams);
    };

    timerId = setTimeout(loadLazyData, 500);
    setSelectedItems([]);

    return () => clearTimeout(timerId);
  }, [lazyState]);

  useEffect(() => {
    if (dates?.length > 1 && dates[0] && dates[1]) {
      setLazyState({
        ...lazyState,
        filters: {
          ...lazyState.filters,
          ['date']: {
            value: dates
          }
        }
      });
      setSelectedItems([]);

      calendar?.current?.hide();
    } else if (dates === null) {
      setLazyState({
        ...lazyState,
        filters: {
          ...lazyState.filters,
          ['date']: {
            value: []
          }
        }
      });

      setSelectedItems([]);
    }
  }, [dates]);

  const getFilterOrders = (queryParams) => {
    setLoading1(true);
    List(`filterOrders?${queryParams}`, signal)
      .then(async response => {
        if (response.status === 200) {
          return response.json();
        } else {
          const { msg } = await response.json();
          throw new Error(msg);
        }
      })
      .then(data => {
        const new_data = data.data.map(item => ({
          ...item,
        }));
        setItems(new_data);
        setTotalRecords(data.totalRecords);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 });
        }
        setItems([]);
      })
      .finally(() => {
        setLoading1(false);
      });
  };

  const onPage = (event) => {
    setLazyState(event);
  };

  const onSort = (event) => {
    setLazyState(event);
  };

  const onFilter = (event) => {
    event['first'] = 0;
    setLazyState(event);
  };

  const statusItemTemplate = (option) => <Tag value={option.label} severity={getSeverityGestion(option.label)} />;

  const statusRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        onChange={(e) => options.filterApplyCallback(e.value)}
        itemTemplate={statusItemTemplate}
        emptyFilterMessage="Sin resultados"
        options={statuses}
        optionLabel="label"
        placeholder="Estado" className="p-column-filter" showClear style={{ minWidth: '10em' }}
      />
    );
  };

  const separacionDeMilesPrice = (rowData) => rowData?.price ? rowData.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 0;

  const getSubtotal = (rowData) => rowData.subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const getTotal = () => {
    let amount = 0;

    if (item.order_detail && Array.isArray(item.order_detail) && item.order_detail.length > 0) {
      amount = item.order_detail.reduce((acc, detail) => {
        return acc + parseFloat(detail.subtotal);
      }, 0);
    }

    return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getFormatState = (rowData) => {
    if (rowData?.status?.description === 'Activo') return <span className={`usuario-badge status-activo`} style={{ backgroundColor: '#ffc107', color: 'white' }}>{rowData?.status?.description}</span>;
    if (rowData?.status?.description === 'Preparacion') return <span className={`usuario-badge status-preparacion`} style={{ backgroundColor: '#007bff', color: 'white' }}>{rowData?.status?.description}</span>;
    if (rowData?.status?.description === 'Confirmado') return <span className={`usuario-badge status-confirmado`} style={{ backgroundColor: '#28a745', color: 'white' }}>{rowData?.status?.description}</span>;
  };

  const dateFilterTemplate = () => <Calendar ref={calendar} dateFormat='dd/mm/yy' locale='es' value={dates} onChange={(e) => setDates(e.value)} selectionMode="range" readOnlyInput showButtonBar placeholder='Desde-Hasta' />;

  const editItem = async (rowData) => {
    setItem(rowData);
    setItemDialog(true);
  };

  const stateChange = () => {
    setLoading1(true);

    const itemsId = selectedItems.map(item => item.id);
    const dataToSend = {
      ids: itemsId,
      status_id: STATUS_TYPES.CONFIRMADO
    };

    Submit(dataToSend, 'update-orders-status')
      .then(async response => {
        if (response.ok) {
          return response.json();
        } else {
          const { msg } = await response.json();
          throw new Error(msg);
        }
      })
      .then(data => {
        toast.current?.show({ severity: 'success', summary: 'Éxito!', detail: data.message || "Las órdenes se migraron correctamente", life: 3000 });
        setLazyState({
          ...lazyState,
          filters: {
            ...lazyState.filters,
          }
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 });
        }

        setLoading1(false);
      });
  };

  const uniqueOrderChangeState = (status_id) => {
    setItemDialog(false);
    setLoading1(true);
    const item_to_send = {
      status_id
    };
    Edit(item_to_send, 'update-order', item.id)
      .then(async response => {
        if (response.ok) {
          return response.json();
        } else {
          const { msg } = await response.json();
          throw new Error(msg);
        }
      })
      .then(data => {
        toast.current?.show({ severity: 'success', summary: 'Éxito!', detail: data.message || "La órden ha sido actualizada", life: 3000 });
        setLazyState({
          ...lazyState,
          filters: {
            ...lazyState.filters,
          }
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          toast.current?.show({ severity: 'warn', summary: 'Error !', detail: error.message || "Error en el servidor. Contacte a soporte", life: 3000 });
        }
        setLoading1(false);
      });
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Órdenes</h5>

      <div className="flex flex-wrap mt-2 md:mt-0">
        <Button label="Migrar Órdenes" icon="pi pi-send" className="mr-2" disabled={!(selectedItems.length > 0)}
          onClick={() => stateChange()}
        />
      </div>
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button icon="pi pi-search-plus" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Visualizar" tooltipOptions={{ position: 'bottom' }} />
      </>
    );
  };

  const itemDialogFooter = (
    <div style={{ marginTop: '1rem' }}>
      <Button
        severity='info'
        label="Preparacion"
        icon="pi pi-thumbs-up"
        className="col-4"
        onClick={() => uniqueOrderChangeState(STATUS_TYPES.PREPARACION)}
        disabled={!(item?.status?.id === STATUS_TYPES.ACTIVO)}
      />
      <Button
        severity='success'
        label="Confirmar"
        icon="pi pi-check"
        className="col-4"
        onClick={() => uniqueOrderChangeState(STATUS_TYPES.CONFIRMADO)}
        disabled={!(item?.status?.id === STATUS_TYPES.PREPARACION)}
      />
      
    </div>
  );

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column footer="Total:" colSpan={4} footerStyle={{ textAlign: 'right' }} />
        <Column footer={getTotal} />
      </Row>
    </ColumnGroup>
  );

  let broadcrumbData = { label: 'Gestión', icon: 'pi pi-fw pi-eye', url: routes.orders };

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
              className="datatable-responsive alternar"
              filters={lazyState.filters}
              filterDisplay="row"
              emptyMessage="No se encontraron registros."
              header={header}
              size='small'
              lazy
              first={lazyState.first}
              totalRecords={totalRecords}
              onPage={onPage}
              onSort={onSort}
              sortField={lazyState.sortField}
              sortOrder={lazyState.sortOrder}
              onFilter={onFilter}
              selectionMode='checkbox'
              selection={selectedItems}
              onSelectionChange={(e) => setSelectedItems(e.value)}
            >
              <Column field="columnCheck" className='column__check' selectionMode="multiple" headerStyle={{ width: '4rem' }} ></Column>
              <Column field="id" header="Código" filter filterField='id' filterPlaceholder="Código" style={{ maxWidth: '4rem' }}></Column>
              <Column field="user.name" header="Cliente" filter filterField='user.name' filterPlaceholder="Cliente"></Column>
              <Column field="created_at" header="Fecha de Solicitud" filter filterField='created_at' showClearButton filterPlaceholder="Fecha de Solicitud" style={{ minWidth: '17rem' }} filterElement={dateFilterTemplate} body={dateBodyTemplate} ></Column>
              <Column field="status.description" header="Estado" filter filterField='status.description' filterPlaceholder="Estado" body={getFormatState} filterElement={statusRowFilterTemplate}></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>

            <Dialog draggable={false} resizable={false} maximizable visible={itemDialog} style={{ width: '800px', maxWidth: '100%' }} header="Detalles de la orden" modal className="p-fluid" footer={itemDialogFooter} onHide={() => setItemDialog(false)}>
            <div className="formgrid grid">
            <div className={classNames({ 'p-input-filled': item.user?.cedula }, 'field col-12 md:col-4')}>
              <label htmlFor="user.cedula">Cédula</label>
              <InputText
                id="user.cedula"
                value={item.user?.cedula || ''}
                disabled />
            </div>
            <div className={classNames({ 'p-input-filled': item.user?.name }, 'field col-12 md:col-4')}>
              <label htmlFor="user.name">Denominación</label>
              <InputText
                id="user.name"
                value={`${item.user?.name || ''} ${item.user?.surname || ''}`}
                disabled />
            </div>
          </div>
              <Divider align="left" className='mb-5 mt-5'>
                <div className="inline-flex align-items-center">
                  <i className="pi pi-list mr-2"></i>
                  <b>Detalles de productos</b>
                </div>
              </Divider>

              <div>
                <DataTable key={item.order_detail?.id} value={item.order_detail} emptyMessage='Sin registros' footerColumnGroup={footerGroup}>
                  <Column field="product.codbarra" header="Cod Producto"></Column>
                  <Column field="product.descripcion" header="Descripción"></Column>
                  <Column field="quantity" header="Cantidad"></Column>
                  <Column field="price" header="Precio" body={separacionDeMilesPrice}></Column>
                  <Column field="subtotal" header="Subtotal" body={getSubtotal}></Column>
                </DataTable>
              </div>

            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;
