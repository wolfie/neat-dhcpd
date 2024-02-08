<script lang="ts">
  import Computer from 'lucide-svelte/icons/computer';
  // import Laptop from 'lucide-svelte/icons/laptop';
  // import Server from 'lucide-svelte/icons/server';
  // import Smartphone from 'lucide-svelte/icons/smartphone';
  // import Countdown from './Countdown.svelte';
  import Badge from './Badge.svelte';
  import Input from './Input.svelte';
  import { createEventDispatcher } from 'svelte';
  import { ipFromString, type IpString } from '@neat-dhcpd/common';
  import type { Device2 } from '$lib/server/getPolledData';

  export let device: Device2;

  const dispatch = createEventDispatcher<{
    aliasChange: string;
    reservedIpChange: IpString | undefined;
  }>();

  const validateAndChangeReservedIp = (ipString: string) => {
    if (!ipString.trim()) dispatch('reservedIpChange', null);
    const ip = ipFromString(ipString);
    // TODO show validation error
    if (ip?.str) dispatch('reservedIpChange', ip.str);
  };
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
        on:blurOrEnter={(e) => dispatch('aliasChange', e.detail.value)}
      />
      <Input
        placeholder="No reserved IP"
        value={device.reserved_ip}
        on:blurOrEnter={(e) => validateAndChangeReservedIp(e.detail.value)}
      />
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
      {#if device.offer_ip}<div><Badge name="Offered" value={device.offer_ip} /></div>{/if}
      {#if device.lease_ip}<div><Badge name="Leased" value={device.lease_ip} /></div>{/if}
    </div>
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      {#if device.last_seen && device.first_seen}
        <div><Badge name="Last seen" value={device.last_seen} /></div>
        {#if device.last_seen !== device.first_seen}
          <div>
            <Badge name="First seen" value={device.first_seen} />
          </div>
        {/if}
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
