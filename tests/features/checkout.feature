Feature: Checkout functionality

  Scenario Outline: Volunteer checks out an item successfully
    Given a volunteer user is logged in
    And the user is on the home page
    When the user completes checkout with "<item>"
    Then the checkout should be successful
    And the item should appear in the history
    And the history record count should increase
    And the user should be redirected to the home page

  Examples:
    | item       |
    | Curtains   |
    | Baby Wipes |