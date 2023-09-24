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

// Function to fetch data from the API
async function fetchTicketData(eventId) {
	try {
		const apiUrl = `https://wow.tickets/api/tickets/event/${eventId}`
		const response = await fetch(apiUrl)
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error fetching data:", error)
		return null
	}
}

// Function to populate the events div with ticket details
async function populateEventsDiv() {
	// Extract event ID from the div's id attribute
	const divId = "event-listing-64f9f939cef9f4d4c9b18418" // Replace with actual ID
	const eventId = divId.replace("event-listing-", "")

	const eventsDiv = document.getElementById(divId)

	if (!eventsDiv) {
		console.error("Events div not found.")
		return
	}

	// Create an array to store selected ticket details
	const selectedTickets = []

	// Fetch ticket data from the API using the extracted event ID
	const tickets = await fetchTicketData(eventId)

	if (!tickets) {
		console.error("No ticket data found.")
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
				totalAmount += selectedTicket.quantity * ticket.price
			}
		})

		// Update the button text to display the total amount with currency
		const logButton = document.getElementById("log-button")
		if (logButton) {
			if (currency) {
				logButton.textContent = `Checkout Now - ${totalAmount.toFixed(
					2
				)}${getCurrencySymbol(currency)}`
			} else {
				logButton.textContent = "Checkout Now"
			}
		}
	}

	// Iterate through the ticket data and create divs for each ticket
	tickets.forEach(ticket => {
		const ticketDiv = document.createElement("div")
		ticketDiv.className = "ticket-details"

		// Extract ticket details (name, description, price, currency) and populate the div
		const ticketName = document.createElement("h3")
		ticketName.className = "ticket-name"
		ticketName.textContent = ticket.name

		const ticketDescription = document.createElement("p")
		ticketDescription.className = "ticket-description"
		ticketDescription.textContent = ticket.description

		const ticketPrice = document.createElement("p")
		ticketPrice.className = "ticket-price"
		ticketPrice.textContent = `Price: ${ticket.price} ${getCurrencySymbol(
			ticket.currency
		)}`

		// Create a dropdown input for selecting quantity
		const quantityDropdown = document.createElement("select")
		quantityDropdown.className = "quantity-dropdown"
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
		cartData.className = "cart-data"

		metaData.appendChild(ticketName)
		metaData.appendChild(ticketDescription)
		cartData.appendChild(ticketPrice)
		cartData.appendChild(quantityDropdown)

		ticketDiv.appendChild(metaData)
		ticketDiv.appendChild(cartData)

		// Append the ticket div to the events div
		eventsDiv.appendChild(ticketDiv)
	})

	// Add a click event listener to the log button (Checkout Now)
	const logButton = document.getElementById("log-button")
	logButton.addEventListener("click", () => {
		console.log(selectedTickets)
		// You can perform the checkout action here
	})
}

// Call the populateEventsDiv function when the DOM is ready
document.addEventListener("DOMContentLoaded", populateEventsDiv)
