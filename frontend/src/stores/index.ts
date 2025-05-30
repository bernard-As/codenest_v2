// frontend/src/stores/index.ts
import UIStore from './UIStore';
import AuthStore from './AuthStore';
import ProjectStore from './ProjectStore'; // Import it

export const uiStore = new UIStore();
export const authStore = new AuthStore();
export const projectStore = new ProjectStore(); // Instantiate and export