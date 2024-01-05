<!-- this file only contains to mute the a11y warnings -->

<!-- svelte-ignore a11y-label-has-associated-control -->
<label><slot /></label>

<style lang="scss">
  label {
    display: inline-flex;
    align-items: center;
    gap: var(--size-unit);
  }
</style>
