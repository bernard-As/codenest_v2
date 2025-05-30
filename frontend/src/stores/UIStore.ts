// frontend/src/stores/UIStore.ts
import { makeAutoObservable } from 'mobx'; // No runInAction needed if makeAutoObservable is used correctly for methods

type Theme = 'light' | 'dark';

class UIStore {
  theme: Theme = (localStorage.getItem('theme') as Theme) || 'light';

  constructor() {
    // makeAutoObservable will automatically make methods actions,
    // properties observables, and getters computed.
    makeAutoObservable(this, {}, { autoBind: true }); // autoBind can be helpful
    this.applyTheme();
  }

  // This method implicitly reads `this.theme` and then modifies it.
  // makeAutoObservable should correctly identify this as an action.
  toggleTheme = (): void => {
    // The read of this.theme happens here
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  // Similar to toggleTheme, reads and modifies this.theme
  setTheme = (newTheme: Theme): void => {
    this.theme = newTheme;
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  // This method only applies the theme, doesn't modify MobX state directly
  applyTheme = (): void => {
    const root = window.document.documentElement;
    root.classList.remove(this.theme === 'light' ? 'dark' : 'light');
    root.classList.add(this.theme);
  }
}

export default UIStore;