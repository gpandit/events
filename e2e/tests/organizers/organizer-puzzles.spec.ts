import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

test.describe('organizer puzzles page', () => {
  test('a visitor picks an age group and starts the general knowledge test', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/puzzles`);

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

    await page.goto(`/events/${organizer.id}/${organizer.slug}/puzzles`);
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
    await page.getByLabel('Email', { exact: true }).fill(`player-${Date.now()}@example.com`);
    await page.getByTestId('puzzles-signup-age-14-17').click();
    await page.getByTestId('puzzles-username-option').first().click();
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByTestId('puzzles-auth-signup-submit').click();

    const username = (await page.getByTestId('puzzles-new-username').textContent())?.trim() ?? '';
    expect(username).toMatch(/^[A-Za-z]+\d{2,3}$/);
    await page.getByTestId('puzzles-auth-continue').click();

    await expect(page.getByTestId('puzzles-points-earned')).toBeVisible();

    await page.getByTestId('puzzles-leaderboard-age-5-7').click();
    await expect(page.getByTestId('puzzles-leaderboard-row').filter({ hasText: username })).toBeVisible();
  });

  test('a returning child signs in with their username and sees their previous scores', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Return Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/puzzles`);
    await page.getByTestId('puzzles-sign-in').click();
    await page.getByLabel('First name', { exact: true }).fill('Noah');
    await page.getByLabel('Email', { exact: true }).fill(`player-${Date.now()}@example.com`);
    await page.getByTestId('puzzles-signup-age-14-17').click();
    await page.getByTestId('puzzles-username-option').first().click();
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
    await expect(page.getByTestId('puzzles-player-summary')).toContainText(`Hello ${username}`);
    await expect(page.getByTestId('puzzles-high-score')).toBeVisible();
    await expect(page.getByTestId('puzzles-total-score')).toBeVisible();
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

  test('a young child signs up without a parent email and appears on the leaderboard straight away', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Young Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/puzzles`);
    await page.getByTestId('puzzles-sign-in').click();
    await page.getByLabel('First name', { exact: true }).fill('Amelia');
    await page.getByLabel('Email', { exact: true }).fill(`child-${Date.now()}@example.com`);
    await page.getByTestId('puzzles-signup-age-8-10').click();
    await expect(page.getByLabel("Parent or guardian's email")).toHaveCount(0);
    await page.getByTestId('puzzles-username-option').first().click();
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

    await page.getByTestId('puzzles-leaderboard-age-8-10').click();
    await expect(page.getByTestId('puzzles-leaderboard-row').filter({ hasText: username })).toBeVisible();
  });

  test('the old resources puzzles link redirects to the puzzles page', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Redirect Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/resources/puzzles`);

    await expect(page).toHaveURL(new RegExp(`/events/${organizer.id}/${organizer.slug}/puzzles$`));
    await expect(page.getByTestId('puzzles-leaderboard-pane')).toBeVisible();
  });

  test('a child picks their username from ten characters, five at a time', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Puzzles Username Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    await page.goto(`/events/${organizer.id}/${organizer.slug}/puzzles`);
    await page.getByTestId('puzzles-sign-in').click();

    const options = page.getByTestId('puzzles-username-option');
    await expect(options).toHaveCount(5);
    const firstPage = await options.allTextContents();

    await page.getByTestId('puzzles-username-next').click();
    await expect(options).toHaveCount(5);
    const secondPage = await options.allTextContents();
    expect(new Set([...firstPage, ...secondPage]).size).toBe(10);
    await expect(page.getByTestId('puzzles-username-next')).toBeDisabled();

    await options.nth(2).click();
    const chosen = secondPage[2];

    await page.getByLabel('First name', { exact: true }).fill('Amelia');
    await page.getByLabel('Email', { exact: true }).fill(`player-${Date.now()}@example.com`);
    await page.getByTestId('puzzles-signup-age-14-17').click();
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByTestId('puzzles-auth-signup-submit').click();

    await expect(page.getByTestId('puzzles-new-username')).toHaveText(chosen);
  });
});
