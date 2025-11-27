import './data-table.js';
import { DataTable } from './data-table.js';

// Example: Employee Management Table
const employeeTable = new DataTable();
document.getElementById('employee-table')?.appendChild(employeeTable);

// Configure columns
employeeTable.setColumns([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'position', label: 'Position' },
  { key: 'salary', label: 'Salary' },
  { key: 'startDate', label: 'Start Date' }
]);

// Sample employee data
employeeTable.setData([
  { id: 1, name: 'John Doe', department: 'Engineering', position: 'Senior Developer', salary: '$95,000', startDate: '2020-01-15' },
  { id: 2, name: 'Jane Smith', department: 'Marketing', position: 'Marketing Manager', salary: '$85,000', startDate: '2019-03-22' },
  { id: 3, name: 'Mike Johnson', department: 'Engineering', position: 'DevOps Engineer', salary: '$90,000', startDate: '2021-06-10' },
  { id: 4, name: 'Sarah Williams', department: 'HR', position: 'HR Director', salary: '$100,000', startDate: '2018-09-05' },
  { id: 5, name: 'Tom Brown', department: 'Sales', position: 'Sales Representative', salary: '$70,000', startDate: '2022-02-18' },
  { id: 6, name: 'Emily Davis', department: 'Engineering', position: 'Frontend Developer', salary: '$88,000', startDate: '2021-11-30' },
  { id: 7, name: 'David Wilson', department: 'Finance', position: 'Financial Analyst', salary: '$82,000', startDate: '2020-07-12' },
  { id: 8, name: 'Lisa Anderson', department: 'Marketing', position: 'Content Writer', salary: '$65,000', startDate: '2022-04-25' }
]);

// Example: Product Inventory Table
const productTable = new DataTable();
document.getElementById('product-table')?.appendChild(productTable);

productTable.setColumns([
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' }
]);

productTable.setData([
  { sku: 'LAPTOP-001', name: 'MacBook Pro 16"', category: 'Electronics', price: '$2,499', stock: 45, status: 'In Stock' },
  { sku: 'PHONE-002', name: 'iPhone 15 Pro', category: 'Electronics', price: '$999', stock: 120, status: 'In Stock' },
  { sku: 'DESK-003', name: 'Standing Desk', category: 'Furniture', price: '$599', stock: 8, status: 'Low Stock' },
  { sku: 'CHAIR-004', name: 'Ergonomic Chair', category: 'Furniture', price: '$449', stock: 0, status: 'Out of Stock' },
  { sku: 'MOUSE-005', name: 'Wireless Mouse', category: 'Accessories', price: '$79', stock: 250, status: 'In Stock' },
  { sku: 'KEYBOARD-006', name: 'Mechanical Keyboard', category: 'Accessories', price: '$149', stock: 95, status: 'In Stock' },
  { sku: 'MONITOR-007', name: '27" 4K Monitor', category: 'Electronics', price: '$699', stock: 32, status: 'In Stock' },
  { sku: 'HEADPHONE-008', name: 'Noise Cancelling Headphones', category: 'Accessories', price: '$299', stock: 3, status: 'Low Stock' }
]);

// Example: Simple users table with minimal features
const userTable = new DataTable();
document.getElementById('user-table')?.appendChild(userTable);

userTable.setColumns([
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'lastLogin', label: 'Last Login' }
]);

userTable.setData([
  { username: 'admin', email: 'admin@example.com', role: 'Administrator', lastLogin: '2025-11-24 10:30' },
  { username: 'johndoe', email: 'john@example.com', role: 'User', lastLogin: '2025-11-23 15:45' },
  { username: 'janedoe', email: 'jane@example.com', role: 'Editor', lastLogin: '2025-11-24 09:15' },
  { username: 'mikebrown', email: 'mike@example.com', role: 'User', lastLogin: '2025-11-22 18:20' },
  { username: 'sarahwhite', email: 'sarah@example.com', role: 'Moderator', lastLogin: '2025-11-24 11:00' }
]);

userTable.setSearchable(false); // Disable search for this table
userTable.setShowFooter(false); // Hide footer

// Empty table example
const emptyTable = new DataTable();
document.getElementById('empty-table')?.appendChild(emptyTable);

emptyTable.setColumns([
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value' }
]);

emptyTable.setData([]); // No data
emptyTable.setEmptyMessage('No records found. Please add some data.');
