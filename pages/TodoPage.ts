import { type Page, type Locator } from '@playwright/test';

export type Filter = 'All' | 'Active' | 'Completed';

/**
 * Page Object for the TodoMVC demo app (https://demo.playwright.dev/todomvc).
 * Holds the locators and user actions only — assertions live in the tests.
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly itemsLeft: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    // The filter links are list items too, so keep only the items that have a toggle checkbox.
    this.todoItems = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('checkbox', { name: 'Toggle Todo' }) });
    this.itemsLeft = page.getByText(/items? left/);
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    // Relative to baseURL, so the /todomvc/ path is kept.
    await this.page.goto('./');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(texts: string[]) {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  todo(text: string): Locator {
    return this.todoItems.filter({ hasText: text });
  }

  async toggle(text: string) {
    await this.todo(text).getByRole('checkbox', { name: 'Toggle Todo' }).check();
  }

  async edit(oldText: string, newText: string) {
    await this.todo(oldText).getByText(oldText).dblclick();
    // In edit mode the item no longer shows its text, and only one item can be edited at a time,
    // so look the edit box up on the page instead of inside the item.
    const editBox = this.page.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.press('Enter');
  }

  async delete(text: string) {
    const item = this.todo(text);
    // The Delete button only appears on hover.
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();
  }

  async filter(name: Filter) {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  async clearCompleted() {
    await this.clearCompletedButton.click();
  }
}
