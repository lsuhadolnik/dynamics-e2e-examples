import { Page } from "@playwright/test";

export async function waitForSaved(page: Page) {
    
    // Wait for the URL to contain "id=" -> Record Saved
    await page.waitForURL(/&id=/);
}

export async function getEntityId(page: Page) {
    
    // Get the current URL from the page
    const currentUrl = page.url();

    // Get it from the URL - most reliable
    const urlParams = new URLSearchParams(new URL(currentUrl).search);
    return urlParams.get('id'); // Returns the value of 'id' or null if not found
}

/**
 * Outputs an entity reference which you can use with setAttributeValue(<lookup>)
 * 
 * @param logicalName The logical name of the entity
 * @param guidWithout THe ID of the entity - like from an URL, WITHOUT CURLY BRACES
 * @returns The Entity Reference, which you can use in setAttributeValue
 */
export function newEntityReference(logicalName: string, guidWithoutBraces: string, uiValue?: string) {
    return [
        {
            "entityType": logicalName,
            "id": `{${guidWithoutBraces}}`,
            "name": uiValue || 'No uiValue provided (but don\'t worry)'
        }
    ]
}

export async function getAttributeValue(page: Page, attributeLogicalName: string) {
    return await page.evaluate((attributeLogicalName) => Xrm.Page.getAttribute(attributeLogicalName).getValue(), attributeLogicalName);
}

export async function setAttributeValue(page: Page, attributeLogicalName: string, attributeValue: any) {
    
    return await page.evaluate(
        // Don't access the value explicitely - this "snippet" is COPIED to the internal JS env, not referenced
        ({attributeValue, attributeLogicalName}) => Xrm.Page.getAttribute(attributeLogicalName).setValue(attributeValue), 
        {attributeValue, attributeLogicalName}
    );
}