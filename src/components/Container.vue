<script lang="ts" setup>
import {useDrop} from 'vue3-dnd'
import type {XYCoord} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import Box from './Box.vue'
import type {DragItem} from './interfaces'
import {reactive, ref} from 'vue'
import ItemCard from "@/components/ItemCard.vue";
import AvailableResources from "@/components/AvailableResources.vue";
import {useBoxesStore} from "@/stores/useBoxesStore";
import {storeToRefs} from "pinia";
import AddResourceModal from "@/components/AddResourceModal.vue";
import SettingsModal from "@/components/SettingsModal.vue";

const addResourceModal = ref<any>(null);
const settingsModal = ref<any>(null);
const openAddResourceModal = () => addResourceModal.value?.openModal()
const openSettingsModal = () => settingsModal.value?.openModal()
const store = useBoxesStore()
const { boxes } = store
const moveBox = (id: string | null, left: number, top: number, title: string, emoji: string, description: string) => {
  if (id) {
    Object.assign(boxes[id], {left, top})
  } else {
    const key = Math.random().toString(36).substring(7);
    store.addBox({left, top, title, emoji, description}, key)
    console.log({newBoxes: store.boxes})
    setTimeout(() => {
      console.log({newBoxesTwo: store.boxes})
   }, 50)
  }
}

const containerElement = ref<HTMLElement | null>(null)
const anvilElement = ref<HTMLElement | null>(null)

const [, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  drop(item: DragItem, monitor) {
    if (item.id && item.left !== null && item.top !== null) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord
      if(delta && delta.x && delta.y){
        const left = Math.round((item.left) + delta.x)
        const top = Math.round((item.top) + delta.y )
        moveBox(item.id, left, top, item.title, item.emoji, item.description)
      }
    } else {
      const delta = monitor.getClientOffset() as XYCoord
      // current mouse position relative to drop
      const containerCoords = anvilElement.value?.getBoundingClientRect()
      if (!containerCoords) return
      if(delta && delta.x && delta.y){
        const left = Math.round(delta.x - containerCoords.left - 40)
        const top = Math.round(delta.y - containerCoords.top - 15)
        console.log(item)
        moveBox(null, left, top, item.title, item.emoji, item.description)
      }
    }
    return undefined
  },
}))
</script>

<template>
  <div ref="containerElement">
    <AddResourceModal ref="addResourceModal" />
    <SettingsModal ref="settingsModal" />
    <div>
    </div>
    <main class="flex gap-3 flex-wrap mainel overflow-hidden">
      <div class="w-[48%] grow min-w-[450px] bg-white shadow px-4 py-3 border-gray-200 border rounded-lg overflow-y-auto skill-list">
        <div class="flex justify-between">
          <h2 class="font-semibold">Skills</h2>
          <div class="btns">
            <button @click="openAddResourceModal" class="add-btn">Add skill manually</button>
            <button @click="openSettingsModal" class="add-btn">Settings</button>
          </div>
        </div>
        <AvailableResources></AvailableResources>
      </div>
      <div class="grow w-[48%]" ref="anvilElement">
        <div :ref="drop" class="anvil">
          <Box
              v-for="(value, key) in boxes"
              :id="key"
              :key="key"
              :left="value.left"
              :top="value.top"
              :loading="value.loading"
          >
            <ItemCard :id="String(key)" :title="value.title" :emoji="value.emoji" :description="value.description"/>
          </Box>
        </div>
      </div>

    </main>


  </div>

</template>

<style scoped>
.mainel {
  height: calc(100dvh - 20px);
  overflow-y: auto;
  padding-right: 10px;
}
.skill-list {
  max-height: 100%;
  min-width: min(450px, 100%);
}
.anvil {
  max-height: 100%;
  min-width: min(450px, 100%);
  position: relative;
  width: 100%;
  overflow:hidden;
  height: 100%;
  /* height: 90vh;
  */
  min-height: 500px;
  border: 1px dotted #ccc;
  background: #00000005;
  border-radius: 1%;
}
.add-btn {
  border: 1px solid #ccc;
  padding: 0px 10px;
  border-radius: 7px;
}
.btns {
  display: flex;
  gap: 10px;
  font-size: 0.75em;
}
button {
  background: linear-gradient(to top,rgba(0,0,0,.05) 0%, transparent 30%, transparent 100%);
}
</style>
