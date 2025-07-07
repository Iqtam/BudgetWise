<script lang="ts">
	import { Progress as ProgressPrimitive, type WithoutChildrenOrChild } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();
</script>

<ProgressPrimitive.Root
	bind:ref
	class={cn("bg- relative h-4 w-full overflow-hidden rounded-full", className)}
	{value}
	{max}
	{...restProps}
>
	<div
		class="bg-white h-full flex-1 transition-all"
		style={`width: ${(100 * (value ?? 0)) / (max ?? 1)}%`}
	></div>
</ProgressPrimitive.Root>
