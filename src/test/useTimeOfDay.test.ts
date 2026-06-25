import { describe, expect, it } from 'vitest'
import { getTimeSlot } from '../hooks/useTimeOfDay'

describe('getTimeSlot logic', () => {
  it('correctly categorizes hours into morning, day, and night slots', () => {
    expect(getTimeSlot(5)).toBe('morning')
    expect(getTimeSlot(11)).toBe('morning')
    expect(getTimeSlot(12)).toBe('day')
    expect(getTimeSlot(17)).toBe('day')
    expect(getTimeSlot(18)).toBe('night')
    expect(getTimeSlot(0)).toBe('night')
    expect(getTimeSlot(4)).toBe('night')
  })
})
