@regression @smoke
Feature: Login page
  As a user
  I want to access the login screen
  So that I can start authentication

  Scenario: login page renders core elements
    Given I open the login page
    Then I should see a "Sign in" heading
    And I should see a sign in button

  @regression
  Scenario: user can type username and password
    Given I open the login page
    When I type "admin" in the username field
    And I type "secret" in the password field
    Then the username field should contain "admin"
    And the password field should contain "secret"

  @regression
  Scenario: no status messages are visible on initial page load
    Given I open the login page
    Then I should not see an alert message
    And I should not see a status message
