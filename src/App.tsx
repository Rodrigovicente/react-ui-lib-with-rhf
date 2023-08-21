import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import './App.css'
import DateField from './components/DateField/DateField'

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z, object, TypeOf } from 'zod'
import Checkbox from './components/Checkbox/Checkbox'
import TextField from './components/TextField/TextField'

function App() {
	// const [count, setCount] = useState(0)

	const zodSchema = object({
		birthday: z
			.date({
				required_error: 'Data é obrigatória',
				invalid_type_error: 'Informe uma data valida',
				description: 'Data de nascimento',
			})
			.max(new Date(), { message: 'before today only' }),
		test: z
			.string({
				required_error: 'Teste obrigatório',
				invalid_type_error: 'Informe um teste válido',
				description: 'Texto de teste',
			})
			.min(3, { message: 'Minimo 3 caracteres' }),
		box: z.boolean({ required_error: 'Cheque' }).refine(val => val, {
			message: 'Cheque obrigatório',
		}),
	})
	type RegisterInput = TypeOf<typeof zodSchema>

	const { register, formState, handleSubmit, control, watch } =
		useForm<RegisterInput>({
			resolver: zodResolver(zodSchema),
			defaultValues: {
				// birthday: new Date('2015-10-21'),
				// box: true,
				test: 'asdfsda',
			},
		})

	const onSubmitHandler: SubmitHandler<RegisterInput> = values => {
		console.log('||====>', values)
	}

	// console.log('REGISTER', register('birthday'))
	// console.log('CONTROL', control)
	// console.log('REF', register('birthday').ref)

	// const testRef = (ref: any) => {
	// 	console.log('CALLBACK REF', ref)
	// }

	// console.log(Object.keys(formState.errors))
	console.log('1. rendering app')

	console.log('formstate', formState)

	return (
		<>
			<div style={{ margin: '3rem' }}>
				<form onSubmit={handleSubmit(onSubmitHandler)}>
					<DateField
						label="Label de teste"
						control={control}
						name="birthday"
						// {...register('birthday')}
						// ref={register('birthday').ref}
						// ref={testRef}
						// onBlur={e => {
						// 	console.log('BLUR EXT', e)
						// }}
						// onChange={e => {
						// 	console.log('CHANGE EXT', e)
						// }}
					></DateField>

					{/* <TestInput {...register('test')}></TestInput> */}
					{/* <input type="text" {...register('test')} /> */}

					<Checkbox
						control={control}
						name="box"
						label="Etiqueta"
						// checked
					/>
					<br />
					<TextField
						control={control}
						name="test"
						label="teste"
						// message={{ text: 'teste nisso', type: 'info' }}
					></TextField>

					<button type="submit">vai</button>
				</form>
			</div>

			{/* {Object.keys(formState.errors).length === 0 ? null : (
				<span style={{ color: 'red' }}>Tem erros</span>
			)} */}

			<div>birthday: {watch('birthday')?.toDateString()} </div>
			<div>test: {watch('test')} </div>
			<div>check: {watch('box') ? 'checked' : 'not checked'} </div>
		</>
	)
}

const TestInput = forwardRef<any, any>(({ onChange, ...props }, ref) => {
	const [, setVal] = useState('')

	const handleChange = (e: any) => {
		setVal(e.target.value)
		onChange?.(e)
	}
	const domRef = useRef(null)

	console.log('rendering test input')
	console.log('domRef', domRef.current)

	useImperativeHandle(ref, () => {
		// if (domRef.current == null) return undefined
		return domRef.current
	})

	return (
		<span>
			<TestInputEmoji ref={domRef} />
			<input type="text" {...props} onChange={handleChange} />
		</span>
	)
})

const TestInputEmoji = forwardRef<any, any>(({ ...props }, ref) => {
	const domRef = useRef(null)

	console.log('rendering emoji')
	console.log('domRef', domRef.current)

	useImperativeHandle(ref, () => {
		return domRef.current ?? undefined
	})

	return <span ref={domRef}>🥳</span>
})

export default App
