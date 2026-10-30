import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

const TODOS = ['Buy milk', 'Walk the dog', 'Write tests'];

test.describe('TodoMVC', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('adds 3 todos', async () => {
    await todoPage.addTodos(TODOS);

    await expect(todoPage.todoItems).toHaveCount(3);
    await expect(todoPage.todoItems).toHaveText(TODOS);
  });

  test.describe('with 3 todos', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(TODOS);
    });

    test('completing one shows "2 items left"', async () => {
      await todoPage.toggle(TODOS[0]);

      await expect(todoPage.itemsLeft).toHaveText('2 items left');
    });

    test('Active and Completed filters show the right items', async () => {
      await todoPage.toggle(TODOS[0]);

      await todoPage.filter('Active');
      await expect(todoPage.todoItems).toHaveText([TODOS[1], TODOS[2]]);

      await todoPage.filter('Completed');
      await expect(todoPage.todoItems).toHaveText([TODOS[0]]);

      await todoPage.filter('All');
      await expect(todoPage.todoItems).toHaveText(TODOS);
    });

    test('editing a todo by double-click updates its text', async () => {
      await todoPage.edit(TODOS[1], 'Walk the cat');

      await expect(todoPage.todoItems).toHaveText([TODOS[0], 'Walk the cat', TODOS[2]]);
      await expect(todoPage.todo(TODOS[1])).toHaveCount(0);
    });

    test('deleting a todo removes it', async () => {
      await todoPage.delete(TODOS[1]);

      await expect(todoPage.todoItems).toHaveCount(2);
      await expect(todoPage.todo(TODOS[1])).toHaveCount(0);
      await expect(todoPage.itemsLeft).toHaveText('2 items left');
    });

    test('Clear completed removes only the completed todos', async () => {
      await todoPage.toggle(TODOS[0]);
      await todoPage.toggle(TODOS[2]);

      await todoPage.clearCompleted();

      await expect(todoPage.todoItems).toHaveText([TODOS[1]]);
      await expect(todoPage.clearCompletedButton).toBeHidden();
    });
  });

  test.describe('data-driven: adding different kinds of text', () => {
    const cases = [
      { name: 'simple text', input: 'Pay rent', expected: 'Pay rent' },
      { name: 'unicode and emoji', input: 'Café ☕ 🎉', expected: 'Café ☕ 🎉' },
      { name: 'long text', input: 'A'.repeat(100), expected: 'A'.repeat(100) },
      { name: 'surrounding spaces (trimmed)', input: '   Trim me   ', expected: 'Trim me' },
    ];

    for (const { name, input, expected } of cases) {
      test(`adds a todo with ${name}`, async () => {
        await todoPage.addTodo(input);

        await expect(todoPage.todoItems).toHaveText([expected]);
        await expect(todoPage.itemsLeft).toHaveText('1 item left');
      });
    }
  });
});
