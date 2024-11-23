import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { stripIndent } from 'common-tags'

export interface SettingsStore {
  provider?: 'anthropic' | 'openai'
  anthropicKey?: string
  anthropicModel?: 'claude-3-opus-20240229' | 'claude-3-5-sonnet-20241022'
  anthropicEndpointUrl?: string
  openaiKey?: string
  openaiModel?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-1106-preview'
  openaiEndpointUrl?: string
  mergePrompt?: string
  cotMergePrompt?: string
}

type NonOptional<T> = {
  [P in keyof T]-?: T[P]
}

export const settingsDefaults: NonOptional<SettingsStore> = {
  provider: 'anthropic',
  anthropicKey: '',
  anthropicEndpointUrl: 'https://api.anthropic.com/v1/messages',
  anthropicModel: 'claude-3-5-sonnet-20241022',
  openaiKey: '',
  openaiEndpointUrl: 'https://api.openai.com/v1/chat/completions',
  openaiModel: 'gpt-4o',
  cotMergePrompt: stripIndent`
    Your task is to merge two RPG skills into a single skill.

    In order to programmatically evaluate your response, please include the new skill's name inside <name></name> XML tags, the new skill's description inside <description></description> XML tags, and the new skill's emoji inside <emoji></emoji> XML tags. The description should be one concise sentence.

    Before you give your answer, think to yourself about different ways the two powers could combine, and which way would be the most fun/creative and why. Try to find an answer that strikes the best balance of satisfyingly including elements of both powers, thinking outside the box/obliquely about how they could combine, originality, and fun. Try to keep the new power's powerlevel roughly in line with the two original powers, or slightly more powerful.


    Here is an example of how I want you to do it:

    Me: Skill 1: Bug Control (takes control of all insects in a 50-yard radius)
    Skill 2: Fireball (launches a large fireball)
    You: Combining those two ideas would use some combination of the themes of Bugs, Mind Control, Fire, and Ball. The new skill could, for example:
    [1] produce a "ball of insects" instead of a fireball
    [2] cause a bug within sight to explode into fireballs
    [3] summon a cluster of explosive fireflies, detonating upon contact
    [4] grant the ability to control nearby flames
    [1] feels a little underwhelming (what are those insects going to do really?), [2] could be good, it's unique and has utility. [3] has some outside the box thinking (fire + bugs = fireflies) while still exhibiting concrete aspects of the fire element, and seems fun to use in a fight situation, creating a unique and memorable visual. [4] Could also be useful but isn't as striking. In conclusion, I think the best option is [4]. My answer is:
    <name>Firefly Drones</name> <description>Summons a cluster of fireflies that detonate on landing</description> <emoji>💥</emoji>

    ***

    IMPORTANT: If one (and only one) of the skills says that it alters other skills in some way, then instead of combining the two skills, you should apply the described alteration to the other skill. You should still think to yourself about the different ways to accomplish this like the above demonstration.

    ***

    Here are the two skills I want you to merge:
    Skill 1: {{skill1}}
    Skill 2: {{skill2}}
  `,
  mergePrompt: stripIndent`
    Your task is to merge two RPG skills into a single skill.

    In order to programmatically evaluate your response, please include the new skill's name inside name XML tags, the new skill's description inside description tags, and the new skill's emoji inside emoji tags. The description should be one concise sentence.

    Try to find an answer that strikes the best balance of satisfyingly including elements of both powers, thinking outside the box/obliquely about how they could combine, originality, and fun. Try to keep the new power's powerlevel roughly in line with the two original powers, or slightly more powerful.


    Here is an example of how I want you to do it:

    Me: Skill 1: Bug Control (takes control of all insects in a 50-yard radius)
    Skill 2: Fireball (launches a large fireball)
    You: <name>Firefly Drones</name> <description>Summons a cluster of fireflies that detonate on landing</description> <emoji>💥</emoji>

    ***

    IMPORTANT: If one (and only one) of the skills says that it alters other skills in some way, then instead of combining the two skills, you should apply the described alteration to the other skill.

    ***

    Here are the two skills I want you to merge:
    Skill 1: {{skill1}}
    Skill 2: {{skill2}}
  `
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = useLocalStorage<SettingsStore>('opencraft/settings', { ...settingsDefaults })

  function updateSettings(updater: (settings: SettingsStore) => SettingsStore) {
    settings.value = updater(settings.value)
  }

  return { settings, updateSettings }
})
