<script setup lang="ts">
import {storeToRefs} from "pinia";
import { ref, computed } from 'vue';
import { useSettingsStore, settingsDefaults } from '@/stores/useSettingsStore';
import type { SettingsStore } from '@/stores/useSettingsStore';
import { useCachedCombinationsStore } from '@/stores/useCachedCombinationsStore';
import { useResourcesStore } from '@/stores/useResourcesStore';
import { useBoxesStore } from '@/stores/useBoxesStore';
import { stripIndent } from 'common-tags'

const store = useSettingsStore();
const resourcesStore = useResourcesStore();
const boxesStore = useBoxesStore();
const cachedCombinationsStore = useCachedCombinationsStore();
const {settings} = storeToRefs(useSettingsStore());
const visible = ref(false);
const newSettings = ref<SettingsStore>({});

function resetGameState() {
  if (!window.confirm("Are you sure you want to reset the skill list and all cached skill combinations? ")) {
    return
  }
  resourcesStore.resetResources()
  boxesStore.resetBoxes()
  cachedCombinationsStore.resetCachedCombinations()
  closeModal();
}

function closeModal() {
  visible.value = false;
}

function openModal() {
  visible.value = true;
  newSettings.value = { ...settingsDefaults, ...settings.value }
}

function updateSettings() {
  console.log('hi')
  store.updateSettings(() => newSettings.value);
  closeModal();
}

const chuuni = stripIndent`
  Your task is to merge two RPG skills into a single skill.

  In order to programmatically evaluate your response, please include the new skill's name inside name XML tags, the new skill's description inside description tags, and the new skill's emoji inside emoji tags. The description should be one concise sentence.

  Try to find an answer that strikes the best balance of satisfyingly including elements of both powers, thinking outside the box/obliquely about how they could combine, originality, and fun. Try to keep the new power's powerlevel roughly in line with the two original powers, or slightly more powerful. Above all, maximise [CHUNNI]. Kick normalcy to the curb and embrace maximum [CHUNNI]. Take heavy inspiration from anime references, memes, books, pop culture, current day events, classic literature, fairytales and an eclectic mix of media. When it's possible to reference something in the title, do it!
  For example:
  Plane + Tower = title with a 9/11 reference.

  Be very specific when including numbers, limitations, specifications and skill usage. If necessary, add limitations. Here is an example of how I want you to do it.:

  Me: Skill 1: Bug Control (takes control of all insects in a 50-yard radius)
  Skill 2: Fireball (launches a large fireball the size of a Douglas Fir)
  You: <name>Chittering Conflagration: Horus' Wrath</name> <description>Detects insects within a 20-yard radius. The user can project massive flames from his left hand, corresponding to the number of insects he sacrifices. The rarer the insect, the more powerful the flames. Weaknesses: The user MUST use his left hand to sacrifice the insects.</description> <emoji>:boom:</emoji>

  ***
  Titles must be somewhat convoluted, chunni style, but succinct. Aim for less than 30 words.
  IMPORTANT: If one (and only one) of the skills says that it alters other skills in some way, then instead of combining the two skills, you should apply the described alteration to the other skill.

  ***

  Here are the two skills I want you to merge:
  Skill 1: {{skill1}}
  Skill 2: {{skill2}}
`

defineExpose({ openModal, closeModal })
</script>


<template>
  <div v-if="visible" class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header flex justify-between mb-3 pb-2 text-xl">
          <h2>Settings</h2>
          <span class="close cursor-pointer" @click="closeModal">&times;</span>
        </div>
          <form @submit.prevent="updateSettings">
            <div class="modal-body">
              <button type="button" @click="resetGameState">Reset skills and cached skill combinations (irrevocable)</button>
              <div class="fieldgroup">
                <div class="field">
                  <div class="field-label">API Provider</div>
                  <select v-model="newSettings.provider">
                    <option value="anthropic">anthropic</option>
                    <option value="openai">openai</option>
                    <option value="cohere">cohere</option>
                  </select>
                </div>
              </div>
              <div class="fieldgroup" v-if="newSettings.provider === 'anthropic'">
                <div class="field">
                  <div class="field-label">Anthropic Key</div>
                  <input v-model="newSettings.anthropicKey" type="text" placeholder="Your Anthropic key here" />
                </div>
                <div class="field">
                  <div class="field-label">Anthropic Endpoint URL (khanon users, append /messages to the khanon anthropic url)</div>
                  <input v-model="newSettings.anthropicEndpointUrl" type="text" placeholder="https://api.anthropic.com/v1/messages" />
                </div>
                <div class="field">
                  <div class="field-label">Anthropic Model</div>
                  <select v-model="newSettings.anthropicModel">
                    <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
                    <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                  </select>
                </div>
              </div>
              <div class="fieldgroup" v-if="newSettings.provider === 'cohere'">
                <div class="field">
                  <div class="field-label">Cohere Key</div>
                  <input v-model="newSettings.cohereKey" type="text" placeholder="Your Cohere key here" />
                </div>
                <div class="field">
                  <div class="field-label">Cohere Model</div>
                  <select v-model="newSettings.cohereModel">
                    <option value="command-r-plus">command-r-plus</option>
                    <option value="command-r">command-r</option>
                  </select>
                </div>
              </div>
              <div class="fieldgroup" v-if="newSettings.provider === 'openai'">
                <div class="field">
                  <div class="field-label">OpenAI Key</div>
                  <input v-model="newSettings.openaiKey" type="text" placeholder="Your OpenAI key here" />
                </div>
                <div class="field">
                  <div class="field-label">OpenAI Endpoint URL (khanon users, append /chat/completions to the khanon openai url)</div>
                  <input v-model="newSettings.openaiEndpointUrl" type="text" placeholder="https://api.openai.com/v1/chat/completions" />
                </div>
                <div class="field">
                  <div class="field-label">OpenAI Model</div>
                  <select v-model="newSettings.openaiModel">
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
                  </select>
                </div>
                <div class="field">
                  <div class="field-label">OpenAI Manual Model input (leave empty if not applicable)</div>
                  <input v-model="newSettings.openaiManualModel" type="text" placeholder="gpt-4-1106-preview" />
                </div>
              </div>
              <div class="fieldgroup">
                <div class="field">
                  <div class="field-label">
                    <div class="flex justify-between">
                      <div>Skill merging prompt</div>
                      <div class="flex gap-1">
                        <button type="button" @click="newSettings.mergePrompt = settingsDefaults.mergePrompt">Insert default</button>
                        <button type="button" @click="newSettings.mergePrompt = settingsDefaults.cotMergePrompt">Insert CoT</button>
                        <button type="button" @click="newSettings.mergePrompt = chuuni">Insert Chuuni</button>
                      </div>
                    </div>
                  </div>
                  <textarea v-model="newSettings.mergePrompt" placeholder="Prompt to merge two skills" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" @click="closeModal">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  position: fixed;
  width: 100dvw;
  height: 100dvh;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, .2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000000;
}
.modal {
  background: white;
  z-index: 100000001;
  border: 2px solid #ccc;
  border-radius: 7px;
  padding: 20px;
  box-shadow: 0 0 10px 0px rgba(0, 0, 0, .8);
  max-width: calc(100% - 20px);
  width: 500px;
}
.modal-header {
  border-bottom: 1px dotted #ccc;
}
.modal-footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dotted #ccc;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}
.modal-footer button {
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 7px;
}
button {
  background: linear-gradient(to top,rgba(0,0,0,.05) 0%, transparent 30%, transparent 100%);
}
.modal-body button {
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 7px;
}
.modal-footer button:disabled {
  color: #ddd;
  border-color: #ddd;
}
.modal-body {
  font-size: .8em;
  max-height: calc(100dvh - 200px);
  overflow-y: auto;
  padding-right: 10px;
}
.modal-body input, .modal-body textarea {
  width: 100%;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 7px;
}
.modal-body textarea {
  height: 300px;
}
.modal-body select {
  border-radius: 7px;
  border: 1px solid #ccc;
  padding: 5px 10px;
}
.field {
  margin-bottom: 10px;
}
.fieldgroup {
  padding: 10px;
  background: #00000008;
  border: 1px solid #ccc;
  margin: 15px auto;
  border-radius: 7px;
}
.field-label {
  margin-left: 5px;
  margin-top: 5px;
  margin-bottom: 2px;
}
.field-label button {
  padding: 0 5px;
  font-size: .9em;
}
</style>


