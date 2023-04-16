// Get the menu toggle button
const menuToggle = document.querySelector('.menu-toggle')

// Get the menu and overlay
const menu = document.querySelector('.menu')
const overlay = document.querySelector('.overlay')

// Add a click event listener to the menu toggle button
menuToggle.addEventListener('click', function () {
	// Toggle the "open" class on the menu toggle button
	// menuToggle.classList.toggle('open')

	// Toggle the "open" class on the menu
	menu.classList.toggle('open')
	overlay.classList.toggle('visible')

	if (menu.classList.contains('open')) {
		// Add click event listener to overlay
		overlay.addEventListener('click', function () {
			menu.classList.remove('open')
			overlay.classList.remove('visible')
		})
	} else {
		// Remove click event listener from overlay
		overlay.removeEventListener('click', function () {})
	}
})

const swiper = new Swiper('.swiper', {
	// Default parameters
	slidesPerView: 4,
	loop: true,
	centeredSlides: true,
	allowSlideNext: true,
	allowSlidePrev: true,
})
