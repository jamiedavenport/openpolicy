<svelte:head>
	<title>Cookie Policy</title>
</svelte:head>

<script lang="ts">
import policy from "$lib/policies/cookie-policy.html?raw";
</script>

<main>
	{@html policy}
</main>
