<script setup lang="ts">
import { ref, computed } from 'vue';
import { useResourcesStore } from '@/stores/useResourcesStore';
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const visible = ref(false);
const newResource = ref({
  title: '',
  emoji: '', // Provide a default emoji or leave it empty for the emoji picker
  description: ''
});
const store = useResourcesStore();

const isAddButtonDisabled = computed(() => {
  return !newResource.value.title || !newResource.value.emoji || !newResource.value.description;
});

function onSelectEmoji(emoji: any) {
  newResource.value.emoji = emoji.i
}

function closeModal() {
  visible.value = false;
}

function openModal() {
  visible.value = true;
  newResource.value = { title: '', emoji: '', description: '' };
}

function addNewResource() {
  store.addResource(newResource.value);
  newResource.value = { title: '', emoji: '', description: '' };
  closeModal();
}

defineExpose({ openModal, closeModal })
</script>

<template>
  <div v-if="visible" class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header flex justify-between mb-3 pb-2 text-xl">
          <h2>Add skill manually</h2>
          <span class="close cursor-pointer" @click="closeModal">&times;</span>
        </div>
        <form @submit.prevent="addNewResource">
          <div class="modal-body">
            <input v-model="newResource.title" type="text" placeholder="Name" required/>
            <input v-model="newResource.description" type="text" placeholder="Description" required/>
            <div class="emoji-selection">
              <div class="pb-5">Emoji: {{newResource.emoji || "(none selected, please select one)"}}</div>
              <EmojiPicker :native="true" @select="onSelectEmoji" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit" :disabled="isAddButtonDisabled">Add</button>
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
  padding: 5px 10px;;
  border-radius: 7px;
}
.modal-footer button:disabled {
  color: #ddd;
  border-color: #ddd;
}
.modal-body input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 7px;
}
button {
  background: linear-gradient(to top,rgba(0,0,0,.05) 0%, transparent 30%, transparent 100%);
}
</style>

