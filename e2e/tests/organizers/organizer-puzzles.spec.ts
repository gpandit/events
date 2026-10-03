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

  test('a child reviews their mistakes, signs up, earns points and appears on the leaderboard', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Save Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/resources/puzzles`);
    await page.getByTestId('puzzles-age-5-7').click();
    await page.getByTestId('puzzles-start-button').click();

    for (let question = 1; question <= 20; question++) {
      await expect(page.getByText(new RegExp(`Question ${question} of 20`))).toBeVisible();
      await page.getByTestId('puzzles-option').first().click();
    }

    await page.getByTestId('puzzles-review-button').click();
    await expect(page.getByTestId('puzzles-review-item').first()).toBeVisible();
    await expect(page.getByTestId('puzzles-review-correct').first()).toBeVisible();
    await expect(page.getByTestId('puzzles-review-wrong').first()).toBeVisible();
    await page.getByTestId('puzzles-review-back').click();

    await expect(page.getByText('Would you like to save your score and earn points?')).toBeVisible();
    await page.getByTestId('puzzles-save-score-yes').click();

    await page.getByLabel('First name', { exact: true }).fill('Amelia');
    await page.getByLabel('Last name', { exact: true }).fill('Khan');
    await page.getByLabel('Email', { exact: true }).fill(`parent-${Date.now()}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByTestId('puzzles-auth-signup-submit').click();

    const username = (await page.getByTestId('puzzles-new-username').textContent())?.trim() ?? '';
    expect(username).toMatch(/^[A-Za-z]+\d{2,3}$/);
    await page.getByTestId('puzzles-auth-continue').click();

    await expect(page.getByTestId('puzzles-points-earned')).toBeVisible();

    await page.getByRole('button', { name: 'View the leaderboard' }).click();
    await page.getByTestId('puzzles-leaderboard-age-5-7').click();
    await expect(page.getByTestId('puzzles-leaderboard-row').filter({ hasText: username })).toBeVisible();
  });

  test('a returning child signs in with their username and sees their previous scores', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Return Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/resources/puzzles`);
    await page.getByTestId('puzzles-sign-in').click();
    await page.getByLabel('First name', { exact: true }).fill('Noah');
    await page.getByLabel('Last name', { exact: true }).fill('Smith');
    await page.getByLabel('Email', { exact: true }).fill(`parent-${Date.now()}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByTestId('puzzles-auth-signup-submit').click();
    const username = (await page.getByTestId('puzzles-new-username').textContent())?.trim() ?? '';
    await page.getByTestId('puzzles-auth-continue').click();

    await page.getByTestId('puzzles-age-8-10').click();
    await page.getByTestId('puzzles-start-button').click();
    for (let question = 1; question <= 20; question++) {
      await expect(page.getByText(new RegExp(`Question ${question} of 20`))).toBeVisible();
      await page.getByTestId('puzzles-option').first().click();
    }
    await expect(page.getByTestId('puzzles-points-earned')).toBeVisible();

    await page.getByTestId('puzzles-choose-age-group').click();
    await page.getByTestId('puzzles-my-scores').click();
    await page.getByTestId('puzzles-sign-out').click();

    await page.getByTestId('puzzles-sign-in').click();
    await page.getByTestId('puzzles-auth-signin-tab').click();
    await page.getByLabel('Username', { exact: true }).fill(username);
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByTestId('puzzles-auth-signin-submit').click();

    await page.getByTestId('puzzles-my-scores').click();
    await expect(page.getByTestId('puzzles-profile-results').getByRole('row')).toHaveCount(2);
  });
});
