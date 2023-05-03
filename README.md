# Short Text to Long Text Script

This script does the following actions.

1. Fetches an extract of configured contentType.id on space defined in config.json
2. Once extract available, function "updateContentful" deletes old short text field, add new Long text field, updates appearance according to config and re-published each entry with its respective content.

To run this script,

1. cd into update-content-type.
2. Run node index.js.

### config.json

1. accessToken - contentful access token (Generate your own accessToken).
2. space - contentful space information for targeted market.

- spaceId: contentful spaceId for required market
- environmentId: contentful environmentId for required market
- local: contentful local for required market (To find the local, click on Settings -> locales. You should see a default locale.)

3. contentType - contentful contentType to be used

- id: contentType id (can be found int the info tab for required contentType);
- newAppearance: appearance object for new field;

4. extractFields - fields to be included in the extract step