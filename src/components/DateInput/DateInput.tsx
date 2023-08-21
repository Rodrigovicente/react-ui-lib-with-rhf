import React, { useState, useRef, useEffect } from 'react'

interface IDateInputProps {
	format: string
	[index: string]: any
}

// interface IInputValue {
// 	raw: string
// 	formatted: string
// }

const dateFormatPattern =
	/^(dd|mm|yy(yy)?)((-|\/| - | \/ )(?!.*\1)(dd|mm|yy(yy)?))?((-|\/| - | \/ )(?!.*\1)(?!.*\3)(dd|mm|yy(yy)?))?$/i

const DateInput: React.FC<IDateInputProps> = ({
	format: rawFormat,
	...props
}) => {
	if (!rawFormat.match(dateFormatPattern)) {
		throw new Error("DateInput format isn't valid")
	}
	const format = rawFormat.toLowerCase()

	const [inputState, setInputState] = useState<{
		value: string
		caretPos: number | null
	}>({
		value: '',
		caretPos: null,
	})

	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (inputState.caretPos)
			inputRef.current?.setSelectionRange(
				inputState.caretPos,
				inputState.caretPos
			)
	}, [inputState])

	function updateInputState(state: {
		value?: string
		caretPos?: number | null
	}) {
		setInputState(prev => {
			return {
				...prev,
				...state,
			}
		})
	}

	function updateValue(value: string) {
		setInputState(prev => {
			return {
				...prev,
				value,
			}
		})
	}
	// function updateCaretPos(pos: number | null) {
	// 	setInputState(prev => {
	// 		return {
	// 			...prev,
	// 			caretPos: pos,
	// 		}
	// 	})
	// }

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.currentTarget.value
		const newFormatted = formatDateString(format, e.currentTarget.value)

		let caretPos = e.currentTarget.selectionStart

		const autoInsertedCharCount = newFormatted.length - newValue.length

		if (
			caretPos !== null &&
			newValue.length <= format.length &&
			newValue.length >= inputState.value.length
		) {
			caretPos += autoInsertedCharCount
			caretPos = caretPos < 0 ? 0 : caretPos
		}

		updateInputState({ value: newFormatted, caretPos: caretPos })
	}

	function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
		const newValue = e.currentTarget.value

		if (validateDateString(format, newValue)) {
			// setValue('')
		} else {
			updateValue('')
		}
	}

	function getDateStringValue(): string {
		const i = {
			day: [format.indexOf('dd'), 2],
			month: [format.indexOf('mm'), 2],
			year: [format.indexOf('yyyy'), 4],
		}
		if (i.year[0] === -1) i.year = [format.indexOf('yy'), 2]

		// const formatHas = {
		// 	day: format.indexOf('dd') !== -1,
		// 	month: format.indexOf('mm') !== -1,
		// 	year: format.indexOf('yyyy') !== -1,
		// }
		// if (!formatHas.year) formatHas.year = format.indexOf('yy') !== -1

		const formatHas = {
			day: i.day[0] !== -1,
			month: i.month[0] !== -1,
			year: i.year[0] !== -1,
		}

		const has: {
			day: boolean
			month: boolean
			year: boolean
		} = {
			day: formatHas.day
				? inputState.value.slice(i.day[0], i.day[0] + i.day[1]).length > 0
				: false,
			month: formatHas.month
				? inputState.value.slice(i.month[0], i.month[0] + i.month[1]).length > 0
				: false,
			year: formatHas.year
				? inputState.value.slice(i.year[0], i.year[0] + i.year[1]).length > 0
				: false,
		}

		if (has.year && has.month && has.day) {
			return getDateValue(format, inputState.value).toISOString()
		}

		return inputState.value
	}

	return (
		<div>
			<input type="hidden" value={getDateStringValue()} {...props} />
			<input
				type="text"
				value={inputState.value}
				onChange={handleInputChange}
				onBlur={handleInputBlur}
				ref={inputRef}
			/>
			<span>{getDateStringValue()}</span>
		</div>
	)
}

function formatDateString(format: string, value: string): string {
	// value = fillDateStringSlots(format, value)
	// console.log('=>', value)
	const digits = value.replace(/\D/g, '')
	let formatted = format

	let i = 0,
		separatorCount = 0,
		counter = 0

	for (; i < digits.length; i++) {
		while (!formatted[i + counter]?.match(/[dmy]/i)) {
			counter++

			if (i + counter > formatted.length) {
				return formatted.slice(0, i + separatorCount)
			}
		}

		separatorCount = counter

		formatted = replaceStringAt(formatted, i + separatorCount, digits[i])
	}
	return formatted.slice(0, i + separatorCount)
}

/*
function fillDateStringSlots(format: string, value: string): string {
	const i = {
		day: [format.indexOf('dd'), 2],
		month: [format.indexOf('mm'), 2],
		year: [format.indexOf('yyyy'), 4],
	}
	if (i.year[0] === -1) i.year = [format.indexOf('yy'), 2]

	const formatHas = {
		day: i.day[0] !== -1,
		month: i.month[0] !== -1,
		year: i.year[0] !== -1,
	}

	const has: {
		day: boolean
		month: boolean
		year: boolean
	} = {
		day: formatHas.day
			? value.slice(i.day[0], i.day[0] + i.day[1]).length > 0
			: false,
		month: formatHas.month
			? value.slice(i.month[0], i.month[0] + i.month[1]).length > 0
			: false,
		year: formatHas.year
			? value.slice(i.year[0], i.year[0] + i.year[1]).length > 0
			: false,
	}

	const values = {
		day: has.day ? substringTillNonNumerical(value, i.day[0]).substring : '',
		month: has.month
			? substringTillNonNumerical(value, i.month[0]).substring
			: '',
		year: has.year ? substringTillNonNumerical(value, i.year[0]).substring : '',
	}

	// if (i.year[0] >= 0) {
	// 	const yearStr = value.slice(i.year[0], i.year[0] + i.year[1])

	// 	if (!yearStr.match(/^[0-9]+$/)) value = insertCharAt(value, i.year[1], '0')
	// }

	// console.log('FORMAT HAS', formatHas)
	// console.log('HAS', has)
	// console.log('VALUES', values)

	if (has.day) {
		if (values.day.length < i.day[1]) {
			values.day = values.day.padStart(i.day[1], '0')
		} else if (values.day.length > i.day[1]) {
			const zeroIndex = values.day.indexOf('0')
			if (zeroIndex !== -1) {
				values.day = replaceStringAt(values.day, zeroIndex, '')
			} else {
				// don't change day value
			}
		}
	}

	if (has.month) {
		if (values.month.length < i.month[1]) {
			values.month = values.month.padStart(i.month[1], '0')
		} else if (values.month.length > i.month[1]) {
			const zeroIndex = values.month.indexOf('0')
			if (zeroIndex !== -1) {
				values.month = replaceStringAt(values.month, zeroIndex, '')
			} else {
				// don't change month value
			}
		}
	}

	if (has.year) {
		if (values.year.length < i.year[1]) {
			values.year = values.year.padStart(i.year[1], '0')
		} else if (values.year.length > i.year[1]) {
			const zeroIndex = values.year.indexOf('0')
			if (zeroIndex !== -1) {
				values.year = replaceStringAt(values.year, zeroIndex, '')
			} else {
				// don't change year value
			}
		}
	}
	/*
	if (i.month[0] >= 0) {
		const { substring: monthStr, isFinal } = substringTillNonNumerical(
			value,
			i.month[0]
		)
		console.log('mothstr', monthStr)
		console.log('final', isFinal)

		if (
			!isFinal &&
			monthStr.length < i.month[1]
			// !monthStr.match(/^[0-9]+$/)
		) {
			console.log('removing')
			console.log('b', value)
			value = insertCharAt(value, i.month[0], '0')
			console.log('a', value)
		} else if (!isFinal && monthStr.length > i.month[1]) {
			console.log('adding')
			value = replaceStringAt(value, i.month[0], '')
			console.log('new', value)
		}
	}
* /

	let returnValue = format

	if (formatHas.day && has.day) {
		returnValue = returnValue.replace('dd', values.day)
	}
	if (formatHas.month && has.month) {
		returnValue = returnValue.replace('mm', values.month)
	}
	console.log('return', returnValue)

	return returnValue
}
*/

function validateDateString(format: string, value: string): boolean {
	if (format.length !== value.length) return false

	const i = {
		day: [format.indexOf('dd'), 2],
		month: [format.indexOf('mm'), 2],
		year: [format.indexOf('yyyy'), 4],
	}

	if (i.year[0] === -1) i.year = [format.indexOf('yy'), 2]

	const values: {
		// day: number | null
		month: number | null
		year: number | null
	} = {
		// day: null,
		month: null,
		year: null,
	}

	if (i.year[0] >= 0) {
		const yearStr = value.slice(i.year[0], i.year[0] + i.year[1])

		let year: number

		if (i.year[2] === 2) year = 1900 + +yearStr
		else year = +yearStr

		if (year < 0 || year > 9999) return false

		values.year = year
	}

	if (i.month[0] >= 0) {
		const month = +value.slice(i.month[0], i.month[0] + i.month[1])

		if (month < 1 || month > 12) return false

		values.month = month
	}

	if (i.day[0] >= 0) {
		const day = +value.slice(i.day[0], i.day[0] + i.day[1])

		let monthDaysCount

		if (values.year && values.month) {
			monthDaysCount = new Date(
				Date.UTC(values.year, values.month, 0, 0, 0, 0)
			).getDate()
		} else {
			if (values.month) {
				const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

				monthDaysCount = monthDays[values.month - 1]
			} else {
				monthDaysCount = 31
			}
		}

		if (day < 0 || day > monthDaysCount) return false

		// values.day = day
	}

	return true
}

function getDateValue(format: string, value: string): Date {
	const i = {
		day: [format.indexOf('dd'), 2],
		month: [format.indexOf('mm'), 2],
		year: [format.indexOf('yyyy'), 4],
	}
	if (i.year[0] === -1) i.year = [format.indexOf('yy'), 2]

	const formatHas = {
		day: i.day[0] !== -1,
		month: i.month[0] !== -1,
		year: i.year[0] !== -1,
	}

	const has: {
		day: boolean
		month: boolean
		year: boolean
	} = {
		day: formatHas.day
			? value.slice(i.day[0], i.day[0] + i.day[1]).length > 0
			: false,
		month: formatHas.month
			? value.slice(i.month[0], i.month[0] + i.month[1]).length > 0
			: false,
		year: formatHas.year
			? value.slice(i.year[0], i.year[0] + i.year[1]).length > 0
			: false,
	}

	const today = new Date()

	const values = {
		day: has.day
			? +substringTillNonNumerical(value, i.day[0]).substring
			: today.getDate(),
		month: has.month
			? +substringTillNonNumerical(value, i.month[0]).substring
			: today.getMonth(),
		year: has.year
			? +substringTillNonNumerical(value, i.year[0]).substring
			: today.getFullYear(),
	}

	return new Date(Date.UTC(values.year, values.month - 1, values.day, 0, 0, 0))
}

function replaceStringAt(str: string, i: number, replacement: string) {
	if (
		typeof replacement !== 'string' ||
		typeof str !== 'string' ||
		typeof i !== 'number'
	)
		return str

	return (
		str.slice(0, i) +
		replacement +
		str.slice(i + (replacement.length > 0 ? replacement.length : 1))
	)
}

// function insertCharAt(str: string, i: number, insertion: string) {
// 	if (
// 		typeof insertion !== 'string' ||
// 		typeof str !== 'string' ||
// 		typeof i !== 'number'
// 	)
// 		return str

// 	return str.slice(0, i) + insertion + str.slice(i + insertion.length - 1)
// }

function substringTillNonNumerical(str: string, i = 0) {
	let endIndex = str.substring(i).search(/[^0-9]/)
	let isFinal: boolean
	// If the non-numerical character is not found, use the length of the remaining string
	if (endIndex === -1) {
		endIndex = str.substring(i).length
		isFinal = true
	} else {
		isFinal = false
	}

	return { substring: str.substring(i, i + endIndex), isFinal }
}

export default DateInput
