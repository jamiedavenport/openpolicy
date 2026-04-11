<svelte:head>
	<title>Privacy Policy</title>
</svelte:head>

<script lang="ts">
import policy from "$lib/policies/privacy-policy.html?raw";
</script>

<main>
	{@html policy}
</main>
