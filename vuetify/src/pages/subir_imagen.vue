<script setup>
import { getImagen, postImagenU } from '@/services/communicationManager';
import { ref, onMounted, onUnmounted } from 'vue';
//import { useRouter } from "vue-router";
import { useUserStore } from '@/stores/cuentaID';
//import GameParamsController from '@/components/GameParamsController.vue';
import { deleteImagen } from '@/services/communicationManager';
const form = ref();
//const router = useRouter();
const userStore = useUserStore();
const imagen = ref(null);
const username = ref(userStore.username);
const portadas = ref([]);
const TotalPortadas = ref(0);
const ws = ref(null);

onMounted(() => {
    obtenerImagenes();
    conectarWebSocket();
});

onUnmounted(() => {
    if (ws.value) {
        ws.value.close();
    }
});

const Vimagen = ref([
    i => !!i || 'Imagen vacía'
])

async function eliminarImagen(id) {
    try{
        const DImagen = await deleteImagen(id);
        if (DImagen) {
            console.log("Portada borrada: ", DImagen);
            obtenerImagenes();
        }
    }
    catch (error) {
        console.error("Error al eliminar la imagen", error);
    }
    
}
async function publicarImagen() {
    try {
        const { valid } = await form.value.validate();
        const Uimagen = await postImagenU(username.value, imagen.value);
        if (Uimagen && valid) {
            console.log("Portada subida: ", Uimagen);
        }
    }
    catch (error) {
        console.error("Error al subir la imagen", error);
    }
};
async function obtenerImagenes() {
    try {
        portadas.value = await getImagen();
        if (!portadas.value) {
            console.log("Problema al encontrar imagenes: ");
        }
        else {
            console.log(portadas.value);
        }
    }
    catch (error) {
        console.log("Error al obtener imagenes: ", error);
    }
}

function conectarWebSocket() {
    ws.value = new WebSocket(import.meta.env.VITE_API_URL_NODE.replace("http", "ws"));
    ws.value.onopen = () => {
        console.log("Conectado a WebSocket");
    };

    ws.value.onmessage = (event) => {
        const mensaje = JSON.parse(event.data);

        if (mensaje.type === "NumeroPortadas") {
            TotalPortadas.value = mensaje.data;
            console.log("Número de portadas:", mensaje.data);
        }

        if (mensaje.type === "nuevaImagen") {
            portadas.value.push(mensaje.data);
            obtenerImagenes();
            console.log("Imagen subida:", mensaje.data);
        }
        if (mensaje.type === "imagenEliminada") {
        const idEliminado = mensaje.data;
        obtenerImagenes();
        portadas.value = portadas.value.filter(portada => portada.id != idEliminado);
        console.log("Imagen eliminada:", idEliminado);
        }
    };

    ws.value.onclose = () => {
        console.warn("WebSocket desconectado. Intentando reconectar...");
        setTimeout(conectarWebSocket, 3000);
    };

    ws.value.onerror = (error) => {
        console.error("Error en WebSocket:", error);
    };
}
</script>

<template>
    <Salir />
    <v-form ref="form">
        <v-file-input label="imagen" v-model="imagen" :rules="Vimagen" accept="image/*"></v-file-input>
        <v-btn @click="publicarImagen">
            Subir Portada
        </v-btn>
    </v-form>
    <!--<GameParamsController />-->
    <div id="portadas">
        <div v-for="portada in portadas" :key="portada.id">
            <v-img v-if="portada.url" :src="portada.url" :alt="portada.nombre" />
            <v-btn @click="eliminarImagen(portada.id)">Borrar Imagen</v-btn>
        </div>
    </div>
</template>

<style scoped>
#portadas {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
}
</style>