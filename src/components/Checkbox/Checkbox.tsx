import React, {
	ChangeEvent,
	Children,
	useEffect,
	useImperativeHandle,
} from 'react'
import { useController, type Control } from 'react-hook-form'
import { useCheckbox, AriaCheckboxProps } from '@react-aria/checkbox'
import { useToggleState } from '@react-stately/toggle'
import { useVisuallyHidden } from '@react-aria/visually-hidden'
import { useFocusRing } from '@react-aria/focus'
import s from './Checkbox.module.css'

type SharedCheckboxProps = {
	checked?: boolean
	isValid?: boolean
	disabled?: boolean
	readOnly?: boolean
	required?: boolean
	ref?: React.ForwardedRef<HTMLInputElement | undefined>
	// value: string
	// id?: string
	// isSelected?: boolean
	// isInderterminate?: boolean
	// children?: React.ReactNode
	// defaultSelected?: boolean
	// validationState?: 'valid' | 'invalid'
	// isDisabled?: boolean
	// isReadonly?: boolean
	// isRequired?: boolean
	// autoFocus?: boolean
	// onFocus?: (e: FocusEvent) => void
	// onBlur?: (e: FocusEvent) => void
	// onFocusChange?: (isSelected: boolean) => void
	// onChange?: (isSelected: boolean) => void
	// onKeyDown?: (e: KeyboardEvent) => void
	// onKeyUp?: (e: KeyboardEvent) => void
	// excludeFromTabOrder?: boolean
} & AriaCheckboxProps

type LabelledProps = {
	label: string
	children?: never
}

type UnlabelledProps = {
	label?: never
	children?: React.ReactNode
}

type LabelProps = LabelledProps | UnlabelledProps

type ControlledCheckboxProps = {
	control: Control<any>
	name: string
	message?: never
} & SharedCheckboxProps &
	LabelProps

type UncontrolledCheckboxProps = {
	control?: never
	name?: string
	message?: string
} & SharedCheckboxProps &
	LabelProps

type CheckboxProps = ControlledCheckboxProps | UncontrolledCheckboxProps

const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
	HTMLInputElement | undefined,
	CheckboxProps
>(({ control, name, message, ...props }, ref) => {
	if (control !== undefined) {
		return (
			<ControlledCheckbox ref={ref} control={control} name={name} {...props} />
		)
	}

	return (
		<UncontrolledCheckbox ref={ref} name={name} message={message} {...props} />
	)
})

const UncontrolledCheckbox: React.FC<UncontrolledCheckboxProps> =
	React.forwardRef<HTMLInputElement | undefined, UncontrolledCheckboxProps>(
		(
			{
				checked,
				isValid,
				disabled,
				readOnly,
				required,
				message,
				onChange: extOnChange,
				children,
				...props
			},
			ref
		) => {
			console.log('UNCONTROLLED CHECKBOX')

			const onChangeHandler = (e: boolean) => {
				console.log('ONCHANGE', e)

				wasSelectedRef.current = true

				return extOnChange?.(e)
			}

			const checkboxParams = {
				defaultSelected: checked,
				validationState: (isValid ? 'valid' : 'invalid') as 'valid' | 'invalid',
				isDisabled: disabled,
				isReadOnly: readOnly,
				isRequired: required,
				onChange: onChangeHandler,
				children: props.label ?? children,
				...props,
			}

			const state = useToggleState(checkboxParams)

			const wasSelectedRef = React.useRef<boolean>(Boolean(checked))
			const wasSelected = wasSelectedRef.current

			const domRef = React.useRef<HTMLInputElement>(null)

			const { inputProps, isSelected, isPressed, isDisabled, isReadOnly } =
				useCheckbox(checkboxParams, state, domRef)

			const { isFocusVisible, focusProps } = useFocusRing()

			const { visuallyHiddenProps } = useVisuallyHidden()

			console.log('wasSelected', wasSelected)
			console.log('isSelected', isSelected)

			useImperativeHandle(
				ref,
				() => {
					if (typeof ref === 'function') {
						ref(domRef.current)
					}

					return domRef.current ?? undefined
				},
				[ref]
			)

			return (
				<label>
					<span {...visuallyHiddenProps}>
						<input {...inputProps} {...focusProps} ref={domRef} />
					</span>

					<span
						className={`${s.checkbox}${isSelected ? ' ' + s.checked : ''}${
							isFocusVisible ? ' ' + s.focused : ''
						}${wasSelected || isSelected ? ' ' + s.anim : ''}${
							isDisabled ? ' ' + s.disabled : ''
						}`}
					>
						<SvgCheck />
					</span>

					{props.label ? (
						<span className={s.label}>{props.label}</span>
					) : (
						children
					)}

					{message && <span className="input-error">{message}</span>}
				</label>
			)
		}
	)

const ControlledCheckbox: React.FC<ControlledCheckboxProps> = React.forwardRef<
	HTMLInputElement | undefined,
	ControlledCheckboxProps
>(
	(
		{
			isValid,
			disabled,
			readOnly,
			required,
			control,
			onChange: extOnChange,
			onBlur: extOnBlur,
			children,
			...props
		},
		ref
	) => {
		console.log('CONTROLLED CHECKBOX')
		const controller = useController({ control, name: props.name })

		const onChangeHandler = (checkboxValue: boolean) => {
			console.log('ONCHANGE', checkboxValue)
			// console.log('controller', controller)
			extOnChange?.(checkboxValue)

			wasSelectedRef.current = true

			if (checkboxValue === null || checkboxValue === undefined) {
				controller.field.onChange(undefined)
				return undefined
			}

			controller.field.onChange(checkboxValue)
			return checkboxValue
		}

		const onBlurHandler = (e: React.FocusEvent<Element, Element>) => {
			extOnBlur?.(e)
			controller.field.onBlur()

			return e
		}

		const checkboxParams = {
			isSelected: controller.field.value ?? false,
			validationState: (isValid ? 'valid' : 'invalid') as 'valid' | 'invalid',
			isDisabled: disabled,
			isReadOnly: readOnly,
			isRequired: required,
			onChange: onChangeHandler,
			onBlur: onBlurHandler,
			children: props.label ?? children,
			...props,
		}

		const state = useToggleState(checkboxParams)

		const wasSelectedRef = React.useRef<boolean>(false)
		const wasSelected = wasSelectedRef.current

		const domRef = React.useRef<HTMLInputElement>(null)

		const { inputProps, isSelected, isPressed, isDisabled, isReadOnly } =
			useCheckbox(checkboxParams, state, domRef)

		const { isFocusVisible, focusProps } = useFocusRing()

		const { visuallyHiddenProps } = useVisuallyHidden()

		useImperativeHandle(
			ref,
			() => {
				if (typeof ref === 'function') {
					ref(domRef.current)
				}

				return domRef.current ?? undefined
			},
			[ref]
		)

		// console.log('inputProps', inputProps)

		return (
			<label>
				<span {...visuallyHiddenProps}>
					<input
						{...inputProps}
						{...focusProps}
						checked={inputProps.checked}
						ref={domRef}
					/>
				</span>

				<span
					className={`${s.checkbox}${isSelected ? ' ' + s.checked : ''}${
						isFocusVisible ? ' ' + s.focused : ''
					}${wasSelected || isSelected ? ' ' + s.anim : ''}${
						isDisabled ? ' ' + s.disabled : ''
					}`}
				>
					<SvgCheck />
				</span>

				{props.label ? (
					<span className={s.label}>{props.label}</span>
				) : (
					children
				)}

				{controller.fieldState.invalid && (
					<span className="input-error">
						{controller.fieldState.error?.message}
					</span>
				)}
			</label>
		)
	}
)

const SvgCheck: React.FC = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="100%"
		height="100%"
		viewBox="0 0 24 24"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path className={s.path} d="M20 6 9 18 5 13" />
	</svg>
)

export default Checkbox
