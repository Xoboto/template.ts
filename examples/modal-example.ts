import { TemplateBinder } from '../src/template';
import { ModalDemo } from './modal-demo';

// Define the state for the example
class AppState {
    messages: string[] = [];
    formData: { name: string; email: string } = { name: '', email: '' };

    showSimpleModal = (): void => {
        const modal = document.querySelector('modal-demo#simpleModal') as ModalDemo;
        modal.openModal({
            title: 'Simple Modal',
            confirmText: 'OK',
            onConfirm: () => {
                this.messages.push('Simple modal confirmed at ' + new Date().toLocaleTimeString());
                this.binder.update();
            }
        });
    };

    showConfirmModal = (): void => {
        const modal = document.querySelector('modal-demo#confirmModal') as ModalDemo;
        modal.openModal({
            title: 'Confirm Action',
            confirmText: 'Yes, Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.messages.push('❌ Item deleted at ' + new Date().toLocaleTimeString());
                this.binder.update();
            },
            onCancel: () => {
                this.messages.push('✅ Deletion cancelled');
                this.binder.update();
            }
        });
    };

    showFormModal = (): void => {
        const modal = document.querySelector('modal-demo#formModal') as ModalDemo;
        modal.openModal({
            title: 'User Information',
            confirmText: 'Submit',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.messages.push(`📝 Form submitted: ${this.formData.name} (${this.formData.email})`);
                this.formData = { name: '', email: '' };
                this.binder.update();
            }
        });
    };

    showNonCloseableModal = (): void => {
        const modal = document.querySelector('modal-demo#nonCloseableModal') as ModalDemo;
        let countdown = 3;
        this.messages.push('⏳ Wait 3 seconds...');
        this.binder.update();

        modal.openModal({
            title: 'Please Wait...',
            closeable: false,
            showFooter: false
        });

        const interval = setInterval(() => {
            countdown--;
            if (countdown === 0) {
                clearInterval(interval);
                modal.closeModal();
                this.messages.push('✅ Modal auto-closed');
                this.binder.update();
            }
        }, 1000);
    };

    clearMessages = (): void => {
        this.messages = [];
        this.binder.update();
    };

    updateName = (e: Event): void => {
        this.formData.name = (e.target as HTMLInputElement).value;
    };

    updateEmail = (e: Event): void => {
        this.formData.email = (e.target as HTMLInputElement).value;
    };

    // Reference to binder for updates
    binder!: TemplateBinder;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    const binder = new TemplateBinder('#modal-example-app', state);
    state.binder = binder;
    binder.bind();
    binder.autoUpdate = true;
});
