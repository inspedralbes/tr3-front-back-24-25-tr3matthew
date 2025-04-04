const URL = import.meta.env.VITE_API_URL_NODE

export async function getCuentas() {
    try {
        const cuenta = await fetch(`${URL}/Fcuentas`);
        if (!cuenta.ok) {
            throw new Error(`Error al obtener las cuentas: ${cuenta.status}`);
        }
        else {
            const resposte = await cuenta.json();
            console.log(resposte);
            return resposte;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager Fcuentas: ", error);
        throw error;
    }
}

export async function getUCuenta(username, password) {
    try {
        const Ucuenta = await fetch(`${URL}/FcuentasU?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
            console.log("Respuesta del servidor:", Ucuenta);
            if(!Ucuenta.ok) {
            throw new Error(`Error al obtener la cuenta: ${Ucuenta.status}`);
        }
        else {
            const resposte = await Ucuenta.json();
            console.log(resposte);
            return resposte;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager FcuentasU: ", error);
        throw error;
    }
}

export async function postCuenta(username, password) {
    try {
        const cuentaN = await fetch(`${URL}/cuentas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        if(!cuentaN.ok) {
            const errorCuenta = await cuentaN.json();
            throw new Error(`Error al crear la cuenta: ${errorCuenta}`);
        }
        else {
            const nuevaCuenta = await cuentaN.json();
            return nuevaCuenta;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager Ccuentas: ", error);
        throw new error;
    }
}

export async function updateCuenta(username, password) {
    try {
        const cuentaM = await fetch(`${URL}/cuentas/${username}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username, 
                password: password
            })
        });
        if(!cuentaM.ok) {
            const errorCuenta = await cuentaM.json();
            throw new Error(`Error al crear la cuenta: ${errorCuenta}`);
        }
        else {
            const cuentaModif = await cuentaM.json();
            return cuentaModif;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager Mcuentas: ", error);
        throw new error;
    }
}

export async function deleteCuenta(username) {
    try {
        const cuentaE = await fetch(`${URL}/cuentas/${username}`, {
            method: 'DELETE',
        });
        if(!cuentaE.ok) {
            const errorCuenta = await cuentaE.json();
            throw new Error(`Error al crear la cuenta: ${errorCuenta}`);
        }
        else {
            const cuentaElim = await cuentaE.json();
            return cuentaElim;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager Dcuentas: ", error);
        throw new error;
    }
}

export async function getImagen() {
    try {
        const imagen = await fetch(`${URL}/imagenes`);
        if(!imagen.ok) {
            const errorImagen = await imagen.json();
            throw new Error(`Error al obtener las imagenes: ${errorImagen}`);
        }
        else {
            const imagenN = await imagen.json();
            return imagenN;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager GImagenes: ", error);
        throw new error;
    }
}

export async function getImagenU(CuentaID) {
    try {
        const imagenU = await fetch(`${URL}/imagenes/${CuentaID}`);
        if(!imagenU.ok) {
            const errorImagen = await imagenU.json();
            throw new Error(`Error al obtener la imagen: ${errorImagen}`);
        }
        else {
            const imagenUnica = await imagenU.json();
            return imagenUnica;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager GImagenU: ", error);
        throw new error;
    }
}

export async function postImagenU(cuentaID, imagen) {
    try {
        const formData = new FormData();
        formData.append("imagen", imagen);

        const NImagenU = await fetch (`${URL}/imagenes/${cuentaID}`, {
            method: 'POST',
            body: formData
        });
        if(!NImagenU.ok) {
            const errorImagen = await NImagenU.json();
            throw new Error(`Error al publicar la imagen: ${errorImagen}`);
        }
        else {
            const imagenN = await NImagenU.json();
            return imagenN;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager PImagenU: ", error);
        throw error;
    }
}

export async function deleteImagen(id) {
    try {
        const DImagenN = await fetch(`${URL}/imagenes/${id}`, {
            method: 'DELETE',
        });
        if(!DImagenN.ok) {
            const errorImagen = await DImagenN.json();
            throw new Error(`Error al publicar la imagen: ${errorImagen}`);
        }
        else {
            const deleteImagenU = await DImagenN.json();
            return deleteImagenU;
        }
    }
    catch(error) {
        console.error("Error en Communication Manager DImagenN: ", error);
        throw new error;
    }
    
}