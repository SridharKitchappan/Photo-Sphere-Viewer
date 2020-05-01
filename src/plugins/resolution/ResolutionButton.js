import { AbstractButton, utils } from 'photo-sphere-viewer';
import ResolutionPlugin from './index';
import icon from './resolution.svg';

/**
 * @summary Navigation bar stereo button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */
export class ResolutionButton extends AbstractButton {

  static id = 'resolution';
  static icon = icon;

  /**
   * @param {PSV.components.Navbar} navbar
   */
  constructor(navbar) {
    super(navbar, 'psv-button--hover-scale psv-resolution-button', true);

    /**
     * @type {PSV.plugins.ResolutionPlugin}
     * @private
     * @readonly
     */
    this.plugin = this.psv.getPlugin(ResolutionPlugin.id);

    this.value = document.createElement('span');
    this.value.className = 'psv-resolution-button-value';
    this.container.appendChild(this.value);

    this.menu = document.createElement('ul');
    this.menu.className = 'psv-resolutions-list';
    this.container.appendChild(this.menu);

    this.menu.addEventListener('click', this);

    if (this.plugin) {
      this.plugin.on(ResolutionPlugin.EVENTS.RESOLUTION_CHANGED, this);
      this.__buildMenu();
    }
  }

  /**
   * @override
   */
  destroy() {
    if (this.plugin) {
      this.plugin.off(ResolutionPlugin.EVENTS.RESOLUTION_CHANGED, this);
    }

    delete this.plugin;

    super.destroy();
  }

  /**
   * @override
   */
  isSupported() {
    return !!this.plugin;
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    if (e.type === ResolutionPlugin.EVENTS.RESOLUTION_CHANGED) {
      this.__updateResolution(e.args[0]);
    }
    else if (e.type === 'click') {
      this.__onClickItem(e.target);
    }
  }

  /**
   * @override
   * @description Toggles stereo control
   */
  onClick() {
    utils.toggleClass(this.menu, 'psv-resolutions-list--open');
  }

  __buildMenu() {
    this.menu.innerHTML = Object.keys(this.plugin.resolutions)
      .map(id => `<li data-psv-resolution="${id}" class="psv-resolutions-list-item">${this.plugin.resolutions[id].name}</li>`)
      .join('');
  }

  __updateResolution(id) {
    this.value.innerHTML = id;

    this.menu.querySelectorAll('.psv-resolutions-list-item').forEach((item) => {
      utils.toggleClass(item, 'psv-resolutions-list-item--active', item.dataset.psvResolution === id);
    });
  }

  __onClickItem(item) {
    const li = item && utils.getClosest(item, 'li');
    if (li && li.dataset.psvResolution) {
      this.plugin.setResolution(li.dataset.psvResolution);
    }
  }

}
