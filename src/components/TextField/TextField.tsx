import React, { useImperativeHandle } from 'react'
import s from './TextField.module.css'

import { useController, type Control } from 'react-hook-form'

type SharedTextFieldProps = {
	checked?: boolean
	isValid?: boolean
	disabled?: boolean
	readOnly?: boolean
	required?: boolean
	ref?: React.ForwardedRef<HTMLInputElement | undefined>
	label?: string
	onChange?: (...args: any) => any
	onBlur?: (...args: any) => any
}

type ControlledTextFieldProps = {
	control: Control<any>
	name: string
	message?: never
} & SharedTextFieldProps

type UncontrolledTextFieldProps = {
	control?: never
	name?: string
	message?:
		| string
		| { text: string; type: 'error' | 'warn' | 'info' | 'success' }
} & SharedTextFieldProps

type TextFieldProps = ControlledTextFieldProps | UncontrolledTextFieldProps

const TextField: React.FC<TextFieldProps> = React.forwardRef(
	({ control, name, message, label, ...props }, ref) => {
		return (
			<>
				{label ? (
					<label htmlFor={s.input} className={s.label}>
						{label}
					</label>
				) : null}

				{control ? (
					<ControlledTextField control={control} name={name} {...props} />
				) : (
					<>
						<UncontrolledTextField name={name} ref={ref} {...props} />

						{message ? (
							<Message
								type={message instanceof Object ? message.type : undefined}
							>
								{message instanceof Object ? message.text : message}
							</Message>
						) : null}
					</>
				)}
			</>
		)
	}
)

const UncontrolledTextField: React.FC<UncontrolledTextFieldProps> =
	React.forwardRef(({ ...props }, ref) => {
		const domRef = React.useRef<HTMLInputElement>(null)

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

		return <input type="text" id={s.input} {...props} ref={domRef} />
	})

const ControlledTextField: React.FC<ControlledTextFieldProps> =
	React.forwardRef(
		(
			{ control, message, onChange: extOnChange, onBlur: extOnBlur, ...props },
			ref
		) => {
			const controller = useController({ control, name: props.name })

			const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
				console.log('ONCHANGE', e)
				// console.log('controller', controller)
				extOnChange?.(e)

				if (e === null || e === undefined) {
					controller.field.onChange(undefined)
					return undefined
				}

				controller.field.onChange(e)
				return e
			}

			const onBlurHandler = (e: React.FocusEvent<Element, Element>) => {
				extOnBlur?.(e)
				controller.field.onBlur()

				return e
			}

			const domRef = React.useRef<HTMLInputElement>(null)

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

			// const checkboxParams = {
			// 	isSelected: controller.field.value ?? false,
			// 	validationState: (isValid ? 'valid' : 'invalid') as 'valid' | 'invalid',
			// 	isDisabled: disabled,
			// 	isReadOnly: readOnly,
			// 	isRequired: required,
			// 	onChange: onChangeHandler,
			// 	onBlur: onBlurHandler,
			// 	...props,
			// }

			return (
				<>
					<input
						type="text"
						id={s.input}
						className="textfield"
						{...props}
						onChange={onChangeHandler}
						onBlur={onBlurHandler}
						value={controller.field.value}
						ref={domRef}
					/>
					{controller.fieldState.error ? (
						<Message>{controller.fieldState.error.message}</Message>
					) : null}
				</>
			)
		}
	)

const Message: React.FC<{
	type?: 'success' | 'error' | 'warn' | 'info'
	children: React.ReactNode
}> = ({ type = 'error', children }) => {
	return <div className={`${s.message} ${s[type]}`}>{children}</div>
}

export default TextField
