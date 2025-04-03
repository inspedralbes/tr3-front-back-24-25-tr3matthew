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

<!--<script setup>
  import { ref } from 'vue'

  const form = ref()

  const items = [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
  ]

  const name = ref('')
  const nameRules = ref([
    v => !!v || 'Name is required',
    v => (v && v.length <= 10) || 'Name must be 10 characters or less',
  ])
  const select = ref(null)
  const checkbox = ref(false)

  async function validate () {
    const { valid } = await form.value.validate()

    if (valid) {
      alert('Form is valid')
    }
  }
</script>
<template>
  <v-sheet class="mx-auto" width="300">

    <v-form ref="form">
      <v-text-field
        v-model="name"
        :counter="10"
        :rules="nameRules"
        label="Name"
        required
      ></v-text-field>

      <v-select
        v-model="select"
        :items="items"
        :rules="[v => !!v || 'Item is required']"
        label="Item"
        required
      ></v-select>

      <v-checkbox
        v-model="checkbox"
        :rules="[v => !!v || 'You must agree to continue!']"
        label="Do you agree?"
        required
      ></v-checkbox>

      <div class="d-flex flex-column">
        <v-btn
          class="mt-4"
          color="success"
          block
          @click="validate"
        >
          Validate
        </v-btn>

        <v-btn
          class="mt-4"
          color="error"
          block
          @click="reset"
        >
          Reset Form
        </v-btn>

        <v-btn
          class="mt-4"
          color="warning"
          block
          @click="resetValidation"
        >
          Reset Validation
        </v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>-->