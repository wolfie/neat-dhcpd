<script lang="ts">
  import Computer from 'lucide-svelte/icons/computer';
  import Input from './Input.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import X from 'lucide-svelte/icons/x';
  import Button from './Button.svelte';
  import { createEventDispatcher, SvelteComponent } from 'svelte';
  import { ipFromString, type IpString } from '@neat-dhcpd/common';

  const dispatch = createEventDispatcher<{
    cancel: undefined;
    add: { name: string | undefined; ip: IpString | undefined; mac: string };
  }>();

  let name: string | undefined = undefined;
  let ipString = '';
  let ip: IpString | undefined = undefined;
  let mac: string | undefined = undefined;

  let ipElement: Input;

  const validateIp = (e: CustomEvent<{ value: string }>) => {
    const value = e.detail.value.trim();
    if (!value) {
      ip = undefined;
      return;
    }

    const _ip = ipFromString(value)?.str;
    if (!_ip) {
      ipString = '';
      window.alert(`"${value}" is not a valid IP`);
      setTimeout(() => ipElement.focus(), 50);
    } else {
      ip = _ip;
    }
  };
</script>

<div class="root">
  <Button on:click={() => (ipString = 'hello')}>x</Button>
  <div class="icon">
    <Computer />
  </div>
  <div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <Input placeholder="Unnamed device" bind:value={name} />
      <Input
        bind:this={ipElement}
        placeholder="No reserved IP"
        bind:value={ipString}
        on:blurOrEnter={validateIp}
      />
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
