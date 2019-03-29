<template>
  <div>
    <transition name="fade">
      <button v-if="showClearCompletedButton" @click="clearCompleted">Clear Completed</button>
    </transition>
  </div>
</template>

<script>
export default {
  name: "todo-clear-completed",
  computed: {
    showClearCompletedButton() {
      return this.$store.getters.showClearCompletedButton;
    }
  },
  methods: {
    clearCompleted() {
      this.$store.dispatch("clearCompleted");
    }
  }
};
</script>

