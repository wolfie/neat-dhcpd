<script lang="ts">
  export let options: { label: string; value: string }[];
  export let name: string | undefined | null = undefined;
  export let value: string | undefined | null = undefined;
</script>

<select bind:value {name}>
  {#if options.every((option) => option.value !== value)}
    <option></option>
  {/if}
  {#each options as option}
    <option value={option.value} selected={value === option.value}>
      {option.label}
    </option>
  {/each}
</select>

<style lang="scss">
  select {
    font-family: "Montserrat Variable", sans-serif;
    height: 2.5em;
    font-weight: 500;
    padding-left: 1em;
    background: rgba(0, 0, 0, 0);
    border: 2px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }
</style>
