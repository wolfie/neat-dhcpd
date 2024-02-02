<script lang="ts">
  import { onMount } from 'svelte';

  export let time: number;

  let now = Date.now();

  onMount(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 250);
    return () => clearInterval(interval);
  });

  const getHoursAndMinutes = (ms: number) => {
    if (ms < 0) return `0s`;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms - hours * (1000 * 60 * 60)) / 60_000);

    if (hours > 0) return `${hours}h ${minutes}min`;
    if (minutes > 0) return `${minutes}min`;
    return Math.round(ms / 1000) + 's';
  };
</script>

<span>{getHoursAndMinutes(time - now)}</span>
