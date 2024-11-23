<script setup lang="ts">
import {useDrop} from "vue3-dnd";
import {ItemTypes} from "@/components/ItemTypes";
import type {DragItem} from "@/components/interfaces";
import {useBoxesStore} from "@/stores/useBoxesStore";
import axios from "axios";
import {useResourcesStore} from "@/stores/useResourcesStore";
import {useSettingsStore, settingsDefaults} from "@/stores/useSettingsStore";
import {useCachedCombinationsStore} from "@/stores/useCachedCombinationsStore";
import {storeToRefs} from "pinia";
import {twMerge} from "tailwind-merge";
import safeStringify from 'safe-stringify';

const props = defineProps<{
  title: string;
  emoji: string;
  description: string;
  id: string;
}>()

const store = useBoxesStore()
const {boxes} = storeToRefs(useBoxesStore())

const settingsStore = useSettingsStore()
const {settings} = storeToRefs(useSettingsStore())
const cachedCombinationsStore = useCachedCombinationsStore()
const {removeBox, addBox} = store
const {resources} = storeToRefs(useResourcesStore())
const {addResource} =useResourcesStore()

const textWithinXmlTag = (tagName: string, xmlString: string): string | undefined => {
  return xmlString.split(`<${tagName}>`)[1]?.split(`</${tagName}>`)[0]
}

const skillWithinOutput = (xmlString: string): Skill | undefined => {
  const name = textWithinXmlTag('name', xmlString)?.trim()
  const description = textWithinXmlTag('description', xmlString)?.trim()
  const emoji = textWithinXmlTag('emoji', xmlString)?.trim()
  if (name && description && emoji) {
    return { title: name, description, emoji }
  }
}

type Skill = {
  title: string;
  emoji: string;
  description: string;
}

type Adapter = (prompt: string) => Promise<AIResult>

type AIResult = { status: 'success'; skill: Skill } | { status: 'error'; error: string }

const anthropic: Adapter = (prompt) =>
  axios.post(
    settings.value.anthropicEndpointUrl ?? settingsDefaults.anthropicEndpointUrl,
    {
      model: settings.value.anthropicModel,
      max_tokens: 1000,
      messages: [ { role: 'user', content: prompt } ]
    },
    {
      headers : {
        'x-api-key': settings.value.anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    }
  ).then((resp): AIResult => {
    const output: string = resp.data.content[0].text;
    console.log(output)
    const skill = skillWithinOutput(output)
    if (skill) {
      return { status: 'success', skill } as const
    } else {
      return { status: 'error', error: `Could not parse AI output: ${output}` } as AIResult
    }
  })
  .catch((error): AIResult => {
    console.log('error:')
    console.error(error)
    console.log('--')
    return { status: 'error', error: safeStringify(error) } as AIResult
  })

const cohere: Adapter = (prompt) =>
  axios.post(
    "https://api.cohere.com/v1/chat",
    {
      model: settings.value.cohereModel,
      max_tokens: 1000,
      safety_mode: 'OFF',
      chat_history: [],
      message: prompt,
    },
    {
      headers : {
        'Authorization': 'Bearer ' + settings.value.cohereKey,
        'content-type': 'application/json',
      }
    }
  ).then((resp): AIResult => {
    const output: string = resp.data.text
    console.log(output)
    const skill = skillWithinOutput(output)
    if (skill) {
      return { status: 'success', skill } as const
    } else {
      return { status: 'error', error: `Could not parse AI output: ${output}` } as AIResult
    }
  })
  .catch((error): AIResult => {
    console.log('error:')
    console.error(error)
    console.log('--')
    return { status: 'error', error: safeStringify(error) } as AIResult
  })


const openai: Adapter = (prompt) =>
  axios.post(
    settings.value.openaiEndpointUrl ?? settingsDefaults.openaiEndpointUrl,
    {
      "messages": [
          {
              "role": "user",
              "content": [
                  {
                      "type": "text",
                      "text": prompt
                  }
              ]
          }
      ],
      "temperature": 1,
      "max_tokens": 1000,
      "top_p": 1,
      "frequency_penalty": 0,
      "presence_penalty": 0,
      "model": settings.value.openaiManualModel || settings.value.openaiModel,
    },
    {
      headers: {
        'Authorization': 'Bearer ' + settings.value.openaiKey,
        'content-type': 'application/json',
      }
    }
  ).then((resp): AIResult => {
    const output: string = resp.data.choices[0].message.content
    console.log(output)
    const skill = skillWithinOutput(output)
    if (skill) {
      return { status: 'success', skill } as AIResult
    } else {
      return { status: 'error', error: 'Could not parse AI output: ${output}' } as AIResult
    }
  })
  .catch((error): AIResult => {
    console.log('error:')
    console.error(error)
    console.log('--')
    return { status: 'error', error: safeStringify(error) } as AIResult
  })

const [, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  async drop(item: DragItem, monitor) {
    if (item.id !== props.id) {
      const droppedId = item?.id;
      const secondTitle = boxes.value[droppedId]?.title ?? item?.title
      const skill1 = {...boxes.value[props.id]}
      const skill2 = {...boxes.value[droppedId]}
      if(droppedId){
        removeBox(droppedId);
      }
      if (!boxes.value[props.id]) {
        window.alert('Move skills to the other pane to merge them!')
        return
      }
      if (!skill1 || !skill2) {
        window.alert('Move skills to the other pane to merge them!')
        return
      }
      if (!skill1.title || !skill2.title) {
        window.alert('Move skills to the other pane to merge them!')
        return
      }
      boxes.value[props.id].loading = true
      const basePrompt = settings.value.mergePrompt ?? ''
      const prompt = basePrompt
        .replace(new RegExp('{{skill1}}', 'g'), `${skill1.title} (${skill1.description})`)
        .replace(new RegExp('{{skill2}}', 'g'), `${skill2.title} (${skill2.description})`);
      const adapters = {openai,anthropic, cohere}
      const cached = cachedCombinationsStore.getCachedCombination(skill1, skill2)

      const skillResult = await (
        cached
          ? Promise.resolve({ status: 'success', skill: cached } as AIResult)
          : adapters[settings.value.provider ?? settingsDefaults.provider!](prompt)
      )

      if (skillResult?.status === 'error' || skillResult === undefined) {
        window.alert((skillResult as any)?.error ?? "An unexpected error occurred (skillResult is undefined).")
        return
      } else {
        addBox({
          ...(skillResult as any).skill,
          left: boxes.value[props.id].left,
          top: boxes.value[props.id].top
        })
        if(!resources.value.find((resource: { title: string; }) => resource.title === skillResult.skill.title)) {
          addResource(skillResult.skill)
        }
        // add cached combination
        cachedCombinationsStore.addCachedCombination(skill1, skill2, skillResult.skill)
        removeBox(props.id);
        return
      }
    }
  },
}))
</script>

<template>
  <div
    :ref="drop"
    class="space-x-1.5 px-3 py-1 border-gray-200 bg-white shadow hover:bg-gray-100 cursor-pointer transition inline-block font-medium border rounded-lg"
    style="box-shadow: 0 0 5px 0px rgba(0, 0, 0, .8);"
  >
    <span>{{ emoji }}</span>
    <span class="font-semibold">{{ title }}</span>
    <div class="text-[0.75em] max-w-[200px]">{{ description }}</div>
  </div>

</template>

<style scoped>

</style>
