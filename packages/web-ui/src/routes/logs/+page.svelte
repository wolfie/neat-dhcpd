<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  let logs: PageData["logs"] | undefined = undefined;
  onMount(() => {
    const interval = setInterval(async () => {
      fetch("/api/logs")
        .then((response) => response.json())
        .then((newLogs) => (logs = newLogs));
    }, 2000);
    return () => clearInterval(interval);
  });
</script>

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
