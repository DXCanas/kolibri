Feature: Superuser import content
    Admin needs to be able to import private/unlisted content channels on the device using the channel token or ID

  Background:
    Given there is no content from <channel> channel on the device
      And I have the <token> token or the <id> ID for the <channel> channel
      And I am signed in to Kolibri as superuser, or a user with device permissions to import content
      And I am on the *Kolibri Studio* page with the list of available content *Channels*

  Scenario: Import new content channel from Kolibri Studio using the token
    When I click on *Try adding a token* link
    Then I see the *Enter channel token* modal
    When I enter the channel <token> token or the <id> ID
      And I click *Confirm*
    Then the modal closes
      And I see the list of topics for the <channel> channel
      And I see the total number and size of <channel> channel resources
      And I see 0 resources from <channel> channel are listed as *On your device*
    # Select/unselect all the topics
    When I check the *Select all* checkbox
    Then I see the checkboxes for all the topics are checked
      And I see the *Import* button is active
      And I see the values for *Resources selected* increase
      And I see the value for *Your remaining space* decreases (if the size of selected resources is close to 1GB)  
    When I uncheck the *Select all* checkbox
    Then I see the *Import* button is inactive
      And I see the values for *Resources selected* is 0
      And I see the value for *Your remaining space* increases to the initial state
    # Select/unselect one full topic    
    When I check the <topic> topic checkbox
    Then I see the *Import* button is active
      And I see the values for *Resources selected* increase
      And I see the value for *Your remaining space* decreases (if the size of selected resources is close to 1GB)
    When I uncheck the <topic> topic checkbox
    Then I see the *Import* button is inactive
      And I see the values for *Resources selected* is 0
      And I see the value for *Your remaining space* increases to the initial state
    # Select and import just one resource from a subtopic of a topic
    When I click the <topic> topic
    Then see the list of subtopics for the <topic> topic
    When I click the <subtopic> subtopic
    Then see the list of resources for the <subtopic> subtopic
    When I check the <resource> resource checkbox
    Then I see the *Import* button is active 
      And I see the *1 resource selected* flag for the <resource> resource
      And I see the values for *Resources selected* increase
      And I see the value for *Your remaining space* decreases (if the size of selected resources is close to 1GB)
    When I click the *Import* button
    Then I see *Device > Content* page again
      And I see the blue progress bar with the percentage increasing 
    When the import process concludes
    Then I see the progress bar at 100%
      And I see the *Finished! Click "Close" button to see changes.* flag
      And I see the *Close* button
    When I click *Close* 
    Then I see the *Content* page is reloaded 
      And I see the <channel> channel is listed under *Content*
      And I see the size of the <resource> resource I imported

Examples:
| channel      | token       | id                               | topic   | subtopic          | resource                   |
| MIT Blossoms | nakav-mafak | 95a52b386f2c485cb97dd60901674a98 | Physics | Forces and Angles | English: Forces and Angles |