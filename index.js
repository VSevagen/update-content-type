const contentful = require('contentful-management');
const config = require("./config.json");
const jsonExtract = require('./utils/extract');
const log = require('./utils/log');

const ACCESS_TOKEN = config.accessToken;
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId;
const CONTENT_TYPE = config.contentType.id;
const LOCAL = config.space.locale;
const EXTRACT_FIELDS = config.extractFields;
const NEW_APPEANCE = config.contentType.newAppearance;

const client = contentful.createClient({
  accessToken: ACCESS_TOKEN
});

const fetchEntries = async (environment) => {
  try {
    let entries = await environment.getEntries({
      'content_type': CONTENT_TYPE, limit: 1000,
      'select': EXTRACT_FIELDS
    })
    jsonExtract(entries);
  } catch(err) {
    console.log(err);
  }
};

const updateAppearance = async (environment) => {
  try {
    if(environment) {
      let fieldAppearance = await environment.getEditorInterfaceForContentType(CONTENT_TYPE);
      let fieldIndex = fieldAppearance?.controls?.findIndex((field) => field.fieldId == "text");
      fieldAppearance.controls[fieldIndex] = NEW_APPEANCE;
      return await fieldAppearance.update();
    }
  } catch(err) {
    console.log(err);
  }
}

const deleteField = async (environment) => {
  try {
    let contentType = await environment.getContentType(CONTENT_TYPE);
    if (contentType) {
      let textFieldIndex = contentType?.fields?.findIndex((field) => field.id === "text");
      let copyOfTextField = contentType?.fields[textFieldIndex];
      contentType.fields[textFieldIndex]['omitted'] = true;

      let updatedContentType = await contentType.update();
      let publishContentType = await updatedContentType.publish();

      publishContentType.fields[textFieldIndex]['deleted'] = true;
      let deleteField = await publishContentType.update();
      return [await deleteField.publish(), copyOfTextField];
    }
  } catch (err) {
    console.log(err);
  }
}

const addNewField = async (environment, textField) => {
  try {
    let contentType = await environment.getContentType(CONTENT_TYPE);
    if (contentType) {
      textField.type = "Text";
      textField.omitted = false;
      contentType?.fields?.splice(2, 0, textField);
      let updatedContent = await contentType.update();
      return await updatedContent.publish();
    }
  } catch (err) {
    console.log(err);
  }
}

const updateEntry = async (environment, entry) => {
  try {
    const contentfulEntry = await environment.getEntry(entry?.sys?.id);
    if(!contentfulEntry.isArchived()) {
      contentfulEntry.fields['text'] = {
        [LOCAL]: "New entry description"
      };
      contentfulEntry.fields.text[LOCAL] = entry?.fields?.text?.[LOCAL] ? entry?.fields?.text?.[LOCAL] : "";
      let updatedEntry = await contentfulEntry.update();

      if(contentfulEntry.isDraft()) {
        return;
      }

      if(contentfulEntry.isPublished()) {
        let publishedEntry = await updatedEntry.publish();
        log(`Entry published ${publishedEntry?.sys?.id}`);
        return publishedEntry;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

const runExtract = async () => {
  let space = await client.getSpace(SPACEID);
  let environment = await space.getEnvironment(ENVIRONMENTID);
  await fetchEntries(environment);
}

const updateContentful = async () => {
  try {
    log(`DATE: ${new Date()}`);
    let extract = require('./extract.json');
    let space = await client.getSpace(SPACEID);
    let environment = await space.getEnvironment(ENVIRONMENTID);

    const [contentType, textField] = await deleteField(environment);
    const updatedEntry = await addNewField(environment, textField);
    const updatedAppeareance = await updateAppearance(environment);

    for(entry of extract?.items) {
      let item = await updateEntry(environment, entry);
    }
  } catch(err) {
    console.log(err)
  }
}

const run = async () => {
  // await runExtract();
  await updateContentful();
}

run();