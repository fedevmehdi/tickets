function getCurrencySymbol(currencyCode) {
	const currencySymbols = {
		USD: "$",
		EUR: "€",
		GBP: "£",
	}

	// Convert the currency code to uppercase to handle cases like 'usd' or 'Usd'
	const code = currencyCode ? currencyCode.toUpperCase() : undefined

	// Return the corresponding currency symbol if found, or return the original currency code if not found
	return currencySymbols[code] || currencyCode || ""
}

function isEventClosed(eventStartDateTime) {
	// Convert the eventStartDateTime to a Date object
	const eventTime = new Date(eventStartDateTime)

	// Get the current date and time
	const currentTime = new Date()

	// Compare the two dates
	if (eventTime < currentTime) {
		return true
	} else {
		return false
	}
}

// Function to fetch data from the API
async function fetchTicketData(eventId) {
	try {
		const apiUrl = `https://wow.tickets/api/tickets/event/${eventId}`
		const response = await fetch(apiUrl)
		const data = await response.json()

		if (isEventClosed(data[0].event.startDateTime)) {
			return "Event is closed"
		}

		return data
	} catch (error) {
		console.error("Error fetching data:", error)
		return null
	}
}

// Function to populate the events div with ticket details
async function populateEventsDiv() {
	// Extract event ID from the div's id attribute
	const eventId = document
		.getElementById("wt-embed-event")
		.getAttribute("data-event-id")

	const container = document.getElementById("wt-embed-event")
	const eventsDiv = document.createElement("div")
	eventsDiv.id = "wt-event-listing"
	container.append(eventsDiv)

	if (!eventsDiv) {
		console.error("Events div not found.")
		return
	}

	// Create additional elements
	const footer = document.createElement("div")
	footer.className = "wt-footer"
	const checkoutButton = document.createElement("button")
	checkoutButton.id = "wt-checkout-button"
	checkoutButton.innerText = "Checkout Now"
	footer.append(checkoutButton)

	// Create an array to store selected ticket details
	const selectedTickets = []

	// Fetch ticket data from the API using the extracted event ID
	const tickets = await fetchTicketData(eventId)

	if (!tickets) {
		console.error("No ticket data found.")
		return
	}

	if (tickets === "Event is closed") {
		const messageBox = document.createElement("div")
		messageBox.className = "message-box"
		const message = document.createElement("p")
		message.innerText = "Tickets are closed for this events."
		messageBox.append(message)
		eventsDiv.append(messageBox)
		return
	}

	// Function to calculate the total amount
	function calculateTotal() {
		let totalAmount = 0
		let currency = null // Variable to store the currency of the selected tickets
		selectedTickets.forEach(selectedTicket => {
			const ticket = tickets.find(
				ticket => ticket.name === selectedTicket.ticket
			)
			if (ticket) {
				// Check if currency is already set
				if (!currency) {
					currency = ticket.currency
				} else if (currency !== ticket.currency) {
					// If currency is different, don't calculate total
					return
				}
				totalAmount +=
					selectedTicket.quantity *
					(ticket.price + (ticket.price / 100) * ticket.bookingFee)
			}
		})

		// Update the button text to display the total amount with currency
		const logButton = document.getElementById("wt-checkout-button")
		if (logButton) {
			if (currency) {
				logButton.textContent = `Checkout - ${totalAmount.toFixed(
					2
				)}${getCurrencySymbol(currency)}`
			} else {
				logButton.textContent = "Checkout"
			}
		}
	}

	// Iterate through the ticket data and create divs for each ticket
	tickets.forEach(ticket => {
		const ticketDiv = document.createElement("div")
		ticketDiv.className = "wt-ticket-details"

		// Extract ticket details (name, description, price, currency) and populate the div
		const ticketName = document.createElement("h3")
		ticketName.className = "wt-ticket-name"
		ticketName.textContent = ticket.name

		const ticketDescription = document.createElement("p")
		ticketDescription.className = "wt-ticket-description"
		ticketDescription.textContent = ticket.description

		const ticketPrice = document.createElement("p")
		ticketPrice.className = "wt-ticket-price"
		ticketPrice.textContent = `Price: ${
			ticket.price + (ticket.price / 100) * ticket.bookingFee
		} ${getCurrencySymbol(ticket.currency)}`

		// Create a dropdown input for selecting quantity
		const quantityDropdown = document.createElement("select")
		quantityDropdown.className = "wt-quantity-dropdown"
		quantityDropdown.addEventListener("change", () => {
			const quantity = parseInt(quantityDropdown.value, 10)
			// Update the selectedTickets array with the selected quantity, ticketId, and currency
			const existingTicket = selectedTickets.find(
				selected => selected.ticket === ticket.name
			)
			if (existingTicket) {
				existingTicket.quantity = quantity
			} else {
				selectedTickets.push({
					ticket: ticket.name,
					quantity,
					ticketId: ticket._id,
					currency: ticket.currency,
				})
			}
			// Calculate the total amount
			calculateTotal()
		})

		for (let i = 0; i <= 10; i++) {
			const option = document.createElement("option")
			option.value = i
			option.textContent = i
			quantityDropdown.appendChild(option)
		}

		const metaData = document.createElement("div")
		const cartData = document.createElement("div")
		cartData.className = "wt-cart-data"

		metaData.appendChild(ticketName)
		metaData.appendChild(ticketDescription)
		cartData.appendChild(ticketPrice)
		cartData.appendChild(quantityDropdown)

		ticketDiv.appendChild(metaData)
		ticketDiv.appendChild(cartData)

		// Append the ticket div to the events div
		eventsDiv.appendChild(ticketDiv)
		eventsDiv.append(footer)
	})

	function redirectToCheckout(selectedTickets) {
		const checkoutUrl = "http://localhost:3000/process-checkout"

		// Check if there are selected tickets and perform the redirect
		if (selectedTickets.length > 0) {
			const stringArray = JSON.stringify(selectedTickets)
			// Open the checkout URL in a new tab or window with the query string
			window.open(`${checkoutUrl}?cart=${stringArray}`, "_blank")
		} else {
			// If no tickets are selected, you can display an error message or take appropriate action
			alert("Please select tickets before proceeding to checkout.")
		}
	}

	// Add a click event listener to the log button (Checkout Now)
	const logButton = document.getElementById("wt-checkout-button")
	logButton.addEventListener("click", () => {
		redirectToCheckout(selectedTickets)
	})
}

// Call the populateEventsDiv function when the DOM is ready
document.addEventListener("DOMContentLoaded", populateEventsDiv)
