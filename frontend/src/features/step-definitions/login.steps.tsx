import React from 'react'
import { Given, When, Then } from '@cucumber/cucumber'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { LoginPage } from '../../pages/LoginPage.tsx'
import type { LoginWorld } from '../support/world.ts'

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given('I am on the login page', function (this: LoginWorld) {
  this.renderResult = render(<LoginPage />)
})

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When('I enter {string} in the username field', async function (this: LoginWorld, value: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/username/i), value)
})

When('I enter {string} in the password field', async function (this: LoginWorld, value: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/password/i), value)
})

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then('I should see a {string} heading', function (this: LoginWorld, text: string) {
  expect(screen.getByRole('heading', { name: new RegExp(text, 'i') })).toBeInTheDocument()
})

Then('I should see a {string} button', function (this: LoginWorld, text: string) {
  expect(screen.getByRole('button', { name: new RegExp(text, 'i') })).toBeInTheDocument()
})

Then('the username field should contain {string}', function (this: LoginWorld, value: string) {
  expect(screen.getByLabelText(/username/i)).toHaveValue(value)
})

Then('the password field should contain {string}', function (this: LoginWorld, value: string) {
  expect(screen.getByLabelText(/password/i)).toHaveValue(value)
})

Then('there should be no error messages on the page', function (this: LoginWorld) {
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
