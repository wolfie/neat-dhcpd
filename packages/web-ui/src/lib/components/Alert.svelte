<script lang="ts">
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
</script>

<div class="alert">
  <AlertTriangle />
  <div><slot /></div>
</div>

<style lang="scss">
  .alert {
    display: flex;
    flex-direction: row;
    gap: calc(var(--size-unit) * 2);
    align-items: center;
    background-color: var(--colorTomato);
    padding: calc(var(--size-unit) * 2) calc(var(--size-unit) * 4);
    border-radius: var(--size-unit);
    color: white;
    max-width: fit-content;
    font-weight: 600;
  }
</style>
