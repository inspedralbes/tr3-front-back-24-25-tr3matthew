<template>
  <div>
    <h1>{{ mensaje }}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mensaje: "",
    };
  },
  async mounted() {
    try {
      const respuesta = await fetch("http://localhost:3000/mensaje");
      const datos = await respuesta.json();
      this.mensaje = datos.mensaje;
    } catch (error) {
      console.error("Error al obtener el mensaje:", error);
    }
  },
};
</script>
