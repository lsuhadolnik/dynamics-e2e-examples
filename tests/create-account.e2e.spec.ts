import { test, expect, Page } from "@playwright/test";
import { describe } from "node:test";
import { login } from "./setup/login";

import {
  getAttributeValue,
  getEntityId,
  newEntityReference,
  setAttributeValue,
  waitForSaved,
} from "./setup/helpers";

require("dotenv").config();

// Page Reuse - let's run the tests in serial
test.describe.configure({ mode: "serial" });

describe("Account Tests", () => {
  let page: Page;

  let accountId: string;

  let contact1Id: string | null;
  let contact2Id: string | null;

  const DEFAULT_ACCOUNTID = '89d8a94a-489e-ef11-8a6b-000d3ab3c99f';


  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    await login(page);
  });

  // test.afterAll(async () => {
  //   await page.close();
  // });

  test("Create Account - Ensure title is UPPERCASE", async () => {
    // Open Sales App
    await page
      .locator('iframe[title="AppLandingPage"]')
      .contentFrame()
      .getByLabel("Sales")
      .click();

    // Click on Accounts
    await page.getByText("Accounts", { exact: true }).click();

    // Click on New Account
    await page.getByLabel("New", { exact: true }).click();

    // Fill out Account Name
    await page.getByLabel("Account Name").click();
    await page.getByLabel("Account Name").fill("Test");

    // Click Save
    // await page.getByLabel('Save (CTRL+S)').click(); -> There's no Save button, just Save and Close
    await page.keyboard.press("Control+S"); // On Windows/Linux

    if (page.getByRole("button", { name: "Ignore and save" })) {
      await page.getByRole("button", { name: "Ignore and save" }).click();
    }

    await waitForSaved(page);

    // Expect the
    const accountName = await page.evaluate(() =>
      Xrm.Page.getAttribute("name").getValue()
    );

    // Expect the Uppercasing plugin to run
    expect(accountName).toBe("TEST");

    // Save the AccountID
    // accountId = await page.evaluate(() => Xrm.Page.data.entity.getId());
  });

  test("Create Contact - Ensure it gets associated with the right account", async () => {


    if (accountId == null) {
      accountId = DEFAULT_ACCOUNTID;
    }

    const _nanoid = await import("nanoid");
    const nanoid = _nanoid.nanoid;
    debugger;

    const PARENTCUSTOMER_ATTRIBUTE = "parentcustomerid";

    // Create a new Contact with a random domain
    const randomDomain = nanoid();
    const email1 = `test1@${randomDomain}.com`;
    const email2 = `test2@${randomDomain}.com`;

    await page.waitForLoadState("networkidle");

    // Expect to already be on the Account Page
    if (await page.locator('iframe[title="AppLandingPage"]')) {
      await page.locator('iframe[title="AppLandingPage"]').contentFrame().getByLabel('Sales Published by Default').click();
    }

    // Open Contacts Page
    await page.getByText("Contacts").click();

    // Click on New
    await page.getByLabel("New", { exact: true }).click();

    // Fill email, firstname, lastname, email
    await page.getByLabel("Email").click();
    await page.getByPlaceholder("Provide an email").fill(email1);
    await page.getByLabel("First Name").click();
    await page.getByLabel("First Name").fill("TEST");
    await page.getByLabel("Last Name").click();
    await page.getByLabel("Last Name").fill(`BEST - ${email1}`);

    // Set AccountId - Use from previous test
    await setAttributeValue(
      page,
      PARENTCUSTOMER_ATTRIBUTE,
      newEntityReference("account", accountId, "TEST")
    );

    // Save
    await page.getByLabel("Last Name").press("ControlOrMeta+s");

    await waitForSaved(page);

    contact1Id = await getEntityId(page);

    // Open Contacts Page
    await page.getByText("Contacts").click();

    // Click on New
    await page.getByLabel("New", { exact: true }).click();
    
    // Fill email, firstname, lastname, email
    await page.getByLabel('Name', { exact: true }).getByLabel("Email").click();
    await page.getByLabel('Name', { exact: true }).getByPlaceholder("Provide an email").fill(email2);
    await page.getByLabel('Name', { exact: true }).getByLabel("First Name").click();
    await page.getByLabel('Name', { exact: true }).getByLabel("First Name").fill("TEST");
    await page.getByLabel('Name', { exact: true }).getByLabel("Last Name").click();
    await page.getByLabel('Name', { exact: true }).getByLabel("Last Name").fill(`BEST - ${email2}`);

    // Save
    await page.getByLabel('Name', { exact: true }).getByLabel("Last Name").press("ControlOrMeta+s");

    await waitForSaved(page);

    // Save the second contact's ID
    contact2Id = await getEntityId(page);

    // Get the company's ID
    const companyId = (
      await getAttributeValue(page, PARENTCUSTOMER_ATTRIBUTE)
    )[0].id;
    expect(companyId).toBe(`{${DEFAULT_ACCOUNTID.toUpperCase()}}`);
  });
});
