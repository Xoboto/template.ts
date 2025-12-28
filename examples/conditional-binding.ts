import { TemplateBinder } from '../src/template';

// Test case for hierarchical binding with @if
class AppState {
    user: { fullname: string } | null = null;
    loading: boolean = true;
    error: string | null = null;

    loadUser = (): void => {
        this.loading = true;
        this.error = null;
        this.user = null;
        this.binder.update();

        // Simulate API call
        setTimeout(() => {
            this.loading = false;
            this.user = {
                fullname: 'John Doe'
            };
            this.binder.update();
        }, 1000);
    };

    clearUser = (): void => {
        this.user = null;
        this.loading = false;
        this.error = null;
        this.binder.update();
    };

    simulateError = (): void => {
        this.loading = true;
        this.error = null;
        this.user = null;
        this.binder.update();

        setTimeout(() => {
            this.loading = false;
            this.error = 'Failed to load user data';
            this.binder.update();
        }, 1000);
    };

    binder!: TemplateBinder;
}

document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    const binder = new TemplateBinder('#conditional-binding-app', state);
    state.binder = binder;
    binder.bind();
    binder.autoUpdate = true;
});
