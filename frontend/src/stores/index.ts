// frontend/src/stores/index.ts
import UIStore from './UIStore';
import AuthStore from './AuthStore';
import ProjectStore from './ProjectStore'; // Import it
import ChatStore from './ChatStore';

export const uiStore = new UIStore();
export const authStore = new AuthStore();
export const projectStore = new ProjectStore(); // Instantiate and export
export const chatStore = new ChatStore(); // Assuming chatStore is defined in a similar way