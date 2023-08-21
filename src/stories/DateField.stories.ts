import type { Meta, StoryObj } from '@storybook/react'
import '../App.css'
import DateField from '../components/DateField/DateField'
import { today, getLocalTimeZone } from '@internationalized/date'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
	title: 'Date Field',
	component: DateField,
	tags: ['autodocs'],
	argTypes: {
		format: { control: 'text' },
	},
} satisfies Meta<typeof DateField>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
	args: {
		label: 'label teste',
		maxValue: today(getLocalTimeZone()),
	},
}

export const MonthAndYearShort: Story = {
	args: {
		format: 'mm/yy',
	},
}

export const DayAndMonth: Story = {
	args: {
		granularity: 'day',
		maxGranularity: 'month',
	},
}

export const AmericanFormat: Story = {
	args: {
		locale: 'en-US',
	},
}
