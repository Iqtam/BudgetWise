<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Star } from 'lucide-svelte';

	const testimonials = [
		{
			id: 1,
			name: 'Sarah Johnson',
			role: 'Marketing Manager',
			content:
				'BudgetWise transformed how I manage my finances. The AI insights helped me save $500 monthly and I finally have control over my spending habits!',
			rating: 5,
			avatar: 'SJ'
		},
		{
			id: 2,
			name: 'Mike Chen',
			role: 'Software Engineer',
			content:
				'The chat-based expense tracking is genius. I can log expenses while on the go without opening multiple screens. It\'s like having a financial assistant in my pocket.',
			rating: 5,
			avatar: 'MC'
		},
		{
			id: 3,
			name: 'Emily Rodriguez',
			role: 'Small Business Owner',
			content:
				'Finally, a finance app that understands my needs. The debt payoff strategies saved me thousands in interest and the analytics help me make better business decisions.',
			rating: 5,
			avatar: 'ER'
		},
		{
			id: 4,
			name: 'David Kim',
			role: 'Teacher',
			content:
				'As someone who struggled with budgeting, BudgetWise made it simple and intuitive. The goal-based budgeting feature helped me save for my dream vacation.',
			rating: 5,
			avatar: 'DK'
		},
		{
			id: 5,
			name: 'Lisa Thompson',
			role: 'Freelance Designer',
			content:
				'The automated categorization is spot-on and saves me hours each month. The insights into my spending patterns were eye-opening and helped me optimize my finances.',
			rating: 5,
			avatar: 'LT'
		}	];

	let currentIndex = 0;
	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		console.log('Testimonials carousel mounted');
		intervalId = setInterval(() => {
			currentIndex = (currentIndex + 1) % testimonials.length;
			console.log(`Changed to testimonial ${currentIndex}`);
		}, 3000); // Changed to 3 seconds for faster testing

		return () => {
			console.log('Testimonials carousel unmounted');
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});	function goToSlide(index: number) {
		currentIndex = index;
		console.log(`Manual navigation to testimonial ${index}`);
	}

	function getCardStyle(index: number) {
		const position = (index - currentIndex + testimonials.length) % testimonials.length;

		if (position === 0) {
			// Active card (center)
			return 'transform: translateX(0%) scale(1); opacity: 1; z-index: 3;';
		} else if (position === 1 || position === testimonials.length - 1) {
			// Adjacent cards
			const translateX = position === 1 ? '60%' : '-60%';
			return `transform: translateX(${translateX}) scale(0.85); opacity: 0.6; z-index: 2;`;
		} else {
			// Hidden cards
			const translateX = position < testimonials.length / 2 ? '120%' : '-120%';
			return `transform: translateX(${translateX}) scale(0.7); opacity: 0; z-index: 1;`;
		}
	}
</script>

<div class="relative h-80 overflow-hidden">
	<div class="flex items-center justify-center h-full">
		{#each testimonials as testimonial, index}
			<Card
				class="absolute w-full max-w-2xl bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-700 ease-in-out"
				style={getCardStyle(index)}
			>
				<CardContent class="p-8">
					<div class="flex mb-4">
						{#each Array(testimonial.rating) as _, i}
							<Star class="h-5 w-5 text-yellow-400 fill-current" />
						{/each}
					</div>
					<blockquote class="text-lg text-gray-300 mb-6 leading-relaxed">
						"{testimonial.content}"
					</blockquote>
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold"
						>
							{testimonial.avatar}
						</div>
						<div>
							<div class="font-semibold text-white">{testimonial.name}</div>
							<div class="text-sm text-gray-400">{testimonial.role}</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Indicators -->
	<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
		{#each testimonials as _, index}
			<button
				class="w-2 h-2 rounded-full transition-all duration-300 {index === currentIndex
					? 'bg-gradient-to-r from-blue-400 to-green-400 w-8'
					: 'bg-gray-600 hover:bg-gray-500'}"
				aria-label="Go to testimonial {index + 1}"
				on:click={() => goToSlide(index)}
			></button>
		{/each}
	</div>
</div> 