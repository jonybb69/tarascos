// Minimal DOM-based toast helper to avoid depending on external 'sonner' package.

function createToastElement(message: string) {
	// Create element
	const el = document.createElement('div')
	el.textContent = message

	// Basic styles (tailwind not available here), tweak as needed
	Object.assign(el.style, {
		position: 'fixed',
		right: '20px',
		bottom: '20px',
		background: 'linear-gradient(90deg,#ef4444,#fb923c)',
		color: 'white',
		padding: '10px 14px',
		borderRadius: '10px',
		boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
		opacity: '0',
		transform: 'translateY(8px)',
		transition: 'opacity 240ms ease, transform 240ms ease',
		zIndex: '9999',
		fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
		fontSize: '14px'
	})

	return el
}

export const toast = {
	success(message: string) {
		if (typeof window === 'undefined' || !document) return
		const el = createToastElement(message)
		document.body.appendChild(el)
		// trigger animation
		requestAnimationFrame(() => {
			el.style.opacity = '1'
			el.style.transform = 'translateY(0)'
		})
		// auto remove
		window.setTimeout(() => {
			el.style.opacity = '0'
			el.style.transform = 'translateY(8px)'
			window.setTimeout(() => {
				el.remove()
			}, 260)
		}, 3000)
	}
}
