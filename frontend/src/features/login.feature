Feature: Login page

  As a user
  I want to sign in with my credentials
  So that I can access the application

  Scenario: Sign in heading is visible
    Given I am on the login page
    Then I should see a "Sign in" heading

  Scenario: User can enter credentials
    Given I am on the login page
    When I enter "admin" in the username field
    And I enter "secret" in the password field
    Then the username field should contain "admin"
    And the password field should contain "secret"

  Scenario: Sign in button is present
    Given I am on the login page
    Then I should see a "Sign in" button

  Scenario: No error messages shown on initial load
    Given I am on the login page
    Then there should be no error messages on the page

