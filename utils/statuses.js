import React, { useState, useEffect } from 'react';

export const useGetStatus = (props) => {
    const [statuses] = useState(['ACTIVO', 'INACTIVO', 'ELIMINADO']);

    return {
        statuses
    }
}