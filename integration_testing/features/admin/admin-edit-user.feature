Feature: Admin edit users
  Admin needs to be able to edit user's full name and username, reset the passwords, change the user types, and delete them from the facility

  Background:
    Given I am signed in to Kolibri as admin user
      And I am on *Facility > Users* page

  Scenario: Edit user's full name
    When I click on *Manage* button for the user I want to edit
      And I select *Edit* option
    Then I see *Edit user* modal
    When I click or tab into *Full name* field
      And I edit the full name as needed
      And I click the *Save* button
    Then the modal closes
      And I see the user with edited full name

  Scenario: Edit user's username
    When I click on *Manage* button for the user I want to edit
      And I select *Edit* option
    Then I see *Edit user* modal
    When I click or tab into *Username* field
      And I edit the username as needed
      And I click the *Save* button
    Then the modal closes
      And I see the user with edited username

  Scenario: Change user type
    When I click on *Manage* button for the user I want to edit
      And I select *Edit* option
    Then I see *Edit user* modal
    When I click or tab into *User type*
    Then the dropdown opens
    When I select the new role
      And I click the *Save* button
    Then the modal closes
      And I see the user with edited type (label or no label depending on the change)
# TODO: add options for the 2 coach types

  Scenario: Reset user's password
    When I click on *Manage* button of the user I want to reset password for
      And I select *Reset password* option
    Then I see *Reset user password* modal
    When I click or tab into *New password* field
      And I enter the new password
      And I click or tab into *Confirm new password* field
      And I re-enter the new password
      And I click the *Save* button
    Then the modal closes
      And I see the *Facility > Users* page again # no confirmation that the password has been reset
