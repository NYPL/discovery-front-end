import sinon, { stub } from 'sinon'
import { expect } from 'chai'

import NyplApiClient from '@nypl/nypl-data-api-client';

import { _buildTimeString, _calculateDeliveryTime, _determineNextDeliverableDay, _expectedAvailableDay, _operatingHours, getPickupTimeEstimate, _buildEstimationString, _calculateWindow, _resetCacheForTesting } from '../../src/app/utils/pickupTimeEstimator'

describe('pickupTimeEstimator', () => {
	let clientStub
	const hoursArray = [{
		day: 'Thursday',
		startTime: '2023-06-01T14:00:00+00:00',
		endTime: '2023-06-01T23:00:00+00:00',
		today: true
	},
	{
		day: 'Friday',
		startTime: '2023-06-02T14:00:00+00:00',
		endTime: '2023-06-02T23:00:00+00:00',
		nextDeliverableDay: true
	},
	{
		day: 'Saturday',
		startTime: '2023-06-03T14:00:00+00:00',
		endTime: '2023-06-03T23:00:00+00:00'
	},
	{
		day: 'Monday',
		startTime: '2023-06-05T14:00:00+00:00',
		endTime: '2023-06-05T23:00:00+00:00'
	},
	{
		day: 'Tuesday',
		startTime: '2023-06-06T14:00:00+00:00',
		endTime: '2023-06-06T20:00:00+00:00'
	},
	{
		day: 'Wednesday',
		startTime: '2023-06-07T14:00:00+00:00',
		endTime: '2023-06-07T20:00:00+00:00'
	}]
	before(() => {
		clientStub = stub(NyplApiClient.prototype, 'get').callsFake((path) => {
			if (path.includes('sc')) {
				return Promise.resolve({
					sc:
						[{
							label: null, hours: hoursArray
						}]
				})
			}
			else return Promise.resolve({})
		})
		afterEach(() => { clientStub.resetHistory() })
		after(() => clientStub.restore())
	})

	describe('getPickupTimeEstimate', () => {
		it('in approximately 45 minutes TODAY', async () => {
			expect(await getPickupTimeEstimate('fulfillment:sasb-onsite', 'sc', '2023-06-01T16:00:00+00:00')).to.equal('in approximately 45 minutes TODAY')
		})
		it('by approximately OPENING TOMORROW', async () => {
			expect(await getPickupTimeEstimate('fulfillment:sasb-onsite', 'sc', '2023-06-01T22:00:00+00:00')).to.equal('by approximately 11:00 am TOMORROW')
		})
		it('request made after request cutoff time, library is closed tomorrow', async () => {
			expect(await getPickupTimeEstimate('fulfillment:sasb-onsite', 'sc', '2023-06-03T22:00:00+00:00')).to.equal('by approximately 11:00 am Monday Jun. 5')
		})
	})

	describe('_operatingHours', () => {
		afterEach(() => _resetCacheForTesting())
		it('should return hours array', async () => {
			expect(await _operatingHours('sc')).to.deep.equal(hoursArray)
		})
		it('should return an empty array if response is mangled', async () => {
			expect(await _operatingHours('xx')).to.deep.equal([])
		})
		it('should only make one get request for successive calls', async () => {
			await _operatingHours('sc')
			await _operatingHours('sc')
			const hours = await _operatingHours('sc')
			expect(sinon.assert.calledOnce(clientStub))
			expect(hours).to.deep.equal(hoursArray)
		})
		it('should fetch new hours if it is expired', async () => {
			// set cache with expired time
			_resetCacheForTesting(1687449047066)
			await _operatingHours('sc')
			await _operatingHours('sc')
			expect(sinon.assert.calledOnce(clientStub))
		})
	})

	describe('_expectedAvailableDay', () => {
		it('request made in time for today', async () => {
			const fromDate = '2023-06-01T16:00:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, 270000)
			expect(availableDay.today)
			expect(availableDay.day).to.equal('Thursday')
		})
		it('request made after cutoff time today', async () => {
			const fromDate = '2023-06-01T22:30:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, .75 * 3600 * 1000)
			expect(availableDay.day).to.equal('Friday')
		})
		it('request made before cutoff but too late for duration today', async () => {
			const fromDate = '2023-06-01T20:30:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, 4 * 3600 * 1000)
			expect(availableDay.day).to.equal('Friday')
		})
		it('request made before cutoff but too late for duration today - loong duration', async () => {
			const fromDate = '2023-06-01T14:00:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, 72 * 3600 * 1000)
			expect(availableDay.day).to.equal('Monday')
		})
		it('request made one week before today, duration 2 hrs', async () => {
			const fromDate = '2023-05-25T14:00:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, 2 * 3600 * 1000)
			expect(availableDay.day).to.equal('Thursday')
		})
		it('request made today before opening, duration 2 hrs', async () => {
			const fromDate = '2023-06-01T07:00:00+00:00'
			const availableDay = await _expectedAvailableDay('sc', fromDate, 2 * 3600 * 1000)
			expect(availableDay.day).to.equal('Thursday')
		})
	})
	describe('_determineNextDeliverableDay', () => {
		it('today is tuesday and delivery day is wednesday', () => {
			expect(_determineNextDeliverableDay(2, 3)).to.equal('tomorrow')
		})
		it('today is saturday and delivery day is sunday', () => {
			expect(_determineNextDeliverableDay(6, 0)).to.equal('tomorrow')
		})
		it('today is deliverable day', () => {
			expect(_determineNextDeliverableDay(2, 2)).to.equal('today')
		})
		it('today is monday and delivery day is wednesday', () => {
			expect(_determineNextDeliverableDay(1, 3)).to.equal('two or more days')
		})
	})
	describe('_buildTimeString', () => {
		it('time is on the quarter hour', () => {
			const estimatedDeliveryTime = new Date('2023-06-01T16:00:30.000')
			expect(_buildTimeString(estimatedDeliveryTime)).to.equal('4:00 pm')
		})
		it('time is one minute after the quarter hour', () => {
			const estimatedDeliveryTime = new Date('2023-06-01T16:01:30.000')
			expect(_buildTimeString(estimatedDeliveryTime)).to.equal('4:15 pm')
		})
		it('time is one minute before the quarter hour', () => {
			const estimatedDeliveryTime = new Date('2023-06-01T16:59:30.000')
			expect(_buildTimeString(estimatedDeliveryTime)).to.equal('5:00 pm')
		})
	})
	describe('_buildEstimationString', () => {
		const duration = 'PT45M'
		it('today, active hold request', () => {
			const availableDay = {
				available: 'today', estimatedDeliveryTime: new Date('2023-06-01T11:00:30.000')
			}
			expect(_buildEstimationString(availableDay, true, duration)).to.equal('at approximately 11:00 am TODAY')
		})
		it('today, not active hold request', () => {
			const availableDay = {
				available: 'today', estimatedDeliveryTime: new Date('2023-06-01T11:00:30.000')
			}
			expect(_buildEstimationString(availableDay, false, duration)).to.equal('in approximately 45 minutes TODAY')
		})
		it('tomorrow', () => {
			const availableDay = {
				available: 'tomorrow', estimatedDeliveryTime: new Date('2023-06-01T11:00:30.000')
			}
			expect(_buildEstimationString(availableDay, true, duration)).to.equal('by approximately 11:00 am TOMORROW')
		})
		it('two or more days', () => {
			const availableDay = {
				day: 'Thursday',
				available: 'two or more days', estimatedDeliveryTime: new Date('2023-06-01T11:00:30.000')
			}
			expect(_buildEstimationString(availableDay, true, 'P2D')).to.equal('by approximately 11:00 am Thursday Jun. 1')
		})
	})
	describe('_calculateDeliveryTime', () => {
		it('should return the provisionalDeliveryTime if it\'s deliverable today', () => {
			const pdt = 1686682891000
			expect(Date.parse(_calculateDeliveryTime('today', pdt, null))).to.equal(pdt)
		})
		it('should return the start time plus opening buffer if it is not deliverable until tomorrow or later', () => {
			const startMs = 1686682891000
			const start = new Date(startMs)
			const buffer = 1 * 60 * 60 * 1000
			expect(Date.parse(_calculateDeliveryTime('tomorrow', null, start))).to.equal(startMs + buffer)
		})
	})
	describe('_calculateWindow', () => {
		it('45 minutes', () => {
			expect(_calculateWindow('PT45M')).to.equal('45 minutes')
		})
		it('1 hour 45 minutes', () => {
			expect(_calculateWindow('PT1H45M')).to.equal('1 hour 45 minutes')
		})
		it('2 hours 45 minutes', () => {
			expect(_calculateWindow('PT2H45M')).to.equal('2 hours 45 minutes')
		})
		it('2 hours', () => {
			expect(_calculateWindow('PT2H')).to.equal('2 hours')
		})
		it('no hours or mins', () => {
			expect(_calculateWindow('PT0H0M')).to.equal('')
		})
	})
})