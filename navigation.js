(function () {
  'use strict';

  const viewGroups = {
    today: 'today',
    library: 'learn',
    pathway: 'learn',
    foundations: 'learn',
    scenarios: 'learn',
    market: 'learn',
    quiz: 'practice',
    listening: 'practice',
    diagnostic: 'personal',
    report: 'personal',
    favorites: 'personal',
    progress: 'personal',
  };
  const lastView = { learn: 'pathway', personal: 'progress' };
  const primaryButtons = [...document.querySelectorAll('[data-nav-group]')];
  const contextMenus = {
    learn: document.getElementById('learnNavigation'),
    personal: document.getElementById('personalNavigation'),
    practice: document.getElementById('practiceNavigation'),
  };

  // Called by setView so links inside lessons and practice also update the shell.
  window.syncNavigation = function (viewName) {
    const group = viewGroups[viewName];
    if (!group) return;
    if (group in lastView) lastView[group] = viewName;

    primaryButtons.forEach((button) => {
      const current = button.dataset.navGroup === group;
      button.classList.toggle('active', current);
      if (current) button.setAttribute('aria-current', button.dataset.view ? 'page' : 'true');
      else button.removeAttribute('aria-current');
    });
    Object.entries(contextMenus).forEach(([name, menu]) => {
      menu.hidden = name !== group;
      menu.querySelectorAll('[data-view]').forEach((button) => {
        const current = button.dataset.view === viewName;
        button.classList.toggle('active', current);
        if (current) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
    });
  };

  primaryButtons.filter((button) => !button.dataset.view).forEach((button) => {
    button.addEventListener('click', () => window.setView(lastView[button.dataset.navGroup]));
  });

  // Native buttons retain Tab/Enter/Space behavior; arrow keys are a shortcut.
  document.querySelectorAll('.primary-navigation, .context-navigation').forEach((nav) => {
    nav.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const buttons = [...nav.querySelectorAll('button')];
      const current = buttons.indexOf(event.target);
      if (current < 0) return;
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    });
  });

  const initialView = document.querySelector('.view.active');
  window.syncNavigation(initialView ? initialView.id.replace('view-', '') : 'today');
})();
