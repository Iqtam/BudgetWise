<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { tv } from "tailwind-variants";

	export const dropdownMenuSeparatorVariants = tv({
		base: "-mx-1 my-1 h-px bg-muted",
	});

	export type DropdownMenuSeparatorProps = DropdownMenuPrimitive.SeparatorProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		...restProps
	}: DropdownMenuSeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
	class={cn(dropdownMenuSeparatorVariants(), className)}
	{...restProps}
/> 