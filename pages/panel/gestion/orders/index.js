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
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { Divider } from "primereact/divider";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { List, Get, Edit, Delete, Submit } from '../../../../utils/service/fetchData';
import { addLocale } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import { getCookie } from 'cookies-next';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { STATUS_TYPES } from '../../../../constants/STATUS_TYPES';
import { getSeverityGestion } from '../../../../constants/GET_SEVERITY';
import { ORDER_ACTIONS } from '../../../../constants/ORDER_ACTIONS';

const Orders = () => {
  const initialValues = {
    products: [],
    client_id: null,
    currency_id: 1,
    deliveryDate: null,
    date: null
  }

  const toast = useRef(null);
  const dt = useRef(null);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(initialValues);
  const [selectedItems, setSelectedItems] = useState([])
  const [loading1, setLoading1] = useState(false);
  const [itemChangeDialog, setItemChangeDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [messageConfirm, setMessageConfirm] = useState('')
  const [dates, setDates] = useState('')
  const calendar = useRef(null)

  // LAZY IMPLEMENTATION
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
    filters: {
      id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      "client.razon_social": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      "status.description": { value: {label: 'Confirmado'}, matchMode: FilterMatchMode.EQUALS },
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
    { label: 'Preparacion' },
    { label: 'Enviado' },
    { label: 'Resivido' },
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
    setlazyState(event);
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
    if (rowData?.status?.description === 'Preparacion') return <span className={`usuario-badge status-borrador`}>{rowData?.status?.description}</span>;
    if (rowData?.status?.description === 'Enviado') return <span className={`usuario-badge status-activo`}>{rowData?.status?.description}</span>;
    if (rowData?.status?.description === 'Resivido') return <span className={`usuario-badge status-preparacion`}>{rowData?.status?.description}</span>;
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
      status_id: STATUS_TYPES.MIGRADO      
    };

    fetch('/api/shop/update-orders-status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getCookie('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
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
            "status.description": { value: { label: 'En camino' }, matchMode: FilterMatchMode.EQUALS },
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
    </div>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button icon="pi pi-search-plus" className="p-button-rounded p-button-success mr-2" onClick={() => editItem(rowData)} tooltip="Visualizar" tooltipOptions={{ position: 'bottom' }} />
      </>
    );
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

  const hideItemChangeDialog = () => {
    setItemChangeDialog(false);
  };

  const itemChangeDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" className="p-button-text" type="submit" onClick={hideItemChangeDialog} />
      <Button label="Si" icon="pi pi-check" className="p-button-text" />
    </>
  );

  const itemDialogFooter = (
    <div style={{ marginTop: '1rem' }}>
      <Button
        severity='info'
        label="Preparación"
        icon="pi pi-thumbs-up"
        className="col-4"
        disabled={!(item?.status?.id === STATUS_TYPES.PREPARACION)}
      />
      <Button
        severity='success'
        label="Enviado"
        icon="pi pi-check"
        className="col-4"
        disabled={!(item?.status?.id === STATUS_TYPES.ENVIADO)}
      />
      <Button
        severity='warning'
        label="Resivido"
        icon="pi pi-send"
        className="col-4"
        disabled={!(item?.status?.id === STATUS_TYPES.RECIBIDO)}
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
              <Column className='column__check' selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
              <Column field="id" header="Código" filter filterField='id' filterPlaceholder="Código" style={{ maxWidth: '4rem'}}></Column>
              <Column field="client.razon_social" header="Cliente" filter filterField='client.razon_social' filterPlaceholder="Cliente"></Column>
              <Column field="date" header="Fecha de Solicitud" filter filterField='date' showClearButton filterPlaceholder="Fecha de Solicitud" style={{ minWidth: '17rem' }} filterElement={dateFilterTemplate}></Column>
              <Column field="status.description" header="Estado" filter filterField='status.description' filterPlaceholder="Estado" body={getFormatState} filterElement={statusRowFilterTemplate}></Column>
              <Column field="acciones" header="Acciones" body={actionBodyTemplate}></Column>
            </DataTable>
            
            <Dialog draggable={false} resizable={false} maximizable visible={itemDialog} style={{ width: '800px', maxWidth: '100%' }} header="Detalles de la orden" modal className="p-fluid" footer={itemDialogFooter} onHide={() => setItemDialog(false)}>
              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.client?.codigo }, 'field col-12 md:col-4')}>
                  <label htmlFor="client.code">Cod Cliente</label>
                  <InputText
                    id="client.code"
                    value={item.client?.codigo || ''}
                    disabled />
                </div>
                <div className={classNames({ 'p-input-filled': item.client?.razon_social }, 'field col-12 md:col-4')}>
                  <label htmlFor="client.razon_social">Denominación</label>
                  <InputText
                    id="client.razon_social"
                    value={item.client?.razon_social || ''}
                    disabled />
                </div>
                <div className={classNames({ 'p-input-filled': item.client?.ruc }, 'field col-12 md:col-4')}>
                  <label htmlFor="client.ruc">RUC</label>
                  <InputText
                    id="client.ruc"
                    value={item.client?.ruc}
                    disabled />
                </div>
              </div>
              <div className="formgrid grid">
                <div className={classNames({ 'p-input-filled': item.date }, 'field col-12 md:col-3')}>
                  <label htmlFor="date">Fecha</label>
                  <InputText
                    id="date"
                    value={item.date || ''}
                    disabled />
                </div>
                <div className={classNames({ 'p-input-filled': item.status }, 'field col-12 md:col-3')}>
                  <label className='mb-3'>Estado</label> <br />
                  {getFormatState(item)}
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

            <Dialog visible={itemChangeDialog} style={{ width: '450px' }} header="Confirmar" modal footer={itemChangeDialogFooter} onHide={hideItemChangeDialog}>
              <div className="flex align-items-center justify-content-center">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {item && (
                  <span>
                    Estás seguro que quieres <b>{messageConfirm?.toUpperCase()}</b> el registro nro. <b>{item.id}</b>?
                  </span>
                )}
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;
