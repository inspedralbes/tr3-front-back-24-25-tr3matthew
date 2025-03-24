<script setup>
import { getUCuenta } from '@/services/communicationManager';
import { ref } from 'vue';
import { useRouter } from "vue-router";

const form = ref();
const usuario = ref('');
const contraseña = ref('');
const mensajeError = ref("");
const router = useRouter();

async function getUnicaCuenta() {
    try {
        const { valid } = await form.value.validate()
        const Ucuenta = await getUCuenta(usuario.value, contraseña.value);
        if (Ucuenta && valid) {
            router.push("/subir_imagen");
            return alert("Cuenta valida!!");
        }
    }
    catch(error) {
        mensajeError.value = "Cuenta no valida :("
        return alert(mensajeError.value);
    }
}

const vUsuario = ref([
    u => !!u || 'Usuario vacío'
])

const vContraseña = ref([
    c => !!c || 'Contraseña vacía'
])

async function validate() {
    const { valid } = await form.value.validate()

    if(valid) {
        alert('Cuenta aceptada!');
    }
}
</script>

<template>
    <v-form ref="form">
        <v-text-field
        v-model="usuario"
        :rules="vUsuario"
        label = "Usuario">
        </v-text-field>
        <v-text-field
        v-model="contraseña"
        :rules="vContraseña"
        label =  "Contraseña">
        </v-text-field>
        <v-btn
        @click="getUnicaCuenta">
            Ingresar
        </v-btn>
    </v-form>
</template>

<style scoped>

</style>