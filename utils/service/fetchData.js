import { API_ENDPOIND } from '../environment';
import { API_VERSION } from '../environment';
import { getCookie } from 'cookies-next';

export const LoginInit = async (body) => {
    return fetch(`${API_ENDPOIND}/login`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
};

export const SendEmailToResetPassword = async (body) => {
    return fetch(`${API_ENDPOIND}/${API_VERSION}/auth/recover`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
};

export const ResetPassword = async (body, token) => {
    return fetch(`${API_ENDPOIND}/${API_VERSION}/auth/reset/${token}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
};

export const Register = async (body) => {
    return fetch(`${API_ENDPOIND}/register`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const Refresh = async (signal) => {
    return fetch(`${API_ENDPOIND}/refresh`, {
        signal,
        method: 'POST',
        body: JSON.stringify(''),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const Permisions = async (signal) => {
    return fetch(`${API_ENDPOIND}/permisions`, {
        signal,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const Logout = async () => {
    return fetch(`${API_ENDPOIND}/logout`, {
        method: 'POST',
        body: JSON.stringify(''),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const List = (path, signal) => {
    return (
        fetch(`${API_ENDPOIND}/${API_VERSION}/${path}`, {
            signal,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${getCookie('token')}`
            }
        })
    )
}

export const Get = (id, path, signal, module) => fetch(`${API_ENDPOIND}/${API_VERSION}/${path}/${id}`, {
    method: 'GET',
    signal,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Module': module,
        Authorization: `Bearer ${getCookie('token')}`
    }
});

export const GetReport = (start, end, path, signal, module) => fetch(`${API_ENDPOIND}/${API_VERSION}/${path}/${start}/${end}`, {
    method: 'GET',
    signal,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Module': module,
        Authorization: `Bearer ${getCookie('token')}`
    }
})

export const Submit = async (body, path) => {
    return fetch(`${API_ENDPOIND}/${API_VERSION}/${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const Edit = async (body, path, id) => {
    return fetch(`${API_ENDPOIND}/${API_VERSION}/${path}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};

export const Delete = async (id, path,) => {
    return fetch(`${API_ENDPOIND}/${API_VERSION}/${path}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`
        }
    });
};
