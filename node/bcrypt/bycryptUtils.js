import bcrypt from 'bcryptjs';
import { error } from 'node:console';

const saltRounds = 12;

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
    const validacion = await bcrypt.compare(password, hashedPassword);
    if (validacion) {
        return validacion;
    }
    else {
        throw new Error(`No es válida la contraseña: `, password)
    }
}