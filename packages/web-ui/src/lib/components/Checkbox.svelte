<script lang="ts">
  export let name: string | undefined = undefined;
  export let checked: boolean = false;
</script>

<input {name} type="checkbox" {checked} />

<style lang="scss">
  input {
    font-family: "Montserrat Variable", sans-serif;
    height: 2.5em;
    font-weight: 500;
    padding-left: 1em;
    background: rgba(0, 0, 0, 0);
    border: 2px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;

    &:focus {
      border: 2px solid rgba(0, 0, 0, 0.5);
    }
  }
</style>
