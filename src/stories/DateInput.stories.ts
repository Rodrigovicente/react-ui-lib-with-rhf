import type { Meta, StoryObj } from '@storybook/react'

import DateInput from '../components/DateInput/DateInput'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
	title: 'Date Input',
	component: DateInput,
	tags: ['autodocs'],
	argTypes: {
		format: { control: 'text' },
	},
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
	args: {
		format: 'dd/mm/yyyy',
	},
}

export const MonthAndYearShort: Story = {
	args: {
		format: 'mm/yy',
	},
}

export const DayAndMonth: Story = {
	args: {
		format: 'dd-mm',
	},
}

export const AmericanFormat: Story = {
	args: {
		format: 'mm-dd-yyyy',
	},
}
