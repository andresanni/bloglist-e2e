const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  const loginButton = await page.getByRole('button', { name: 'Login' });
  await loginButton.click();
};

const logOut = async (page) => {
  const logOutButton = await page.getByRole('button', { name: 'logout' });
  await logOutButton.click();
};

const createBlogPost = async (page, title, url) => {
  const createNewButton = await page.getByRole('button', {
    name: 'wirte a blogpost',
  });
  await createNewButton.click();

  const titleInput = await page.getByTestId('title-input');
  const urlInput = await page.getByTestId('url-input');
  await titleInput.fill(title);
  await urlInput.fill(url);

  const createButton = await page.getByRole('button', { name: 'create' });
  await createButton.click();

  await page.getByText(title).waitFor();
};

const expandedBlogPost = async (page, blogPostTitle) => {
  const BlogItemTitle = await page.getByText(blogPostTitle);
  const BlogItem = await BlogItemTitle.locator('..');
  const viewButton = await BlogItem.getByRole('button', {
    name: 'view',
  });

  await viewButton.click();

  const expandedBlogItemTitle = await page.getByText(blogPostTitle);
  const expandedBlogItem = await expandedBlogItemTitle
    .locator('..')
    .locator('..');

  return expandedBlogItem;
};

const likePost = async (expandedBlogPost) => {
  const likeButton = expandedBlogPost.getByRole('button', {
    name: 'like',
  });
  await likeButton.click();
};

module.exports = {
  loginWith,
  createBlogPost,
  expandedBlogPost,
  logOut,
  likePost,
};
