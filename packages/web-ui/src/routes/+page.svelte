<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  export let data: PageData;

  let logs: PageData["logs"] | undefined = undefined;
  let seenMacs: PageData["seenMacs"] | undefined = undefined;
  onMount(() => {
    const interval = setInterval(async () => {
      fetch("/api/logs")
        .then((response) => response.json())
        .then((newLogs) => (logs = newLogs));
      fetch("/api/seenMacs")
        .then((response) => response.json())
        .then((newSeenMacs) => (seenMacs = newSeenMacs));
    }, 2000);
    return () => clearInterval(interval);
  });
</script>

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

<h1>Seen Macs</h1>
{#if seenMacs?.length || data.seenMacs.length > 0}
  <table>
    <thead>
      <tr>
        <td>MAC</td>
        <td>Vendor</td>
        <td>First seen</td>
        <td>Last seen</td>
      </tr>
    </thead>
    <tbody>
      {#each seenMacs ?? data.seenMacs as seenMac (seenMac.mac)}
        <tr>
          <td>{seenMac.mac}</td>
          <td>{seenMac.vendor?.["Organization Name"] || ""}</td>
          <td>{seenMac.first_seen}</td>
          <td>{seenMac.last_seen}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  No MACs have been seen yet
{/if}

<h1>Logs</h1>
<!-- TODO add log level filtering-->
<table>
  <thead>
    <tr>
      <th>Timestamp</th>
      <th>System</th>
      <th>JSON</th>
    </tr>
  </thead>
  <tbody>
    {#each logs ?? data.logs as log (log.timestamp)}
      <tr>
        <td class="timestamp">{log.timestamp}</td>
        <td>{log.system}</td>
        <td>{log.json}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  td.timestamp {
    white-space: nowrap;
  }
</style>
