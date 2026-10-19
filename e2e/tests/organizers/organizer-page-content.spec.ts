import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

test.describe('organizer page content', () => {
  test('the about page, footer and homepage show the content configured for the organizer', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Content Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');
    await api.updateOrganizerThemeSettings(organizer.id, {
      accent: '#0ea5e9',
      background: '#f0f9ff',
      mode: 'light',
      background_type: 'COLOR',
      about_text: 'We raise funds for the library.',
      team_heading: 'Our committee',
      team_members: ['Priya Shah', 'Omar Haddad'],
      contact_heading: 'Join the committee',
      contact_intro: 'Tell us how you can help.',
      contact_email: 'committee@example.com',
      instagram_handle: 'examplepta',
    });

    await page.goto(`/events/${organizer.id}/${organizer.slug}/about`);

    await expect(page.getByText('We raise funds for the library.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our committee' })).toBeVisible();
    await expect(page.getByText('Priya Shah')).toBeVisible();
    await expect(page.getByText('Omar Haddad')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Join the committee' })).toBeVisible();
    await expect(page.getByText('Tell us how you can help.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'committee@example.com' }).first()).toBeVisible();
    await expect(page.getByText('@examplepta')).toBeVisible();
  });

  test('the team section and instagram links are hidden when not configured', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Empty Content Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/about`);

    await expect(page.getByRole('heading', { name: 'Meet the team' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Instagram' })).toHaveCount(0);
  });
});
