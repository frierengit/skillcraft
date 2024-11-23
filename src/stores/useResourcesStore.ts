import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface ResourceStoreEntry {
  title: string
  emoji: string
  description: string
}

export const defaultResources: ResourceStoreEntry[] = [
  {
    title: 'Alter Skill',
    emoji: '🎲',
    description:
      'Alters an existing skill in unexpected ways (e.g. changing some property, adding a cost for a stronger effect, etc - not something to do with randomness or surprise, unexpected here means the AI decides).'
  },
  {
    title: 'Corrupt Skill',
    emoji: '🕳️',
    description:
      'Twists an existing skill into something radically new, which could be construed as evil and corrupted (do not use the words evil or corrupted, be creative).'
  },
  {
    title: 'Skill Level Up',
    emoji: '⬆️',
    description: 'Improves an existing skill, turning it into a starkly more powerful variant.'
  },
  {
    title: 'Skill Elemental Change',
    emoji: '🍃',
    description:
      'Alters a skill by changing what element it uses as well as slightly changing its effects.'
  },
  { title: 'Heal', emoji: '🩹', description: 'Heals a target.' },
  { title: 'Fireball', emoji: '🔥', description: 'Launches a fireball.' },
  { title: 'Rock Bullet', emoji: '🪨', description: 'Shoots a rock bullet.' },
  { title: 'Wind Blade', emoji: '💨', description: 'Sends a sharp wind blade.' },
  { title: 'Beginner Swordmanship', emoji: '⚔️', description: 'Bestows basic sword skills.' }
]

export const useResourcesStore = defineStore('resources', () => {
  const resources = useLocalStorage<ResourceStoreEntry[]>('opencraft/resources', defaultResources)

  function addResource(box: ResourceStoreEntry) {
    resources.value.push(box)
  }

  function resetResources() {
    while (resources.value.length > 0) {
      resources.value.pop()
    }
    for (const res of defaultResources) {
      resources.value.push(res)
    }
  }

  return { resources, addResource, resetResources }
})
