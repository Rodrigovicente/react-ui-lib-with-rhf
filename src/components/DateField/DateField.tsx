import { DateValue, useDateField, useDateSegment } from '@react-aria/datepicker'
import {
	DateFieldState,
	DateSegment,
	useDateFieldState,
	// DateFieldStateOptions,
} from '@react-stately/datepicker'
import {
	GregorianCalendar,
	parseDate,
	CalendarDate,
} from '@internationalized/date'
import React, {
	RefAttributes,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react'
import s from './DateField.module.css'

import { useController, type Control } from 'react-hook-form'

function createCalendar(identifier: string) {
	switch (identifier) {
		case 'gregory':
			return new GregorianCalendar()
		default:
			throw new Error(`Unsupported calendar ${identifier}`)
	}
}

type SharedDateFieldProps = {
	hourCycle?: 12 | 24
	disabled?: boolean
	readonly?: boolean
	required?: boolean
	isValid?: boolean
	autoFocus?: boolean
	granularity?: 'day' | 'hour' | 'minute' | 'second'
	maxGranularity?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
	children?: React.ReactNode
	labelledBy?: string
	minValue?: CalendarDate
	maxValue?: CalendarDate
	locale?:
		| 'pt-BR'
		| 'en-US'
		| 'es-ES'
		| 'fr-FR'
		| 'de-DE'
		| 'it-IT'
		| 'ja-JP'
		| 'ko-KR'
		| 'zh-CN'
		| 'zh-TW'
		| 'ru-RU'
		| 'nl-NL'
		| 'pl-PL'
		| 'pt-PT'
		| 'sv-SE'
		| 'tr-TR'
		| 'vi-VN'
		| 'th-TH'
		| 'cs-CZ'
		| 'el-GR'
		| 'id-ID'
		| 'ms-MY'
		| 'nb-NO'
		| 'fa-IR'
		| 'he-IL'
		| 'ar-SA'
		| 'hi-IN'
		| 'ur-PK'
	onChange?: (e: any) => any
	onBlur?: (e: any) => any
	[index: string]: any
}

type ControlledDateFieldProps = {
	control: Control<any>
	name: string
} & SharedDateFieldProps

type UncontrolledDateFieldProps = {
	control?: never
	name?: string
} & SharedDateFieldProps

type DateFieldProps = ControlledDateFieldProps | UncontrolledDateFieldProps

const DateField: React.FC<DateFieldProps> = React.forwardRef<
	| {
			value: Date | null
			reactAriaValue: DateValue
			ref: HTMLDivElement | null
	  }
	| undefined,
	DateFieldProps
>(({ control, name, ...props }, ref) => {
	// console.log('2. RENDERING DATE FIELD')
	if (control !== undefined) {
		return <ControlledDateField control={control} name={name} {...props} />
	}

	return <UncontrolledDateField ref={ref} name={name} {...props} />
})

const UncontrolledDateField: React.FC<UncontrolledDateFieldProps> =
	React.forwardRef<
		| {
				value: Date | null
				reactAriaValue: DateValue
				ref: HTMLDivElement | null
		  }
		| undefined,
		UncontrolledDateFieldProps
	>(
		(
			{
				hourCycle,
				disabled,
				readonly,
				required,
				isValid,
				autoFocus,
				granularity,
				maxGranularity,
				labelledBy,
				locale,
				onChange: extOnChange,
				onBlur: extOnBlur,
				...props
			},
			ref
		) => {
			// const controller = useController({ control, name: props.name })

			// console.log('CONTROLLER', controller)

			const onChangeHandler = extOnChange
				? (date: DateValue) => {
						// console.log('ONCHANGE', date)
						extOnChange({
							target: { event: date?.toString(), name: props.name },
						})
						return date
				  }
				: undefined

			// const onBlurHandler = (e: any) => {
			// 	console.debug('BLUR', e)
			// 	return extOnBlur?.(e)
			// }

			const state = useDateFieldState({
				...props,
				locale: locale ?? 'pt-BR',
				isDisabled: disabled ?? false,
				isReadOnly: readonly ?? false,
				hourCycle,
				maxGranularity,
				granularity,
				isRequired: required ?? false,
				validationState:
					isValid !== undefined ? (isValid ? 'valid' : 'invalid') : undefined,
				autoFocus,
				onChange: onChangeHandler,
				// onBlur: extOnBlur,
				createCalendar,
			})

			const domRef = useRef<HTMLDivElement>(null)

			useImperativeHandle(
				ref,
				() => {
					// console.log('imperative handle')
					// if (typeof ref === 'function') {
					// 	ref(domRef.current)
					// }

					// console.log(state)
					if (state.value === null || state.value === undefined)
						return undefined

					const { day, month, year } = state.value

					const date = new Date(`${year}-${month}-${day}T00:00:00`)
					// console.log(date)

					if (isNaN(+date)) return undefined

					return {
						value: date,
						reactAriaValue: state.value,
						ref: domRef.current,
					}
					// return domRef.current!
				},
				[state]
			)

			const { labelProps, fieldProps } = useDateField(
				{
					...props,
					isDisabled: disabled ?? false,
					isReadOnly: readonly ?? false,
					hourCycle,
					granularity,
					isRequired: required ?? false,
					validationState:
						isValid !== undefined ? (isValid ? 'valid' : 'invalid') : undefined,
					autoFocus,
					// onOpenChange: onChangeHandler,
					onBlur: extOnBlur,
				},
				state,
				domRef
			)

			// console.log('ref', ref)
			// console.log('domRef', domRef)
			// console.log('onChange', extOnChange)

			// const datetest = parseZonedDateTime(`2021-11-07T00:45[America/Sao_Paulo]`)
			// const datetest = parseAbsolute(
			// 	new Date().toISOString(),
			// 	'America/Sao_Paulo'
			// )
			// console.log('>>>>>>>>>', datetest)
			// console.log('------->', fieldProps)
			// console.log('====>', createCalendar('gregory'))

			const labelledByObj = labelledBy ? { 'aria-labelledby': labelledBy } : {}

			const Input = (
				<div
					{...fieldProps}
					{...labelledByObj}
					ref={domRef}
					className={
						'inputfield datefield ' +
						s.field +
						(state.validationState === 'invalid' ? ' invalid' : '')
					}
				>
					{state.segments.map((segment, i) => {
						return <Segment key={i} segment={segment} state={state} />
					})}
				</div>
			)

			return props.label !== undefined ? (
				<div className="input-wrapper">
					<label {...labelProps} className="input-label">
						{props.label}
					</label>
					{Input}
				</div>
			) : (
				Input
			)
		}
	)

/*



		CONTROLLED DATE FIELD
*/
const ControlledDateField: React.FC<ControlledDateFieldProps> =
	React.forwardRef<
		| {
				value: Date | null
				reactAriaValue: DateValue
				ref: HTMLDivElement | null
		  }
		| undefined,
		ControlledDateFieldProps
	>(
		(
			{
				control,
				hourCycle,
				disabled,
				readonly,
				required,
				isValid,
				autoFocus,
				granularity,
				maxGranularity,
				labelledBy,
				locale,
				onChange: extOnChange,
				onBlur: extOnBlur,
				...props
			},
			ref
		) => {
			const controller = useController({ control, name: props.name })

			// console.log('3. RENDERING CONTROLLED DATE FIELD')

			const onChangeHandler = (date: DateValue) => {
				// console.log('ONCHANGE', date)
				extOnChange?.({
					target: { event: date?.toString(), name: props.name },
				})

				if (date === null || date === undefined) {
					controller.field.onChange(undefined)
					return undefined
				}

				const { day, month, year } = date
				const dateValue = new Date(
					`${year.toString().padStart(4, '0')}-${month
						.toString()
						.padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`
				)

				controller.field.onChange(dateValue)
				return date
			}

			const onBlurHandler = (e: any) => {
				extOnBlur?.(e)
				controller.field.onBlur()
				return e
			}

			const state = useDateFieldState({
				...props,
				value: controller.field.value
					? parseDate(controller.field.value.toISOString().slice(0, 10))
					: undefined,
				locale: locale ?? 'pt-BR',
				isDisabled: disabled ?? false,
				isReadOnly: readonly ?? false,
				hourCycle,
				maxGranularity,
				granularity,
				isRequired: required ?? false,
				validationState:
					isValid !== undefined ? (isValid ? 'valid' : 'invalid') : undefined,
				autoFocus,
				onChange: onChangeHandler,
				// onBlur: extOnBlur,
				createCalendar,
			})

			const domRef = useRef<HTMLDivElement>(null)

			useImperativeHandle(
				ref,
				() => {
					// console.log('imperative handle')
					// if (typeof ref === 'function') {
					// 	ref(domRef.current)
					// }

					// console.log(state)
					if (state.value === null || state.value === undefined) {
						// controller.field.ref(returnValue)
						return undefined
					}

					const { day, month, year } = state.value

					const date = new Date(
						`${year}-${month.toString().padStart(2, '0')}-${day
							.toString()
							.padStart(2, '0')}T00:00:00.000Z`
					)
					// console.log(date)

					if (isNaN(+date)) {
						// controller.field.ref(returnValue)
						return undefined
					}

					return {
						value: date,
						reactAriaValue: state.value,
						ref: domRef.current,
					}
				}
				// [state]
			)

			// useEffect(() => {
			// 	console.log(`state value`, state.value)
			// }, [state.value])

			useImperativeHandle(controller.field.ref, () => {
				if (domRef.current == null) return undefined
				return domRef.current
			})

			const { labelProps, fieldProps } = useDateField(
				{
					...props,
					isDisabled: disabled ?? false,
					isReadOnly: readonly ?? false,
					hourCycle,
					granularity,
					isRequired: required ?? false,
					validationState:
						isValid !== undefined ? (isValid ? 'valid' : 'invalid') : undefined,
					autoFocus,
					// onOpenChange: onChangeHandler,
					onBlur: onBlurHandler,
				},
				state,
				domRef
			)

			// console.log('ref', ref)
			// console.log('domRef', domRef)
			// console.log('onChange', extOnChange)

			// const datetest = parseZonedDateTime(`2021-11-07T00:45[America/Sao_Paulo]`)
			// const datetest = parseAbsolute(
			// 	new Date().toISOString(),
			// 	'America/Sao_Paulo'
			// )
			// console.log('>>>>>>>>>', datetest)
			// console.log('------->', fieldProps)
			// console.log('====>', createCalendar('gregory'))

			const labelledByObj = labelledBy ? { 'aria-labelledby': labelledBy } : {}
			// console.log('>>>>>>', controller.field.ref)

			// const testRef = (ref: any) => {
			// 	console.log('~~~~~>', ref)
			// 	ref?.focus?.()
			// }

			const Input = (
				<div
					{...fieldProps}
					{...labelledByObj}
					ref={domRef}
					className={
						'inputfield datefield ' +
						s.field +
						(controller.fieldState.invalid ? ' invalid' : '')
					}
				>
					{state.segments.map((segment, i) => {
						if (i === 0)
							return (
								<Segment
									key={i}
									segment={segment}
									state={state}
									ref={controller.field.ref}
									// ref={testRef}
								/>
							)
						else return <Segment key={i} segment={segment} state={state} />
					})}
				</div>
			)

			return props.label !== undefined ? (
				<div className="input-wrapper">
					<label {...labelProps} className="input-label">
						{props.label}
					</label>
					{Input}
					{controller.fieldState.invalid && (
						<span className="input-error">
							{controller.fieldState.error?.message}
						</span>
					)}
				</div>
			) : (
				Input
			)
		}
	)

const Segment: React.FC<
	{
		segment: DateSegment
		state: DateFieldState
	} & RefAttributes<HTMLSpanElement | undefined>
> = forwardRef<
	HTMLSpanElement | undefined,
	{
		segment: DateSegment
		state: DateFieldState
	}
>(({ segment, state }, ref) => {
	// console.log('4. RENDERING SEGMENT')
	// console.log('|-> ', segment)

	const domRef = React.useRef<HTMLSpanElement>(null)

	// useEffect(() => {
	// 	if (typeof ref === 'function') ref(domRef.current)

	// 	console.log('domRef', domRef.current)

	// 	return () => {
	// 		if (typeof ref === 'function') ref(null)
	// 	}
	// }, [domRef.current])

	// console.log('domRef', domRef.current)

	const { segmentProps } = useDateSegment(segment, state, domRef)

	useImperativeHandle(ref, () => {
		return domRef.current ?? undefined
	})

	if (
		segment.type === 'literal' &&
		(segment.text === '/' || segment.text === ':')
	) {
		return (
			<span
				ref={domRef}
				{...segmentProps}
				className={'separator ' + s.separator}
			>
				{segment.text}
			</span>
		)
	}

	return (
		<span ref={domRef} {...segmentProps}>
			{segment.text}
		</span>
	)
})

export default DateField
