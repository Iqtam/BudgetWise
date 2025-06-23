<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { tv } from "tailwind-variants";

	export const dropdownMenuItemVariants = tv({
		base: "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
	});

	export type DropdownMenuItemProps = DropdownMenuPrimitive.ItemProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		children,
		...restProps
	}: DropdownMenuItemProps = $props();
</script>

<DropdownMenuPrimitive.Item
	class={cn(dropdownMenuItemVariants(), className)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item> 