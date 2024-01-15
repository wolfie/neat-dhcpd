<script lang="ts">
  export let disabled: unknown = false;
</script>

<button disabled={Boolean(disabled)}><slot /></button>

<style lang="scss">
  @use 'sass:color';

  button {
    font-family: 'Montserrat Variable', sans-serif;
    height: 2.5em;
    font-weight: 600;
    background: var(--colorApricot);
    border: 2px solid rgba(0, 0, 0, 0.5);
    color: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    padding: 0 1em;

    &:focus {
      border-color: black;
      color: black;
    }
    &:active {
      filter: brightness(80%);
    }
    &:disabled {
      filter: saturate(0%);
      opacity: 0.5;
    }
  }
</style>
