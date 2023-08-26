import { useSelect } from 'downshift'
import React, { useEffect, useLayoutEffect, useRef } from 'react'

import s from './Select.module.css'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

type Item = { value: any; label: string; sublabel?: string }

type SelectProps = {
	items: Item[]
	name?: string
	placeholder?: string
	disabled?: boolean
	hasError?: boolean
	hideSublabel?: boolean
	id?: string
	'aria-labelledby'?: string
	onChange?: (item?: Item | null) => unknown
}

const Select: React.FC<SelectProps> = ({
	items,
	placeholder = 'Selecione',
	onChange,
	hideSublabel,
	...props
}) => {
	// const [selectedItem, setSelectedItem] = React.useState<
	// 	Item | null | undefined
	// >(null)

	const domRef = useRef<HTMLButtonElement | null>(null)

	const {
		isOpen,
		selectedItem,
		getToggleButtonProps,
		getLabelProps,
		getMenuProps,
		highlightedIndex,
		getItemProps,
		// openMenu,
		// closeMenu,
		reset,
		...selectObj
	} = useSelect({
		items,
		itemToString: (item: Item | null) => item?.label ?? placeholder,
		// selectedItem,
		onSelectedItemChange: onChange
			? ({ selectedItem: selected }) => {
					onChange(selected)
					// setSelectedItem(selected)
			  }
			: undefined,
	})

	// console.log('selectObj', selectObj)

	const { ref: toggleButtonPropsRef, ...toggleButtonProps } =
		getToggleButtonProps()

	const buttonRef = (node: HTMLButtonElement | null) => {
		toggleButtonPropsRef(node)

		domRef.current = node
	}
	const buttonProps = {
		...toggleButtonProps,
		'aria-labelledby':
			props['aria-labelledby'] ?? toggleButtonProps['aria-labelledby'],
		id: props.id ?? toggleButtonProps.id,
		ref: buttonRef,
	}

	// console.log('>>', buttonProps)

	return (
		<>
			{/* <label {...getLabelProps()}>Choose your favorite book:</label> */}
			<div className={`${s.select}${selectedItem ? ' ' + s.selected : ''}`}>
				<button
					type="button"
					className={s.button}
					{...buttonProps}
					title={selectedItem?.label}
				>
					<div className={s.value}>
						{selectedItem ? selectedItem.label : placeholder}
					</div>

					{/* {!!selectedItem && <div className={s.icon}></div>} */}
					<div className={s.icon}>
						{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</div>
				</button>

				{!!selectedItem && (
					<button type="button" className={s.reset} onClick={reset}>
						<X size={16} />
					</button>
				)}

				<SelectMenu
					isOpen={isOpen}
					items={items}
					selectedItem={selectedItem}
					highlightedIndex={highlightedIndex}
					menuProps={getMenuProps()}
					getItemProps={getItemProps}
					hideSublabel={hideSublabel}
					selectRef={domRef}
				/>
			</div>
		</>
	)
}

const SelectMenu: React.FC<{
	isOpen: boolean
	items: Item[]
	selectedItem: Item | null
	highlightedIndex: number
	menuProps: Record<string, any>
	getItemProps: (data: { item: Item; index: number }) => Record<string, any>
	hideSublabel?: boolean
	selectRef: any
}> = ({
	isOpen,
	items,
	selectedItem,
	highlightedIndex,
	menuProps: { ref: menuPropsRef, ...menuProps },
	getItemProps,
	hideSublabel,
	selectRef,
}) => {
	const domRef = useRef<HTMLUListElement | null>(null)

	const menuRef = (node: HTMLUListElement | null) => {
		menuPropsRef(node)

		domRef.current = node
	}

	useEffect(() => {
		const menuNode = domRef?.current

		const buttonNode = selectRef.current

		const selectedNode: HTMLElement | null | undefined =
			domRef.current?.querySelector('li[aria-selected="true"]')

		const windowHeight = window.innerHeight

		if (isOpen && menuNode && buttonNode) {
			// menuNode.scrollTop = 0

			const buttonRect = buttonNode.getBoundingClientRect()

			const [buttonX, buttonY, buttonHeight] = [
				buttonRect.left,
				buttonRect.top,
				buttonRect.height,
			]

			const menuRect = menuNode.getBoundingClientRect()

			const [menuX, menuY] = [menuRect.left, menuRect.top]

			const selectedRect = selectedNode?.getBoundingClientRect()

			const [selectedX, selectedY, selectedHeight] = [
				selectedRect?.left,
				selectedRect?.top,
				selectedRect?.height ?? 0,
			]

			const selectedRelativeY = selectedNode?.offsetTop ?? 0

			const menuMaxHeight =
				windowHeight - 32 > 14 * 16 ? 14.7 * 16 : windowHeight - 32

			menuNode.style.maxHeight = `${menuMaxHeight}px`

			const menuHeight =
				menuRect.height < menuMaxHeight ? menuRect.height : menuMaxHeight

			// const menuScrollableHeight = menuNode.scrollHeight - menuHeight

			menuNode.scrollTop =
				selectedRelativeY - menuHeight / 2 + selectedHeight / 2

			const menuTopDefault = -menuHeight / 2 + buttonHeight / 2 - 1

			const menuUpShift = menuTopDefault + selectedRelativeY

			const menuDownShift =
				menuNode.scrollHeight - menuHeight / 2 - selectedRelativeY

			const menuShift = selectedNode
				? menuUpShift > 0
					? menuDownShift < 0
						? -menuDownShift + 14
						: 0
					: menuUpShift - 5
				: 0

			console.log('menuDownShift', menuDownShift)

			menuNode.style.top = `${menuTopDefault - menuShift}px`

			menuNode.style.backgroundPositionY = `${menuShift}px`

			console.log('menu scroll', menuNode.scrollTop)
			console.log('selected y to menu', selectedRelativeY)

			console.log('buton >', buttonX, buttonY, menuHeight)
			console.log('menu >', menuX, menuY)
			console.log('selected >', selectedX, selectedY, selectedHeight)
			console.log('>>>', windowHeight)

			// console.log('shift', shiftY)

			// menuNode.style.top = `${shiftY}px`
			// menuNode.style.top = `-${Math.round((menuHeight - buttonHeight) / 2)}px`
			// // menuNode.style.left = `-${30}px`
		}
	}, [isOpen, selectRef])

	const itemList = items.map((item, index) => {
		const isSelected = selectedItem === item

		return (
			<li
				key={`${item.value}${index}${isSelected ? 1 : 0}`}
				className={`${highlightedIndex === index ? s.highlighted : ''} ${
					isSelected ? s.selected : ''
				}`}
				{...getItemProps({ item, index })}
			>
				{/* <div className={s.label} data-label={item.label}>
					&nbsp;
				</div> */}

				<div className={s.label} data-label={item.label} title={item.label}>
					{item.label}
				</div>

				{!hideSublabel && <div className={s.sublabel}>{item.sublabel}</div>}
			</li>
		)
	})

	return (
		<ul
			className={
				s.menu +
				`${hideSublabel ? ' ' + s['hide-sublabel'] : ''}${
					isOpen ? ' ' + s.isOpen : ''
				}`
			}
			{...menuProps}
			ref={menuRef}
		>
			{isOpen ? itemList : null}
		</ul>
	)
}

export default Select
