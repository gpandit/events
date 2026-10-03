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
});
