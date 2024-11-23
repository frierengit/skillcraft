<script setup lang="ts">
import Resource from "@/components/Resource.vue";
import { ref, computed } from 'vue';
import { useResourcesStore } from "@/stores/useResourcesStore";
import { storeToRefs } from "pinia";

const store = useResourcesStore();
const { resources } = storeToRefs(store);
const searchTerm = ref('');

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    return resource.title.toLowerCase().includes(searchTerm.value.toLowerCase());
  });
});

</script>

<template>
  <div class="flex gap-3 flex-wrap pt-3">
    <div class="flex gap-3 w-full">
      <input v-model="searchTerm" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Search skills...">
    </div>
    <Resource v-for="resource in filteredResources" :key="resource.title" :title="resource.title" :emoji="resource.emoji" :description="resource.description"></Resource>
  </div>
</template>

<style scoped>
</style>
