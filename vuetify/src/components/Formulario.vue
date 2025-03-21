<script setup>
import { ref } from "vue";

const cuentaID = ref("");
const imagen = ref(null);
const mensaje = ref("");
const mensajeTipo = ref("info");

const subirImagen = async () => {
  if (!imagen.value || imagen.value.length === 0 || !cuentaID.value) {
    mensaje.value = "⚠️ Debes seleccionar una imagen y escribir un ID de cuenta.";
    mensajeTipo.value = "warning";
    return;
  }

  const formData = new FormData();
  console.log("Archivo seleccionado:", imagen.value); // Verificar archivo
  formData.append("imagen", imagen.value); // Enviar imagen

  try {
    const response = await fetch(`http://localhost:3000/imagenes/${cuentaID.value}`, {
      method: "POST",
      body: formData, // NO agregues manualmente Content-Type
    });

    const data = await response.json();
    if (response.ok) {
      mensaje.value = `✅ Imagen subida con éxito: ${data.ruta}`;
      mensajeTipo.value = "success";
    } else {
      mensaje.value = `❌ Error: ${data.error}`;
      mensajeTipo.value = "error";
    }
  } catch (error) {
    mensaje.value = "❌ Error de conexión con el servidor.";
    mensajeTipo.value = "error";
  }
};
</script>

<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title>Subir Imagen</v-card-title>

      <v-text-field v-model="cuentaID" label="ID de la cuenta" type="number" outlined dense></v-text-field>

      <v-file-input v-model="imagen" label="Seleccionar imagen" accept="image/*" outlined dense></v-file-input>

      <v-btn color="primary" block @click="subirImagen">Subir Imagen</v-btn>

      <v-alert v-if="mensaje" :type="mensajeTipo" class="mt-3">
        {{ mensaje }}
      </v-alert>
    </v-card>
  </v-container>
</template>
