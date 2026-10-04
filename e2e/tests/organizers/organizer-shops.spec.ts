import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

test.describe('organizer shops', () => {
  test('live shops are listed by category and open the shop page without event dates', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Shop Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    const uniformShop = await api.createShop({
      organizer_id: organizer.id,
      title: 'Smart Uniforms Ltd',
      shop_category: 'UNIFORM',
      vendor_type: 'EXTERNAL',
    });
    const prelovedShop = await api.createShop({
      organizer_id: organizer.id,
      title: 'PTA Preloved',
      shop_category: 'PRELOVED_UNIFORM',
      vendor_type: 'PTA',
    });
    await api.publishEvent(uniformShop.id);
    await api.publishEvent(prelovedShop.id);

    await page.goto(`/events/${organizer.id}/${organizer.slug}/shop`);

    await expect(page.getByTestId('shop-section-uniform').getByText('Smart Uniforms Ltd')).toBeVisible();
    await expect(page.getByTestId('shop-section-preloved_uniform').getByText('PTA Preloved')).toBeVisible();

    await page.getByTestId('shop-section-uniform').getByText('Smart Uniforms Ltd').click();

    await expect(page.getByRole('heading', { name: 'Smart Uniforms Ltd' })).toBeVisible();
    await expect(page.getByText('Collect from school reception')).toBeVisible();
    await expect(page.getByText('Add to Calendar')).toHaveCount(0);
  });

  test('a second school meals vendor is rejected', async ({ api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Meals Org'));

    await api.createShop({
      organizer_id: organizer.id,
      title: 'Canteen One',
      shop_category: 'MEALS',
      vendor_type: 'EXTERNAL',
    });

    await expect(
      api.createShop({
        organizer_id: organizer.id,
        title: 'Canteen Two',
        shop_category: 'MEALS',
        vendor_type: 'EXTERNAL',
      }),
    ).rejects.toThrow(/422/);
  });
});
