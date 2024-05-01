<script>
	import { logMessages } from '$lib/stores';
</script>

{#if $logMessages.length > 0}
	<div class="absolute top-0 right-0 w-1/4 h-full p-4 overflow-y-auto bg-gray-100 logs">
		{#each $logMessages as { message, date, origin }}
			<div class="mb-2 log-entry">
				<p class="text-sm text-gray-600">{date} - {origin}</p>
				<p>{message}</p>
			</div>
		{/each}
	</div>
{/if}
