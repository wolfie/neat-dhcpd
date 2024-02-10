<script lang="ts">
  import Computer from 'lucide-svelte/icons/computer';
  import Input from './Input.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import X from 'lucide-svelte/icons/x';
  import Button from './Button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { IpString } from '@neat-dhcpd/common';
  import IpInput from './IpInput.svelte';

  const dispatch = createEventDispatcher<{
    cancel: undefined;
    add: { name: string | undefined; ip: IpString | undefined; mac: string };
  }>();

  let name: string | undefined = undefined;
  let ip: IpString | undefined = undefined;
  let mac: string | undefined = undefined;
</script>

<div class="root">
  <div class="icon">
    <Computer />
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <Input placeholder="Unnamed device" bind:value={name} />
      <IpInput placeholder="No reserved IP" bind:value={ip} />
    </div>
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div>
        <Input placeholder="MAC address" bind:value={mac} />
      </div>
    </div>
  </div>
  <div>
    <Button
      disabled={!mac}
      on:click={() => {
        if (mac) dispatch('add', { name: name || undefined, ip: ip || undefined, mac });
      }}
    >
      <Plus slot="icon" />Add
    </Button>
  </div>
  <div>
    <Button on:click={() => dispatch('cancel')}>
      <X slot="icon" />Cancel
    </Button>
  </div>
</div>

<style lang="scss">
  .root {
    display: flex;
    gap: 20px;
    background-color: #eee;
    border-radius: 10px;
    border: 1px solid #ddd;
    padding-right: 10px;
    opacity: 0.75;

    > * {
      padding: 10px 0;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .icon {
      background-color: #ddd;
      padding: 10px;
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }
  }
</style>
