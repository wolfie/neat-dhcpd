<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<h1>Config</h1>

<h2>DHCP setup</h2>

<form
  method="POST"
  action="?/config"
  use:enhance={() =>
    ({ update }) =>
      update({ reset: false })}
>
  <!-- TODO show error if current NIC is not in `data.ifaces` -->
  <table>
    <thead>
      <tr><th>Interface name</th><th>CIDR</th></tr>
    </thead>
    <tbody>
      {#each data.ifaces as iface}
        <tr>
          <td>
            <label>
              <input
                type="radio"
                name="broadcastCidr"
                value={iface.cidr}
                checked={data.config?.broadcast_cidr === iface.cidr}
              />{iface.nic}
            </label>
          </td>
          <td>{iface.cidr}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <label>Start <input name="ipStart" value={data.config?.ip_start} /></label>
  <label>End <input name="ipEnd" value={data.config?.ip_end} /></label>
  <label>
    Leasetime <input
      name="leaseTimeMinutes"
      type="number"
      value={data.config?.lease_time_minutes}
    />
  </label>
  <label>
    Gateway <input name="gatewayIp" value={data.config?.gateway_ip} />
  </label>
  <label>DNS1 <input name="dns1" value={data.config?.dns1} /></label>
  <label>DNS2 <input name="dns2" value={data.config?.dns2} /></label>
  <label>DNS3 <input name="dns3" value={data.config?.dns3} /></label>
  <label>DNS4 <input name="dns4" value={data.config?.dns4} /></label>
  <label>
    Send replies <input
      name="sendReplies"
      type="checkbox"
      checked={!!data.config?.send_replies}
    />
  </label>
  <button>Sugmit</button>
</form>

<!--
<h2>Aliases</h2>
<form
  method="POST"
  action="?/aliases"
  use:enhance={() =>
    ({ update }) =>
      update({ reset: false })}
>
  <table>
    {#each macsToAliases as [mac, vendor, alias]}
      <tr>
        <td class="mac">{mac}</td>
        <td>{vendor?.["Organization Name"] ?? ""}</td>
        <td>{alias?.addedAt ?? ""}</td>
        <td><input name={`name:${mac}`} value={alias?.alias ?? ""} /></td>
      </tr>
    {/each}
  </table>
  <button>Save</button>
</form>
-->

<style lang="scss">
  /* td.mac {
    font-family: monospace;
  } */
</style>
