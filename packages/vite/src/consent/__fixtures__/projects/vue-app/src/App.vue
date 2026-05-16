<template>
  <button @click="track">Track</button>
</template>

<script setup lang="ts">
import posthog from "posthog-js";

posthog.init("phc_xxx", { api_host: "https://app.posthog.com" });

function track() {
  posthog.capture("button_click");
}
</script>
