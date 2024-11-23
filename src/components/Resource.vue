<script setup lang="ts">
import { useDrag } from 'vue3-dnd'
import { ItemTypes } from './ItemTypes'
import { toRefs } from '@vueuse/core'
import ItemCard from "@/components/ItemCard.vue";
const props = defineProps<{
  emoji: string
  title: string
  description: string
}>()

const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: { title: props.title, emoji: props.emoji, description: props.description },
  collect: monitor => ({
    isDragging: monitor.isDragging(),
  }),
}))
const { isDragging } = toRefs(collect)
</script>

<template>
  <div
      class="inline-block"
      :ref="drag"
      role="Box"
      data-testid="box"
  >
    <ItemCard :id="title" :title="title" :emoji="emoji" :description="description"></ItemCard>
  </div>
</template>

<style scoped>

</style>
