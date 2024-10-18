export const getSeverityGestion = (status) => {
  switch (status) {
    
    case 'Activo':
      return 'warning';

    case 'Preparacion':
      return 'info';

    case 'Confirmado':
      return 'success';
    
  }
};


const getFormatState = (rowData) => {
  return (
    <Tag 
      value={rowData?.status?.description} 
      severity={getSeverity(rowData?.status?.description)} 
    />
  );
};

export const getSeverity = (status) => {
  switch (status) {
    case 'ACTIVO':
      return 'success';

    case 'INACTIVO':
      return 'warning';
  }
};

export const GET_STATUS = ['ACTIVO', 'INACTIVO']