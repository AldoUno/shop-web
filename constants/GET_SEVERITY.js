export const getSeverityGestion = (status) => {
  switch (status) {
    case 'Borrador':
      return 'warning';

    case 'Activo':
      return 'success';

    case 'Preparacion':
      return 'info';

    case 'Confirmado':
      return 'success';

    case 'Migrado':
      return 'contrast';
  }
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