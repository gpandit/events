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

  test('the shop link is hidden until a shop is published', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Hidden Shop Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');
    const shop = await api.createShop({
      organizer_id: organizer.id,
      title: 'Draft Uniforms',
      shop_category: 'UNIFORM',
      vendor_type: 'SCHOOL',
    });

    await page.goto(`/events/${organizer.id}/${organizer.slug}/about`);
    await expect(page.getByRole('link', { name: 'Shop', exact: true })).toHaveCount(0);

    await api.publishEvent(shop.id);

    await page.goto(`/events/${organizer.id}/${organizer.slug}/about`);
    await expect(page.getByRole('link', { name: 'Shop', exact: true }).first()).toBeVisible();
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
  test('sizes with a regular price show the sale price crossed out on the shop page', async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Sizes Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');
    const shop = await api.createShop({
      organizer_id: organizer.id,
      title: 'Sizes Uniforms',
      shop_category: 'UNIFORM',
      vendor_type: 'SCHOOL',
    });
    const [category] = await api.listProductCategories(shop.id);

    await api.createProduct(shop.id, {
      title: 'Football T-Shirt',
      product_type: 'GENERAL',
      type: 'TIERED',
      product_category_id: Number(category.id),
      prices: [
        { price: 39, compare_at_price: 49, label: 'Age 5-6', initial_quantity_available: 10 },
        { price: 39, compare_at_price: 49, label: 'Age 7-8', initial_quantity_available: 10 },
      ],
    });
    await api.publishEvent(shop.id);

    await page.goto(`/events/${shop.id}/sizes-uniforms`);

    await page.getByText('Football T-Shirt').click();
    await expect(page.getByText('Age 5-6')).toBeVisible();
    await expect(page.getByText('Age 7-8')).toBeVisible();
    await expect(page.locator('.hi-price-strike').first()).toContainText('49');
  });

  test('a regular price at or below the price is rejected', async ({ api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Bad Compare Org'));
    const shop = await api.createShop({
      organizer_id: organizer.id,
      title: 'Compare Shop',
      shop_category: 'UNIFORM',
      vendor_type: 'SCHOOL',
    });
    const [category] = await api.listProductCategories(shop.id);

    await expect(
      api.createProduct(shop.id, {
        title: 'Blazer',
        product_type: 'GENERAL',
        type: 'PAID',
        product_category_id: Number(category.id),
        prices: [{ price: 50, compare_at_price: 40 }],
      }),
    ).rejects.toThrow(/422/);
  });
});
