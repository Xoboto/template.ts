import { TemplateBinder } from '../src/template.js';

interface User {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface UsersState {
  users: User[];
  editUser: (e: Event, user: User, index: number) => void;
  deleteUser: (e: Event, user: User, index: number) => void;
}

// Example 6: User Cards with Complex Data
const state6: UsersState = {
  users: [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', active: true },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', active: false }
  ],
  editUser: function(this: UsersState, e: Event, user: User, index: number): void {
    const newName = prompt('Enter new name:', user.name);
    if (newName) {
      this.users[index].name = newName;
      binder6.update();
    }
  },
  deleteUser: function(this: UsersState, e: Event, user: User, index: number): void {
    if (confirm(`Delete user ${user.name}?`)) {
      this.users.splice(index, 1);
      binder6.update();
    }
  }
};

const binder6 = new TemplateBinder('#example6', state6);
binder6.bind();
