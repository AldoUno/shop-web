export const getSeverity = (status) => {
    switch (status) {
        case 'ACTIVO':
            return 'success';

        case 'INACTIVO':
            return 'warning';

        case '0':
            return 'danger';
    }
};

export const getSeverityEncuesta = (status) => {
    switch (status) {
        case 'APROBADO':
            return 'success';

        case 'PENDIENTE':
            return 'warning';

        case 'RECHAZADO':
            return 'danger';
    }
};