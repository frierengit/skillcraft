import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

interface Skill {
  title: string
  emoji: string
  description: string
}

export type CachedCombinationStore = Record<string, Skill>

export const defaultCachedCombinationStore: CachedCombinationStore = {}

export const useCachedCombinationsStore = defineStore('cachedcombinations', () => {
  const cachedCombinations = useLocalStorage<CachedCombinationStore>(
    'opencraft/cachedcombinations',
    defaultCachedCombinationStore
  )

  function addCachedCombination(skill1: Skill, skill2: Skill, result: Skill) {
    const [orderedSkill1, orderedSkill2] = [skill1, skill2].sort((a, b) =>
      a.title.localeCompare(b.title)
    )
    const key = `${orderedSkill1.title} + ${orderedSkill2.title}`
    cachedCombinations.value[key] = result
  }

  function getCachedCombination(skill1: Skill, skill2: Skill): Skill | undefined {
    const [orderedSkill1, orderedSkill2] = [skill1, skill2].sort((a, b) =>
      a.title.localeCompare(b.title)
    )
    const key = `${orderedSkill1.title} + ${orderedSkill2.title}`
    return cachedCombinations.value[key]
  }

  function resetCachedCombinations() {
    for (const member in cachedCombinations.value) delete cachedCombinations.value[member]
  }

  return { cachedCombinations, getCachedCombination, addCachedCombination, resetCachedCombinations }
})
