import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export interface BoxStoreEntry {
  top: number
  left: number
  title: string
  emoji: string
  description: string
  loading?: boolean
}

const defaultBoxes: { [key: string]: BoxStoreEntry } = {
  def: { top: 20, left: 80, title: 'Fireball', emoji: '🔥', description: 'Launches a fireball.' }
}

export const useBoxesStore = defineStore('counter', () => {
  const boxes = reactive<{ [key: string]: BoxStoreEntry }>(defaultBoxes)
  function addBox(box: BoxStoreEntry, key?: string) {
    const randomId = Math.random().toString(36).substr(2, 5)
    boxes[key ?? randomId] = box
  }

  function removeBox(id: string) {
    delete boxes[id]
  }

  function resetBoxes() {
    for (const key in defaultBoxes) {
      boxes[key] = defaultBoxes[key]
    }
    for (const key in boxes) {
      if (boxes.hasOwnProperty(key) && key !== 'def') {
        delete boxes[key]
      }
    }
  }

  // just trying to get a non stale value but its not working
  function getBoxes() {
    return boxes
  }

  return { boxes, removeBox, addBox, resetBoxes, getBoxes }
})
