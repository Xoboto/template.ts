import { TemplateBinder } from '../src/template.js';

const template = /*html*/`
<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow: auto;
    }
    
    .modal-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-close:hover {
        color: #111827;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }
    
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
    }
    
    .btn-primary {
        background: #3b82f6;
        color: white;
    }
    
    .btn-primary:hover {
        background: #2563eb;
    }
    
    .btn-secondary {
        background: white;
        color: #374151;
        border-color: #d1d5db;
    }
    
    .btn-secondary:hover {
        background: #f9fafb;
    }
</style>

<div class="modal-overlay" @if="isOpen" @on:click="handleOverlayClick">
    <div class="modal-container" @on:click="handleContainerClick">
        <div class="modal-header">
            <h2>{{ title }}</h2>
            <button class="modal-close" @on:click="close" @if="closeable">×</button>
        </div>
        <div class="modal-body">
            <slot></slot>
        </div>
        <div class="modal-footer" @if="showFooter">
            <button @on:click="handleCancel" class="btn btn-secondary" @if="cancelText">{{ cancelText }}</button>
            <button @on:click="handleConfirm" class="btn btn-primary" @if="confirmText">{{ confirmText }}</button>
        </div>
    </div>
</div>`;

class State {
    isOpen: boolean = false;
    title: string = '';
    closeable: boolean = true;
    showFooter: boolean = true;
    confirmText: string = '';
    cancelText: string = '';
    
    onConfirm: (() => void) | null = null;
    onCancel: (() => void) | null = null;

    handleOverlayClick: () => void = () => {
        if (this.closeable) {
            this.isOpen = false;
        }
    };

    handleContainerClick: (event: Event) => void = (event) => {
        event.stopPropagation();
    };

    handleConfirm: () => void = () => {
        if (this.onConfirm) {
            this.onConfirm();
        }
        this.isOpen = false;
    };

    handleCancel: () => void = () => {
        if (this.onCancel) {
            this.onCancel();
        }
        this.isOpen = false;
    };

    close: () => void = () => {
        this.isOpen = false;
    };
}

export class ModalDemo extends HTMLElement {
    binder: TemplateBinder;
    state: State;

    constructor() {
        super();
        this.state = new State();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = template;
        this.binder = new TemplateBinder(shadowRoot, this.state);
        this.binder.bind();
        this.binder.autoUpdate = true;
    }

    openModal(options: {
        title: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        closeable?: boolean;
        showFooter?: boolean;
    }): void {
        this.state.title = options.title;
        this.state.confirmText = options.confirmText || '';
        this.state.cancelText = options.cancelText || '';
        this.state.onConfirm = options.onConfirm || null;
        this.state.onCancel = options.onCancel || null;
        this.state.closeable = options.closeable !== undefined ? options.closeable : true;
        this.state.showFooter = options.showFooter !== undefined ? options.showFooter : true;
        this.state.isOpen = true;
        this.binder.update();
    }

    closeModal(): void {
        this.state.isOpen = false;
        this.binder.update();
    }
}

if (customElements.get('modal-demo') === undefined) {
    customElements.define('modal-demo', ModalDemo);
}