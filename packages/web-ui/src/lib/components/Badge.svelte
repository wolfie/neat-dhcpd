<script lang="ts">
  export let name: string;
  export let value:
    | string
    | number
    | boolean
    | [string | number | boolean, string | number | boolean | undefined | null];

  let line1 = Array.isArray(value) ? value[0] : value;
  let line2 = Array.isArray(value) ? value[1] : undefined;
</script>

<div class="root">
  <div class="name">{name}</div>
  <div class="value">
    {#if line2}
      {line1}
      <br />
      <span class="second">{line2}</span>
    {:else}
      {line1}
    {/if}
  </div>
</div>

<style lang="scss">
  .root {
    --padding: 5px;
    font-size: smaller;
    display: inline-flex;
    align-items: center;
    gap: var(--padding);
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    .name {
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      padding: var(--padding);
      color: white;
      height: 100%;
    }

    .value {
      padding-right: var(--padding);

      .second {
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
</style>
