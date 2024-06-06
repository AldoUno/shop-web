import { NextResponse } from "next/server"
import routes from "./utils/routes"
import { jwtVerify } from "jose"
import { SECRET } from "./utils/environment"

const isTokenExpired = (dateExpiration) => {
    if (dateExpiration <= Math.floor(Date.now() / 1000)) return true;
    return false
}

export async function middleware(request) {
    const jwt = request.cookies.get('token')
    const loginUrl = new URL(routes.login, request.url)

    // =================POR DEFECTO REDIRECCIONA "/" =>  "/DEVOLUCIONES/INICIO" =================
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === routes.base) {
        return NextResponse.redirect(new URL(routes.inicio, request.url))
    }

    // =========PARA INGRESAR EN EL LOGIN VERIFICA QUE NO EXISTA EL TOKEN Y SI EXISTE LO VALIDA=====
    if (request.nextUrl.pathname.includes(routes.login)) {

        if (jwt) {
            try {
                const { payload } = await jwtVerify(jwt.value, new TextEncoder().encode(SECRET))
                if (!isTokenExpired(payload.exp)) return NextResponse.redirect(new URL(routes.inicio, request.url))
            } catch (error) {
                return NextResponse.next()
            }
        }
        return NextResponse.next()
    }

    // ======PARA NAVEGAR EN EL SISTEMA VERIFICA QUE EXISTA EL TOKEN Y QUE SEA VALIDO========
    if (request.nextUrl.pathname.includes(routes.base)) {

        if (jwt === undefined) {
            loginUrl.searchParams.append('mensaje', 'Necesitas iniciar sesión para continuar');
            return NextResponse.redirect(loginUrl)
        }
        try {

            const { payload } = await jwtVerify(jwt.value, new TextEncoder().encode(SECRET))
            if (isTokenExpired(payload.exp)) {
                loginUrl.searchParams.append('mensaje', 'Necesitas iniciar sesión para continuar');
                return NextResponse.redirect(loginUrl)
            }
        } catch (error) {
            loginUrl.searchParams.append('mensaje', 'Necesitas iniciar sesión para continuar');
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}