import React from 'react'
import { Given, When, Then } from '@cucumber/cucumber'
import { render } from '@testing-library/react'
import { LoginPage } from '../../pages/LoginPage'
import type { LoginWorld } from '../support/world'

Given('I open the login page', function (this: LoginWorld) {
  this.renderResult = render(React.createElement(LoginPage))
})

// ── Positive assertions ─────────────────────────────────────────────────────
// getBy* throws a descriptive error when the element is absent, which fails
// the step with a helpful message — no external assertion library needed.

Then('I should see a {string} heading', function (this: LoginWorld, headingText: string) {
  this.screen.getByRole('heading', { name: new RegExp(headingText, 'i') })
})

Then('I should see a username input', function (this: LoginWorld) {
  this.screen.getByLabelText(/username/i)
})

Then('I should see a password input', function (this: LoginWorld) {
  this.screen.getByLabelText(/password/i)
})

Then('I should see a {string} button', function (this: LoginWorld, buttonText: string) {
  this.screen.getByRole('button', { name: new RegExp(buttonText, 'i') })
})

// ── Negative assertions ─────────────────────────────────────────────────────
// queryBy* returns null when absent; we throw manually to keep the message clear.

Then('I should not see an error message', function (this: LoginWorld) {
  if (this.screen.queryByRole('alert') !== null) {
    throw new Error('Expected no error message to be present, but found one')
  }
})

Then('I should not see a success message', function (this: LoginWorld) {
  if (this.screen.queryByRole('status') !== null) {
    throw new Error('Expected no success message to be present, but found one')
  }
})

// ── User interactions ───────────────────────────────────────────────────────

When('I type {string} in the username field', async function (this: LoginWorld, value: string) {
  await this.user.type(this.screen.getByLabelText(/username/i), value)
})

When('I type {string} in the password field', async function (this: LoginWorld, value: string) {
  await this.user.type(this.screen.getByLabelText(/password/i), value)
})

When('I click the {string} button', async function (this: LoginWorld, buttonText: string) {
  await this.user.click(this.screen.getByRole('button', { name: new RegExp(buttonText, 'i') }))
})

// ── Assertions that guide the next implementation step ──────────────────────
// These steps intentionally fail until the login feature is implemented.
// The error messages below describe exactly what the component must render.

Then('I should see a success message', function (this: LoginWorld) {
  this.screen.getByRole('status')
})

Then('I should see an error message', function (this: LoginWorld) {
  this.screen.getByRole('alert')
})
