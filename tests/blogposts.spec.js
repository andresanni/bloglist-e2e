const { test, expect, beforeEach, describe } = require('@playwright/test');
const helper = require('./helper');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');

    await request.post('/api/users', {
      data: {
        username: 'toto',
        name: 'tobias',
        password: 'manuel',
      },
    });

    await request.post('/api/users', {
      data: {
        username: 'kuni',
        name: 'sergio',
        password: 'aguero',
      },
    });
    await page.goto('/');
  });

  test('login form is shown', async ({ page }) => {
    const locator = await page.getByText('username');
    await expect(locator).toBeVisible();
  });

  describe('first user is logged in', () => {
    beforeEach(async ({ page }) => {
      await helper.loginWith(page, 'toto', 'manuel');
    });

    test('logged user is displayed once logged in', async ({ page }) => {
      await expect(page.getByText('tobias is logged in')).toBeVisible();
    });

    describe('and two blogs are created', () => {
      beforeEach(async ({ page }) => {
        await helper.createBlogPost(
          page,
          'First from playwright',
          'www.pepe.com'
        );
        await helper.createBlogPost(
          page,
          'Second from playwright',
          'www.pepito.com'
        );
      });

      test('second blogpost can be liked', async ({ page }) => {
        const expandedBlogPost = await helper.expandedBlogPost(
          page,
          'Second from playwright'
        );

        const previousLikesElement = await expandedBlogPost.getByTestId(
          'likes'
        );
        const previousLikesText = await previousLikesElement.textContent();
        const previousLikes = Number(previousLikesText);
        const likeButton = expandedBlogPost.getByRole('button', {
          name: 'like',
        });
        await likeButton.click();

        await page.waitForTimeout(500);

        const currentLikesElement = await expandedBlogPost.getByTestId('likes');
        const currentLikesText = await currentLikesElement.textContent();
        const currentLikes = Number(currentLikesText);

        await expect(previousLikes + 1).toBe(currentLikes);
      });

      test('a user can delete their own post', async ({ page }) => {
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });

        const expandedBlogPost = await helper.expandedBlogPost(
          page,
          'First from playwright'
        );
        const deleteButton = expandedBlogPost.getByRole('button', {
          name: 'Delete',
        });
        await deleteButton.click();
        await page.waitForTimeout(500);

        await expect(page.getByText('First from playwright')).not.toBeVisible();
      });

      test('blogs are sorted by likes', async ({ page }) => {
        const expandedFirstBlogPost = await helper.expandedBlogPost(
          page,
          'First from playwright'
        );
        const expandedSecondBlogPost = await helper.expandedBlogPost(
          page,
          'Second from playwright'
        );

        for (let i = 0; i < 5; i++) {
          await helper.likePost(expandedFirstBlogPost);
          await page.waitForTimeout(100);
        }
        for (let i = 0; i < 9; i++) {
          await helper.likePost(expandedSecondBlogPost);
          await page.waitForTimeout(100);
        }

        const titleElements = await page.getByTestId('blogpost').all();
        expect(titleElements[0]).toContainText('Second from playwright');
      });
    });
  });

  test('login fails with wrong credentials', async ({ page }) => {
    await helper.loginWith(page, 'toto', 'wrong');
    await expect(page.getByText('wrong credentials')).toBeVisible();
  });

  describe('When logued in with user 2', () => {
    test('cant delete a post created by user 1', async ({ page }) => {
      await helper.loginWith(page, 'toto', 'manuel');
      await helper.createBlogPost(page, 'Post by toto manuel', 'www.pepe.com');
      await helper.logOut(page);

      await helper.loginWith(page, 'kuni', 'aguero');
      const expandedBlogPost = await helper.expandedBlogPost(
        page,
        'Post by toto manuel'
      );
      const deleteButton = await expandedBlogPost.getByRole('button', {
        name: ' Delete',
      });

      await expect(deleteButton).not.toBeVisible();
    });
  });
});
