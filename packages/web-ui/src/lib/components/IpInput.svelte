<script lang="ts">
  import { ipFromString, type IpString } from '@neat-dhcpd/common';
  import Input from './Input.svelte';
  import { createEventDispatcher } from 'svelte';

  export let value: IpString | undefined | null = undefined;
  export let placeholder: string | undefined = undefined;

  let ipString = value ?? '';
  let element: Input;

  const dispatch = createEventDispatcher<{ blurOrEnter: { value: IpString | undefined } }>();

  const validateIp = (e: CustomEvent<{ value: string }>) => {
    const _value = e.detail.value.trim();
    if (!_value) {
      value = undefined;
      dispatch('blurOrEnter', { value });
      return;
    }

    const _ip = ipFromString(_value)?.str;
    if (!_ip) {
      ipString = '';
      window.alert(`"${_value}" is not a valid IP`);
      setTimeout(() => element.focus(), 50);
    } else {
      value = _ip;
      dispatch('blurOrEnter', { value });
    }
  };
</script>

<Input bind:this={element} {placeholder} bind:value={ipString} on:blurOrEnter={validateIp} />
