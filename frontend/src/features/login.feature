Feature: User Authentication
  As a user of the application
  I want to sign in with my credentials
  So that I can access my account

  Background:
    Given I open the login page

  # ── Scenarios covered by current implementation ──────────────────────────────

  Scenario: Login page displays the sign in form
    Then I should see a "Sign in" heading
    And I should see a username input
    And I should see a password input
    And I should see a "Sign in" button

  Scenario: No feedback messages on initial page load
    Then I should not see an error message
    And I should not see a success message

  # ── Scenarios that guide the next implementation step ─────────────────────────
  # These scenarios are intentionally failing. They define the behaviour that
  # must be implemented: an API call on form submission with visible feedback.

  Scenario: Successful login with valid credentials
    When I type "admin" in the username field
    And I type "secret" in the password field
    And I click the "Sign in" button
    Then I should see a success message

  Scenario: Failed login with invalid credentials
    When I type "admin" in the username field
    And I type "wrong" in the password field
    And I click the "Sign in" button
    Then I should see an error message
