import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

test.describe('organizer puzzles page', () => {
  test('a visitor picks an age group and starts the general knowledge test', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/resources/puzzles`);

    await expect(page.getByTestId('page-banner')).toBeVisible();

    const startButton = page.getByTestId('puzzles-start-button');
    await expect(startButton).toBeDisabled();

    await page.getByTestId('puzzles-age-8-10').click();
    await expect(startButton).toBeEnabled();
    await startButton.click();

    await expect(page.getByText(/Question 1 of 20/)).toBeVisible();
  });

  test('a logged-out visitor is asked whether to save their score after finishing a test', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Save Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/resources/puzzles`);
    await page.getByTestId('puzzles-age-5-7').click();
    await page.getByTestId('puzzles-start-button').click();

    for (let question = 1; question <= 20; question++) {
      await expect(page.getByText(new RegExp(`Question ${question} of 20`))).toBeVisible();
      await page.getByTestId('puzzles-option').first().click();
    }

    await expect(page.getByText('Would you like to save your score?')).toBeVisible();
    await page.getByTestId('puzzles-save-score-yes').click();
    await expect(page.getByTestId('puzzles-save-score-submit')).toBeVisible();
  });
});
