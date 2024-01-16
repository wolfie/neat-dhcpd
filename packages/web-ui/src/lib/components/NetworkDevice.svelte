<script lang="ts">
  import type { MacVendor } from '$lib/server/getMacVendor';
  import { formatRelative } from 'date-fns/formatRelative';
  import Input from './Input.svelte';
  import Pencil from 'lucide-svelte/icons/pencil';
  import XSquare from 'lucide-svelte/icons/x-square';
  import { createEventDispatcher } from 'svelte';

  export let mac: string;
  export let vendor: MacVendor | undefined;
  export let alias: string | null;
  export let firstSeen: string;
  export let lastSeen: string;
  export let hostname: string | null = null;

  let editing = false;

  const dispatch = createEventDispatcher<{ aliasChanged: { alias: string } }>();
</script>

<div class="box">
  <div class="name">
    {#if editing}
      <Input
        value={alias}
        placeholder="Device alias"
        on:blurOrEnter={(e) => {
          dispatch('aliasChanged', e.detail);
        }}
      />
    {:else if alias}
      <span class="named-device">{alias}</span>
    {:else}
      <span class="unnamed-device">Unnamed Device</span>
    {/if}
  </div>
  <div class="mac">{mac}</div>
  {#if vendor}<div>MAC Vendor: {vendor['Organization Name']}</div>{/if}
  {#if hostname}<div>Hostname: {hostname}</div>{/if}
  <div>Last seen: {formatRelative(lastSeen, Date.now())}</div>
  <div>First seen: {formatRelative(firstSeen, Date.now())}</div>
  <div class="editing-panel" class:editing>
    {#if !editing}
      <button on:click={() => (editing = true)} title="edit"><Pencil /></button>
    {:else}
      <button on:click={() => (editing = false)} title="close"><XSquare /></button>
    {/if}
  </div>
</div>

<style lang="scss">
  .box {
    --border-radius: 8px;

    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
    border-radius: var(--border-radius);
    padding: 1em;

    .name {
      height: 2em;

      .named-device {
        font-weight: 600;
      }

      .unnamed-device {
        filter: opacity(0.5);
      }
    }

    &:hover .editing-panel,
    & .editing-panel.editing {
      display: flex;
    }

    & .editing-panel {
      display: none;
    }

    .editing-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.1);
      border-top-right-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);

      button {
        background-color: transparent;
        border: 0;
        color: rgba(0, 0, 0, 0.75);
        cursor: pointer;

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .mac {
    font-family: 'Roboto Mono Variable', monospace;
  }
</style>
