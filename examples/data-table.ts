import { TemplateBinder } from '../src/template.js';

const template = /*html*/`
<div class="data-table">
    <div class="table-header">
        <input 
            type="text" 
            placeholder="Search..." 
            @on:input="handleSearch"
            class="search-input"
            @if="searchable"
        />
        <slot name="actions"></slot>
    </div>
    
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th @for="columns" @on:click="handleSort">
                        {{ item.label }}
                        <span class="sort-indicator" @if="sortColumn === item.key">
                            {{ sortDirection === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr @for="filteredData" @on:click="handleRowClick">
                    <td @for="columns">
                        {{ getValue(parent, item.key) }}
                    </td>
                </tr>
                <tr @if="filteredData.length === 0">
                    <td @att:colspan="columns.length" class="no-data">
                        {{ emptyMessage }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="table-footer" @if="showFooter">
        <span>Showing {{ filteredData.length }} of {{ data.length }} items</span>
    </div>
</div>`;

interface Column {
    key: string;
    label: string;
}

class State {
    columns: Column[] = [];
    data: any[] = [];
    filteredData: any[] = [];
    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    searchTerm: string = '';
    searchable: boolean = true;
    showFooter: boolean = true;
    emptyMessage: string = 'No data available';

    handleSearch: (event: Event) => void = (event) => {
        const target = event.target as HTMLInputElement;
        this.searchTerm = target.value.toLowerCase();
        this.filterData();
    };

    handleSort: (event: Event, column: Column) => void = (event, column) => {
        if (this.sortColumn === column.key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column.key;
            this.sortDirection = 'asc';
        }
        this.sortData();
    };

    getValue: (row: any, key: string) => string = (row, key) => {
        const value = key.split('.').reduce((obj, k) => obj?.[k], row);
        return value !== undefined && value !== null ? String(value) : '';
    };

    filterData() {
        if (!this.searchTerm) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(row =>
                this.columns.some(col => {
                    const value = this.getValue(row, col.key);
                    return value.toLowerCase().includes(this.searchTerm);
                })
            );
        }
        this.sortData();
    }

    sortData() {
        if (!this.sortColumn) return;

        this.filteredData.sort((a, b) => {
            const aVal = this.getValue(a, this.sortColumn);
            const bVal = this.getValue(b, this.sortColumn);
            
            const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    setColumns(columns: Column[]) {
        this.columns = columns;
    }

    setData(data: any[]) {
        this.data = data;
        this.filterData();
        this.sortData();
    }

    setSearchable(searchable: boolean) {
        this.searchable = searchable;
    }

    setShowFooter(show: boolean) {
        this.showFooter = show;
    }

    setEmptyMessage(message: string) {
        this.emptyMessage = message;
    }
}

export class DataTable extends HTMLElement {
    binder: TemplateBinder;
    state: State;

    constructor() {
        super();
        this.innerHTML = template;
        this.state = new State();
        this.binder = new TemplateBinder(this, this.state);
        this.binder.bind();
        this.binder.autoUpdate = true;
    }

    connectedCallback(): void {
        // Initial setup if needed
    }

    setColumns(columns: Column[]): void {
        this.state.setColumns(columns);
        this.binder.update();
    }

    setData(data: any[]): void {
        this.state.setData(data);
        this.binder.update();
    }

    setSearchable(searchable: boolean): void {
        this.state.setSearchable(searchable);
        this.binder.update();
    }

    setShowFooter(show: boolean): void {
        this.state.setShowFooter(show);
        this.binder.update();
    }

    setEmptyMessage(message: string): void {
        this.state.setEmptyMessage(message);
        this.binder.update();
    }
}

if (!customElements.get('data-table')) {
    customElements.define('data-table', DataTable);
}
