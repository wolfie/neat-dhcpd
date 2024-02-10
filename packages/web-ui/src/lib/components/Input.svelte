<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let name: string | undefined = undefined;
  export let value: string | number | null | undefined = undefined;
  export let disabled: boolean = false; // TODO: this is not good - it should allow focus but disallow editing.
  export let type: 'text' | 'number' = 'text';
  export let small: boolean = false;
  export let placeholder: string | undefined = undefined;

  let element: HTMLInputElement;

  export const focus: (typeof element)['focus'] = () => element.focus();

  const dispatch = createEventDispatcher<{ blurOrEnter: { value: string } }>();

  const EMPTY_VALUE = { text: '', number: 0 };
</script>

<input
  bind:this={element}
  {name}
  value={value !== null && typeof value !== 'undefined' ? value : EMPTY_VALUE[type]}
  {type}
  {disabled}
  {placeholder}
  class:small
  on:keydown={(e) => {
    value = e.currentTarget.value;
    e.code === 'Enter' && e.currentTarget.blur();
  }}
  on:blur={(e) => dispatch('blurOrEnter', { value: e.currentTarget.value })}
/>

<style lang="scss">
  input {
    font-family: 'Montserrat Variable', sans-serif;
    height: 2.5em;
    font-weight: 500;
    padding-left: 1em;
    background: rgba(0, 0, 0, 0);
    border: 2px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;

    &.small {
      height: 2em;
      padding-left: 0.5em;
    }

    &:focus {
      border: 2px solid rgba(0, 0, 0, 0.5);
    }

    &:disabled {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
</style>
