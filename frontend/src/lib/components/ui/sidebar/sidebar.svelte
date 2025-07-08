<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { tv } from "tailwind-variants";

	export const sidebarVariants = tv({
		base: "flex h-full w-64 flex-col bg-background border-r",
	});

	export type SidebarProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		class?: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: SidebarProps = $props();
</script>

<aside
	bind:this={ref}
	class={cn(sidebarVariants(), className)}
	{...restProps}
>
	{@render children?.()}
</aside> 