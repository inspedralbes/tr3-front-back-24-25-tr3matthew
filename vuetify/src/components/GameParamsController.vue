<script setup>
  import { ref, onMounted } from 'vue';
  
  const speed = ref(10);
  const saltosMaximos = ref(1);
  let ws = null;
  
  const initWebSocket = () => {
    ws = new WebSocket('ws://localhost:3000');
  
    ws.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };
  
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'PARAMS_UPDATED') {
        speed.value = data.speed;
        saltosMaximos.value = data.saltosMaximos;
      }
    };
  };
  
  const updateParams = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'UPDATE_PARAMS',
        data: {
          speed: speed.value,
          saltosMaximos: saltosMaximos.value
        }
      }));
    }
  };
  
  onMounted(() => {
    initWebSocket();
  });
  </script>
  <template>
    <v-card class="ma-4" width="300">
      <v-card-title>Control de Jugador</v-card-title>
      <v-card-text>
        <v-slider
          v-model="speed"
          label="Velocidad"
          min="1"
          max="20"
          step="0.5"
          @update:modelValue="updateParams"
        ></v-slider>
  
        <v-select
          v-model="saltosMaximos"
          label="Saltos Máximos"
          :items="[1, 2, 3, 4, 5]"
          @update:modelValue="updateParams"
        ></v-select>
      </v-card-text>
    </v-card>
  </template>
  
  