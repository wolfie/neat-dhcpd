<script lang="ts">
  import Computer from 'lucide-svelte/icons/computer';
  // import Laptop from 'lucide-svelte/icons/laptop';
  // import Server from 'lucide-svelte/icons/server';
  // import Smartphone from 'lucide-svelte/icons/smartphone';
  // import Countdown from './Countdown.svelte';
  import Badge from './Badge.svelte';
  import Input from './Input.svelte';
  import type { Device } from '$lib/server/getPolledData';
  import { createEventDispatcher } from 'svelte';

  export let device: Device;

  const dispatch = createEventDispatcher<{ aliasChange: string }>();
</script>

<div class="root">
  <div class="icon">
    <Computer />
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <Input
        placeholder="Unnamed device"
        value={device.alias}
        on:blurOrEnter={(e) => dispatch('aliasChange', e.detail.alias)}
      />
      <!-- TODO -->
      <Input placeholder="No reserved IP" value={undefined} />
    </div>
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div>
        <Badge
          name="MAC"
          value={[
            device.mac.address,
            device.mac.vendor ? device.mac.vendor['Organization Name'] : undefined,
          ]}
        />
      </div>
      {#if device.hostname}
        <div><Badge name="Hostname" value="Calvin" /></div>
      {/if}
    </div>
  </div>
  <div style="flex:1">
    <div style="display:flex;flex-direction:column;gap:2px">
      {#if device.offer}<div><Badge name="Offered" value={device.offer} /></div>{/if}
      {#if device.lease}<div><Badge name="Leased" value={device.lease} /></div>{/if}
    </div>
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div><Badge name="Last seen" value={device.lastSeen} /></div>
      {#if device.lastSeen !== device.firstSeen}
        <div>
          <Badge name="First seen" value={device.firstSeen} />
        </div>
      {/if}
    </div>
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
