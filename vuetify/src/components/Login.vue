<script setup>
import { getUCuenta } from '@/services/communicationManager';
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { useUserStore } from '@/stores/cuentaID';

const form = ref();
const usuario = ref('');
const contraseña = ref('');
const mensajeError = ref("");
const router = useRouter();
const userStore = useUserStore();

async function getUnicaCuenta() {
    try {
        const { valid } = await form.value.validate()
        const Ucuenta = await getUCuenta(usuario.value, contraseña.value);
        if (Ucuenta && valid) {
            userStore.setUsername(usuario.value);
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
</script>

<template>
  <div class="login-background">
    <v-container class="fill-height d-flex justify-center align-center">
      <v-card class="pa-8" width="400" elevation="10">
        <v-form ref="form">
          <v-text-field
            v-model="usuario"
            :rules="vUsuario"
            label="Usuario"
          ></v-text-field>
          <v-text-field
            v-model="contraseña"
            type="password"
            :rules="vContraseña"
            label="Contraseña"
          ></v-text-field>
          <v-btn
            class="mt-4"
            color="primary"
            block
            @click="getUnicaCuenta"
          >
            Ingresar
          </v-btn>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.login-background {
  background-color: #E6E6FA;
  height: 100vh;
  width: 100%;
}
</style>
