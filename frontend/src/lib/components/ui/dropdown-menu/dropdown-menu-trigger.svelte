<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	export type DropdownMenuTriggerProps = DropdownMenuPrimitive.TriggerProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		children,
		...restProps
	}: DropdownMenuTriggerProps = $props();
</script>

<DropdownMenuPrimitive.Trigger
	class={cn(className)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Trigger> 