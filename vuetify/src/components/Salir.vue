<script setup>
    import { useRouter } from "vue-router";
    import { useUserStore } from "@/stores/cuentaID"

    const router = useRouter();
    const userStore = useUserStore();
    function salirCuenta() {
        userStore.logout();
        router.push("/");
    }

</script>

<template>
    <v-btn
    @click="salirCuenta">
        Salir
    </v-btn>
</template>

<style scoped>

</style>