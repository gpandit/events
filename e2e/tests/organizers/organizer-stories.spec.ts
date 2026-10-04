import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

test.describe('organizer stories page', () => {
  test('a child under 16 needs a parent to give permission before their story can be published', async ({ page, api, mailpit }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Stories Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');
    const parentEmail = `parent-${Date.now()}@example.com`;

    await page.goto(`/events/${organizer.id}/${organizer.slug}/stories`);

    await page.getByLabel('First name', { exact: true }).fill('Amelia');
    await page.getByLabel('Last name', { exact: true }).fill('Khan');
    await page.getByLabel('Class / Year group').fill('Year 4');
    await page.getByLabel('Your story or poem').fill('Once upon a rainy afternoon, a very small cloud learned to sing.');
    await page.getByLabel(/entirely my own original work/).check();

    await expect(page.getByTestId('story-parent-email')).toBeHidden();
    await page.getByTestId('story-consent-publish').check();
    await page.getByTestId('story-under-16-yes').check();
    await expect(page.getByTestId('story-parent-email')).toBeVisible();

    await page.getByRole('button', { name: 'Submit for review' }).click();
    await expect(page.getByText(/parent or guardian's email address/)).toBeVisible();

    await page.getByTestId('story-parent-email').fill(parentEmail);
    await page.getByRole('button', { name: 'Submit for review' }).click();
    await expect(page.getByText('We have emailed your parent or guardian to ask for permission.', { exact: false })).toBeVisible();

    const consentUrl = await mailpit.waitForLink(parentEmail, /parental-consent\//);
    await page.goto(consentUrl.pathname);
    await expect(page.getByText('Once upon a rainy afternoon, a very small cloud learned to sing.')).toBeVisible();
    await expect(page.getByText('Amelia K.')).toBeVisible();

    await page.getByTestId('parental-consent-grant').click();
    await expect(page.getByTestId('parental-consent-result')).toContainText('permission has been recorded');
  });
});
