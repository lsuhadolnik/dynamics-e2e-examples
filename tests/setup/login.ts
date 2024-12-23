import { TOTP } from "totp-generator"
import { Page } from "@playwright/test";

export async function login(page: Page) {
    
    await page.goto(process.env.DYNAMICS_URL || '');
  
    // Email Screen
    await page.getByPlaceholder('Email, phone, or Skype').click();
    await page.getByPlaceholder('Email, phone, or Skype').fill(process.env.MS_USERNAME  || '');
    await page.getByRole('button', { name: 'Next' }).click();
    
    
    // Password Screen
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill(process.env.MS_PASSWORD  || '');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // if (await page) - Maybe Code is already visible
    
    // Switch From Microsoft Autenticator to TOTP
    await page.getByRole('link', { name: 'I can\'t use my Microsoft' }).click();
    await page.getByRole('button', { name: 'Use a verification code' }).click();
    

    // Generate TOTP
    const { otp, expires } = TOTP.generate(process.env.TOTP_SECRET  || '')

    // TOTP Screen
    await page.getByPlaceholder('Code').click();
    await page.getByPlaceholder('Code').fill(otp);
    await page.getByRole('button', { name: 'Verify' }).click();

    // Sty Signed In?
    await page.getByText('Don\'t show this again').click();
    await page.getByRole('button', { name: 'Yes' }).click();
}