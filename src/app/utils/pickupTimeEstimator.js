import { parse as parseDuration, toSeconds } from 'iso8601-duration'
import nyplCoreObjects from '@nypl/nypl-core-objects'
const fulfillments = nyplCoreObjects('by-fulfillment')
import nyplApiClient from '../../server/routes/nyplApiClient'


const OPENING_BUFFER = 1 * 60 * 60 * 1000
const REQUEST_CUTOFF_TIME = 2 * 60 * 60 * 1000

// is fromDate after endtime - request_cutoff+time ? next_day + buffer
// else
// is fromDate + duration greater than startTime and less than endTime, return fromDate + duration
// else

// otherwise return next starttime + buffer
// return the next time that this book will probably be ready



export const getPickupTimeEstimate = (fulfillmentId, deliveryLocation, fromDate = new Date()) => {
	// Look up item’s linked fulfillment entity in NYPL-Core:
	const fulfillment = fulfillments[fulfillmentId]
	// Convert duration to seconds:
	const durationSeconds = toSeconds(parseDuration(fulfillment.estimatedTime))

	// Adjust duration based on opening hours:
	let adjustedTime = _expectedAvailableDay(estimatedTime)
	// Use fulfillment linked location if no deliveryLocation specified:
	deliveryLocation = deliveryLocation || fulfillment.location

	const availableDay = _expectedAvailableDay(deliveryLocation, fromDate, durationSeconds * 1000)

	//if(availableDay.today) return fromDate + duration
	// else return starttime + opening buffer
}

export const _buildEstimationString = (day) => {

}

// Delivery location should be sc, ma, or my (2 letter codes for each research branch)
export const _expectedAvailableDay = async (deliveryLocation, requestTime, duration) => {
	const locationHours = await _operatingHours(deliveryLocation)
	let available
	let today = locationHours[0].startTime.getDate()
	const hours = locationHours.find((day, i) => {
		const { endTime } = day
		const endTimeInMs = Date.parse(endTime)
		const estimatedDeliveryTimeMs = Date.parse(requestTime) + duration
		const requestTimeMs = Date.parse(requestTime)
		const finalRequestTimeMs = endTimeInMs - REQUEST_CUTOFF_TIME
		// if request was made after request cutoff time, today is not your day
		if (requestTimeMs > finalRequestTimeMs) return false
		// return true when estimated delivery time is before the 
		// end of the current day day
		if (estimatedDeliveryTimeMs < endTimeInMs) {
			// determine if that is today, tomorrow, or two days from now.
			const nextBusinessDay = new Date(estimatedDeliveryTimeMs).getDate()
			available = _calculateNextBusinessDay(today, nextBusinessDay, i)
			return true
		}
	})
	return { ...hours, available }
}

export const _calculateNextBusinessDay = (today, nextBusinessDay, i) => {
	if (i === 0) return 'today'
	// today is tuesday and delivery day is wednesday
	if (nextBusinessDay - today === 1) return 'tomorrow'
	// today is saturday and delivery day is sunday
	if (today === 6 && nextBusinessDay === 0) return 'tomorrow'
	// today is monday and delivery day is more than one day away
	else return 'two or more days'
	// TO DO: what happens if the library is closed for a week?
}

export const _operatingHours = async (deliveryLocation) => {
	const client = await nyplApiClient()
	const resp = await client.get(`/locations?location_codes=${deliveryLocation}&fields=hours`)
	if (!resp || !resp[deliveryLocation] || !resp[deliveryLocation][0] || !resp[deliveryLocation][0].hours) {
		return []
	}
	return resp[deliveryLocation][0].hours
}