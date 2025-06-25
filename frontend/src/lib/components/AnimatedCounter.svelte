<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	export let value: number;
	export let duration: number = 2000;
	export let delay: number = 0;
	export let prefix: string = '';
	export let suffix: string = '';

	let count = 0;
	let hasStarted = false;
	let animationFrame: number;

	onMount(() => {
		const timer = setTimeout(() => {
			hasStarted = true;
			startAnimation();
		}, delay);

		return () => clearTimeout(timer);
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});

	function startAnimation() {
		if (!hasStarted) return;

		let startTime: number;

		const animate = (currentTime: number) => {
			if (!startTime) startTime = currentTime;
			const progress = Math.min((currentTime - startTime) / duration, 1);

			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentCount = Math.floor(easeOutQuart * value);

			count = currentCount;

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			} else {
				count = value;
			}
		};

		animationFrame = requestAnimationFrame(animate);
	}

	function formatNumber(num: number): string {
		if (suffix === 'K+' && num >= 1000) {
			return (num / 1000).toFixed(num >= 10000 ? 0 : 1);
		}
		if (suffix === 'M+' && num >= 1000000) {
			return (num / 1000000).toFixed(1);
		}
		if (suffix === '/5') {
			return num.toFixed(1);
		}
		if (suffix === '%') {
			return num.toFixed(1);
		}
		return num.toLocaleString();
	}
</script>

<span>
	{prefix}{formatNumber(count)}{suffix}
</span> 