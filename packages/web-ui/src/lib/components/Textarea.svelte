<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let rows: number;
  export let value: string;
  export let name: string;

  const dispatch = createEventDispatcher<{ blur: string }>();
</script>

<textarea
  {name}
  bind:value
  style:--rows={rows}
  on:blur={(e) => dispatch('blur', e.currentTarget.value)}
/>

<style lang="scss">
  textarea {
    font-family: 'Montserrat Variable', sans-serif;
    font-size: 13.333px;
    --rows: 5;
    height: calc(max(0, var(--rows)) * 1.2em + 2em);
    font-weight: 500;
    padding: 0.75em 1em;
    background: rgba(0, 0, 0, 0);
    border: 2px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;

    &:focus {
      border: 2px solid rgba(0, 0, 0, 0.5);
    }

    &:disabled {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
</style>
